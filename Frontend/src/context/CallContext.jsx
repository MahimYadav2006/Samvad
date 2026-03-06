import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { fetchFreshIceServers, getWebRtcIceServers } from "../utils/networkConfig";

const CallContext = createContext();

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within CallProvider");
  }
  return context;
};

export const CallProvider = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const fullUser = useSelector((state) => state.user.user);
  const socket = useSelector((state) => state.user.socket);
  const [isCallActive, setIsCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callType, setCallType] = useState(null); // 'audio' or 'video'
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteUser, setRemoteUser] = useState(null);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Buffer for ICE candidates that arrive before remote description is set
  const iceCandidateBufferRef = useRef([]);
  // Guard against double-answering
  const isAnsweringRef = useRef(false);
  // Track whether an ICE restart has already been attempted for the
  // current peer connection so we don't loop endlessly.
  const iceRestartAttemptedRef = useRef(false);
  // Track the remote peer's specific socket ID for precise message routing.
  const remoteSocketIdRef = useRef(null);
  // Track remote user id in refs to avoid stale state closures in socket callbacks.
  const remoteUserIdRef = useRef(null);
  // Guard against duplicate/late answers for the same local offer.
  const pendingRemoteAnswerRef = useRef(false);
  const incomingCallRef = useRef(null);
  const isCallActiveRef = useRef(false);
  const statsIntervalRef = useRef(null);

  // Current ICE-server config – refreshed before every call via
  // fetchFreshIceServers(), which hits the backend Metered API endpoint.
  const iceServersRef = useRef({ iceServers: getWebRtcIceServers() });

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  useEffect(() => {
    isCallActiveRef.current = isCallActive;
  }, [isCallActive]);

  const ensureVideoElementPlayback = useCallback((videoElement, label) => {
    if (!videoElement) return;

    videoElement.autoplay = true;
    videoElement.playsInline = true;
    const playPromise = videoElement.play?.();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((err) => {
        console.warn(`⚠️ ${label} media playback blocked:`, err?.message || err);
      });
    }
  }, []);

  const extractVideoCodecOrderFromSdp = useCallback((sdp = "") => {
    const rtpMap = new Map();
    const rtpRegex = /a=rtpmap:(\d+)\s+([A-Za-z0-9-]+)\/\d+/g;
    let match = rtpRegex.exec(sdp);
    while (match) {
      rtpMap.set(match[1], match[2]);
      match = rtpRegex.exec(sdp);
    }

    const mLineMatch = sdp.match(/^m=video\s+\d+\s+\S+\s+(.+)$/m);
    if (!mLineMatch?.[1]) return [];

    return mLineMatch[1]
      .trim()
      .split(/\s+/)
      .map((payloadType) => rtpMap.get(payloadType) || payloadType);
  }, []);

  const logSdpSummary = useCallback((description, label) => {
    const sdp = description?.sdp || "";
    const hasAudio = /\nm=audio\s/.test(`\n${sdp}`);
    const hasVideo = /\nm=video\s/.test(`\n${sdp}`);
    const videoCodecOrder = extractVideoCodecOrderFromSdp(sdp);

    console.log(`📄 SDP summary (${label})`, {
      type: description?.type || "unknown",
      hasAudio,
      hasVideo,
      videoCodecOrder,
    });

    return { hasAudio, hasVideo, videoCodecOrder };
  }, [extractVideoCodecOrderFromSdp]);

  const applyVideoCodecPreferences = useCallback((peerConnection) => {
    try {
      const capabilities = window.RTCRtpSender?.getCapabilities?.("video");
      if (!capabilities?.codecs?.length) {
        return;
      }

      const preferred = [];
      const rest = [];
      capabilities.codecs.forEach((codec) => {
        const mime = String(codec.mimeType || "").toLowerCase();
        if (mime.includes("h264") || mime.includes("vp8")) {
          preferred.push(codec);
          return;
        }
        rest.push(codec);
      });

      if (preferred.length === 0) {
        return;
      }

      peerConnection.getTransceivers().forEach((transceiver) => {
        const kind = transceiver?.sender?.track?.kind || transceiver?.receiver?.track?.kind;
        if (kind === "video" && typeof transceiver.setCodecPreferences === "function") {
          transceiver.setCodecPreferences([...preferred, ...rest]);
        }
      });

      console.log("🎞️ Applied codec preference (H264/VP8 prioritized)");
    } catch (err) {
      console.warn("⚠️ Unable to set codec preferences:", err?.message || err);
    }
  }, []);

  const assertLocalTracksBeforeOffer = useCallback((peerConnection, callTypeValue) => {
    const senderTracks = peerConnection
      .getSenders()
      .map((sender) => sender.track)
      .filter(Boolean);

    const hasAudio = senderTracks.some((track) => track.kind === "audio");
    const hasVideo = senderTracks.some((track) => track.kind === "video");

    console.log("📤 Sender tracks before offer:", senderTracks.map((track) => ({
      id: track.id,
      kind: track.kind,
      enabled: track.enabled,
      muted: track.muted,
      readyState: track.readyState,
    })));

    if (!hasAudio) {
      throw new Error("Local audio track is missing before createOffer");
    }
    if (callTypeValue === "video" && !hasVideo) {
      throw new Error("Local video track is missing before createOffer");
    }
  }, []);

  const logPeerStats = useCallback(async (peerConnection, label) => {
    if (!peerConnection || peerConnection.connectionState === "closed") return;

    try {
      const stats = await peerConnection.getStats();
      const outbound = [];
      const inbound = [];
      let selectedPair = null;

      stats.forEach((report) => {
        if (report.type === "transport" && report.selectedCandidatePairId) {
          const pair = stats.get(report.selectedCandidatePairId);
          if (pair) selectedPair = pair;
        }
        if (
          report.type === "candidate-pair" &&
          report.state === "succeeded" &&
          (report.nominated || report.selected)
        ) {
          selectedPair = report;
        }
        if (report.type === "outbound-rtp" && !report.isRemote) {
          outbound.push(report);
        }
        if (report.type === "inbound-rtp" && !report.isRemote) {
          inbound.push(report);
        }
      });

      const senderSummary = peerConnection.getSenders().map((sender) => ({
        trackId: sender.track?.id || null,
        kind: sender.track?.kind || null,
        enabled: sender.track?.enabled ?? null,
        readyState: sender.track?.readyState || null,
      }));
      const receiverSummary = peerConnection.getReceivers().map((receiver) => ({
        trackId: receiver.track?.id || null,
        kind: receiver.track?.kind || null,
        muted: receiver.track?.muted ?? null,
        readyState: receiver.track?.readyState || null,
      }));

      console.log(`📊 [${label}] getSenders:`, senderSummary);
      console.log(`📊 [${label}] getReceivers:`, receiverSummary);
      console.log(
        `📊 [${label}] outbound-rtp:`,
        outbound.map((report) => ({
          id: report.id,
          kind: report.kind || report.mediaType || null,
          packetsSent: report.packetsSent,
          bytesSent: report.bytesSent,
          framesEncoded: report.framesEncoded,
          trackIdentifier: report.trackIdentifier || null,
        }))
      );
      console.log(
        `📊 [${label}] inbound-rtp:`,
        inbound.map((report) => ({
          id: report.id,
          kind: report.kind || report.mediaType || null,
          packetsReceived: report.packetsReceived,
          bytesReceived: report.bytesReceived,
          framesDecoded: report.framesDecoded,
          trackIdentifier: report.trackIdentifier || null,
        }))
      );

      if (selectedPair) {
        console.log(`📊 [${label}] selected ICE pair:`, {
          id: selectedPair.id,
          state: selectedPair.state,
          nominated: selectedPair.nominated,
          localCandidateId: selectedPair.localCandidateId,
          remoteCandidateId: selectedPair.remoteCandidateId,
          currentRoundTripTime: selectedPair.currentRoundTripTime,
          availableOutgoingBitrate: selectedPair.availableOutgoingBitrate,
          bytesSent: selectedPair.bytesSent,
          bytesReceived: selectedPair.bytesReceived,
        });
      }
    } catch (err) {
      console.warn("⚠️ Failed to collect WebRTC stats:", err?.message || err);
    }
  }, []);

  const startStatsLogging = useCallback((peerConnection, label) => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }

    logPeerStats(peerConnection, `${label}:initial`);
    statsIntervalRef.current = setInterval(() => {
      if (!peerConnection || peerConnection.connectionState === "closed") {
        clearInterval(statsIntervalRef.current);
        statsIntervalRef.current = null;
        return;
      }
      logPeerStats(peerConnection, label);
    }, 4000);
  }, [logPeerStats]);

  const stopStatsLogging = useCallback(() => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopStatsLogging();
    };
  }, [stopStatsLogging]);

  const getSdpUfrag = useCallback((description) => {
    const sdp = description?.sdp || "";
    const match = sdp.match(/a=ice-ufrag:([^\r\n]+)/);
    return match ? match[1] : null;
  }, []);

  const addIceCandidateSafely = useCallback(async (peerConnection, candidate) => {
    const remoteUfrag = getSdpUfrag(peerConnection.remoteDescription);
    const candidateUfrag = candidate?.usernameFragment || null;

    // Drop stale candidates from a previous negotiation to avoid "Unknown ufrag".
    if (remoteUfrag && candidateUfrag && remoteUfrag !== candidateUfrag) {
      console.warn(
        `⚠️ Ignoring ICE candidate with mismatched ufrag "${candidateUfrag}" (expected "${remoteUfrag}")`
      );
      return;
    }

    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    console.log("✅ ICE candidate added");
  }, [getSdpUfrag]);

  const queueIceCandidate = useCallback((candidate, reason) => {
    if (!candidate) return;
    iceCandidateBufferRef.current.push(candidate);
    console.log(`📦 Buffering ICE candidate (${reason})`);
  }, []);

  // Helper: flush buffered ICE candidates after remote description is set
  const flushIceCandidateBuffer = useCallback(async (peerConnection) => {
    const buffered = iceCandidateBufferRef.current;
    iceCandidateBufferRef.current = [];
    for (const candidate of buffered) {
      try {
        await addIceCandidateSafely(peerConnection, candidate);
        console.log("✅ Buffered ICE candidate added");
      } catch (error) {
        console.warn("⚠️ Error adding buffered ICE candidate:", error.message);
      }
    }
  }, [addIceCandidateSafely]);

  // Create PeerConnection
  // Accept remoteUserId as a parameter to avoid stale closure over remoteUser state
  const createPeerConnection = (remoteUserId) => {
    // Ensure only one RTCPeerConnection exists for the active call.
    if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== "closed") {
      console.warn("⚠️ Reusing existing RTCPeerConnection");
      return peerConnectionRef.current;
    }

    remoteUserIdRef.current = remoteUserId || remoteUserIdRef.current;
    // Clear ICE candidate buffer for the new connection
    iceCandidateBufferRef.current = [];
    iceRestartAttemptedRef.current = false;

    const peerConnection = new RTCPeerConnection(iceServersRef.current);

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
      console.log(
        "✅ Added local tracks to peer connection:",
        localStreamRef.current.getTracks().map((track) => ({
          id: track.id,
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState,
        }))
      );
    }
    applyVideoCodecPreferences(peerConnection);

    // Handle ICE candidates - use remoteUserId param instead of remoteUser state
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && remoteUserId && socket) {
        socket.emit("call:ice-candidate", {
          to: remoteUserId,
          candidate: event.candidate,
          targetSocketId: remoteSocketIdRef.current || undefined,
        });
      }
    };

    // Handle remote tracks in a cross-browser-safe way (event.streams may be empty).
    peerConnection.ontrack = (event) => {
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }

      const alreadyAdded = remoteStreamRef.current
        .getTracks()
        .some((track) => track.id === event.track.id);
      if (!alreadyAdded) {
        remoteStreamRef.current.addTrack(event.track);
      }

      event.track.onended = () => {
        if (remoteStreamRef.current) {
          remoteStreamRef.current.removeTrack(event.track);
        }
      };

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        ensureVideoElementPlayback(remoteVideoRef.current, "remote");
      }

      console.log("📥 Remote track received:", {
        id: event.track.id,
        kind: event.track.kind,
        muted: event.track.muted,
        readyState: event.track.readyState,
      });
      logPeerStats(peerConnection, "ontrack");
    };

    // Monitor ICE connection state for diagnostics and failure recovery
    peerConnection.oniceconnectionstatechange = () => {
      const state = peerConnection.iceConnectionState;
      console.log("🧊 ICE connection state:", state);
      if (state === "failed") {
        // Attempt a single ICE restart before giving up
        if (!iceRestartAttemptedRef.current && peerConnection.signalingState !== "closed") {
          iceRestartAttemptedRef.current = true;
          pendingRemoteAnswerRef.current = true;
          console.warn("⚠️ ICE failed — attempting ICE restart…");
          peerConnection
            .createOffer({ iceRestart: true })
            .then((offer) => peerConnection.setLocalDescription(offer))
            .then(() => {
              if (remoteUserId && socket) {
                socket.emit("call:ice-restart", {
                  to: remoteUserId,
                  offer: peerConnection.localDescription,
                });
              }
            })
            .catch((err) => {
              console.error("❌ ICE restart failed:", err);
              cleanupCall();
            });
        } else {
          console.error("❌ ICE connection failed — no viable candidate pair found");
          cleanupCall();
        }
      } else if (state === "connected" || state === "completed") {
        console.log("✅ ICE connection established:", state);
      } else if (state === "disconnected") {
        console.warn("⚠️ ICE connection disconnected — may recover");
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log("🔗 Connection state:", peerConnection.connectionState);
      if (peerConnection.connectionState === "connected") {
        startStatsLogging(peerConnection, "call");
      }
      if (
        peerConnection.connectionState === "closed" ||
        peerConnection.connectionState === "failed"
      ) {
        stopStatsLogging();
      }
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  };

  // Get user media (camera/mic)
  const getUserMedia = async (video = true, audio = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 1280, height: 720 } : false,
        audio,
      });
      localStreamRef.current = stream;
      console.log(
        "🎥 Local media tracks acquired:",
        stream.getTracks().map((track) => ({
          id: track.id,
          kind: track.kind,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
        }))
      );
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        ensureVideoElementPlayback(localVideoRef.current, "local");
      }
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  };

  // Initiate a call
  const initiateCall = async (recipient, type = "video") => {
    if (!socket || !user?._id || !recipient?._id) return;
    if (peerConnectionRef.current || isCallActiveRef.current) {
      console.warn("⚠️ Call is already active, ignoring new initiate request");
      return;
    }

    try {
      console.log("🎬 Initiating call to:", recipient);
      console.log("Call type:", type);
      console.log("Current user:", user);

      setCallType(type);
      setRemoteUser(recipient);
      setIsCallActive(true);
      isCallActiveRef.current = true;
      remoteUserIdRef.current = recipient._id;
      remoteSocketIdRef.current = null;
      pendingRemoteAnswerRef.current = false;

      // Fetch fresh TURN credentials before creating the connection
      console.log("🔑 Fetching fresh TURN credentials...");
      const freshServers = await fetchFreshIceServers();
      iceServersRef.current = { iceServers: freshServers };
      console.log("✅ ICE servers ready:", freshServers.length, "server(s)");

      console.log("📹 Requesting user media...");
      await getUserMedia(type === "video", true);
      console.log("✅ User media obtained");

      console.log("🔗 Creating peer connection...");
      const peerConnection = createPeerConnection(recipient._id);
      console.log("✅ Peer connection created");
      assertLocalTracksBeforeOffer(peerConnection, type);

      console.log("📝 Creating offer...");
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: type === "video",
      });
      const offerSummary = logSdpSummary(offer, "local-offer");
      if (!offerSummary.hasAudio) {
        throw new Error("Generated offer is missing m=audio");
      }
      if (type === "video" && !offerSummary.hasVideo) {
        throw new Error("Generated video offer is missing m=video");
      }
      await peerConnection.setLocalDescription(offer);
      logSdpSummary(peerConnection.localDescription, "local-offer-set");
      pendingRemoteAnswerRef.current = true;
      console.log("✅ Offer created:", offer);

      console.log("📤 Sending offer to:", recipient._id);
      socket.emit("call:initiate", {
        to: recipient._id,
        offer,
        from: user._id,
        callerName: fullUser.name,
        type: type,
      });
      console.log("✅ Offer sent successfully");
    } catch (error) {
      console.error("❌ Error initiating call:", error);
      alert(`Error initiating call: ${error.message}`);
      cleanupCall();
    }
  };


  // Answer an incoming call (guarded against double invocation)
  const answerCall = async () => {
    if (!incomingCall || !socket) return;
    if (isAnsweringRef.current) {
      console.warn("⚠️ answerCall already in progress, ignoring duplicate");
      return;
    }
    if (peerConnectionRef.current) {
      console.warn("⚠️ Peer connection already exists, ignoring duplicate answer");
      return;
    }
    isAnsweringRef.current = true;

    try {
      setIsCallActive(true);
      isCallActiveRef.current = true;
      setCallType(incomingCall.type || "video");
      setRemoteUser({ _id: incomingCall.from, name: incomingCall.callerName });
      remoteUserIdRef.current = incomingCall.from;

      // Fetch fresh TURN credentials before creating the connection
      console.log("🔑 Fetching fresh TURN credentials...");
      const freshServers = await fetchFreshIceServers();
      iceServersRef.current = { iceServers: freshServers };
      console.log("✅ ICE servers ready:", freshServers.length, "server(s)");

      await getUserMedia(incomingCall.type === "video", true);
      const peerConnection = createPeerConnection(incomingCall.from);

      // Persist the caller's socket ID for precise routing (e.g. ICE restart)
      remoteSocketIdRef.current = incomingCall.callerSocketId || null;

      console.log("signalingState:", peerConnection.signalingState);
      logSdpSummary(incomingCall.offer, "remote-offer-received");
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );
      applyVideoCodecPreferences(peerConnection);
      logSdpSummary(peerConnection.remoteDescription, "remote-offer-set");

      // Flush any ICE candidates that arrived while we were setting up
      await flushIceCandidateBuffer(peerConnection);

      const answer = await peerConnection.createAnswer();
      const answerSummary = logSdpSummary(answer, "local-answer");
      if (!answerSummary.hasAudio) {
        throw new Error("Generated answer is missing m=audio");
      }
      if ((incomingCall.type || "video") === "video" && !answerSummary.hasVideo) {
        throw new Error("Generated video answer is missing m=video");
      }
      await peerConnection.setLocalDescription(answer);
      logSdpSummary(peerConnection.localDescription, "local-answer-set");

      socket.emit("call:answer", {
        to: incomingCall.from,
        answer,
        callerSocketId: incomingCall.callerSocketId,
      });

      incomingCallRef.current = null;
      setIncomingCall(null);
    } catch (error) {
      console.error("Error answering call:", error);
      rejectCall();
    } finally {
      isAnsweringRef.current = false;
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    if (incomingCall && socket) {
      socket.emit("call:reject", { to: incomingCall.from });
      incomingCallRef.current = null;
      remoteUserIdRef.current = null;
      remoteSocketIdRef.current = null;
      pendingRemoteAnswerRef.current = false;
      setIncomingCall(null);
    }
  };

  // Local-only cleanup (no socket emission) - used when the remote side
  // already knows the call ended (e.g. receiving call:ended, call:rejected, call:user-busy)
  const cleanupCall = useCallback(() => {
    stopStatsLogging();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear ICE candidate buffer and answering guard
    iceCandidateBufferRef.current = [];
    isAnsweringRef.current = false;
    remoteSocketIdRef.current = null;
    remoteUserIdRef.current = null;
    pendingRemoteAnswerRef.current = false;
    incomingCallRef.current = null;
    isCallActiveRef.current = false;

    setIsCallActive(false);
    setIncomingCall(null);
    setRemoteUser(null);
    setCallType(null);
    setIsMuted(false);
    setIsVideoOff(false);
    remoteStreamRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [stopStatsLogging]);

  // End call (user-initiated) - notifies remote side, then cleans up locally
  const endCall = () => {
    const targetUserId = remoteUserIdRef.current || remoteUser?._id;
    if (targetUserId && socket) {
      socket.emit("call:end", { to: targetUserId });
    }
    cleanupCall();
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Socket listeners
  useEffect(() => {
    if (!socket || !user?._id) {
      console.log("Inside CallContext.jsx listener setup skipped (missing user or socket)");
      return;
    }

    const handleIncomingCall = (data) => {
      console.log("📞 INCOMING CALL EVENT RECEIVED:", data);
      if (!data?.from || !data?.offer) {
        console.warn("⚠️ Ignoring malformed incoming call payload");
        return;
      }

      // Ignore if already in a call or already answering
      if (peerConnectionRef.current || isAnsweringRef.current || isCallActiveRef.current) {
        console.warn("⚠️ Already in a call, sending busy signal");
        socket.emit("call:busy", { to: data.from });
        return;
      }

      if (incomingCallRef.current) {
        console.warn("⚠️ Duplicate incoming call event ignored");
        return;
      }

      incomingCallRef.current = data;
      remoteUserIdRef.current = data.from;
      remoteSocketIdRef.current = data.callerSocketId || null;
      pendingRemoteAnswerRef.current = false;
      setIncomingCall(data);
      setRemoteUser({ _id: data.from, name: data.callerName });
      console.log("✅ incomingCall state updated");
    };

    // Call answered — GUARDED: only process if signaling state is have-local-offer
    const handleCallAnswered = async ({ answer, fromSocketId }) => {
      console.log("✅ Call answered by recipient");
      try {
        const pc = peerConnectionRef.current;
        if (!pc) {
          console.warn("⚠️ No peer connection, ignoring answer");
          return;
        }

        if (fromSocketId) {
          remoteSocketIdRef.current = fromSocketId;
        }

        console.log("signalingState:", pc.signalingState);

        // STATE GUARD: prevent "Cannot set remote answer in state stable"
        if (pc.signalingState !== "have-local-offer") {
          console.warn(
            `⚠️ Ignoring duplicate answer — signaling state is "${pc.signalingState}" (expected "have-local-offer")`
          );
          return;
        }

        if (!pendingRemoteAnswerRef.current) {
          console.warn("⚠️ Ignoring unexpected answer (no pending local offer)");
          return;
        }

        if (pc.remoteDescription?.type) {
          console.warn("⚠️ Remote description already set, ignoring duplicate answer");
          return;
        }

        logSdpSummary(answer, "remote-answer-received");
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        logSdpSummary(pc.remoteDescription, "remote-answer-set");
        pendingRemoteAnswerRef.current = false;
        console.log("✅ Remote description set");

        // Flush any ICE candidates that arrived before remote description was set
        await flushIceCandidateBuffer(pc);
        logPeerStats(pc, "remote-answer-set");
      } catch (error) {
        console.error("❌ Error handling answer:", error);
      }
    };

    // ICE candidate received — BUFFERED: queue if remote description not yet set
    const handleIceCandidate = async ({ candidate, fromSocketId }) => {
      try {
        if (!candidate) return;
        if (fromSocketId) {
          remoteSocketIdRef.current = fromSocketId;
        }

        const pc = peerConnectionRef.current;
        if (!pc) {
          if (incomingCallRef.current || isAnsweringRef.current || isCallActiveRef.current) {
            queueIceCandidate(candidate, "peer connection not ready yet");
          } else {
            console.warn("⚠️ No active call state, dropping ICE candidate");
          }
          return;
        }

        if (pc.remoteDescription && pc.remoteDescription.type) {
          await addIceCandidateSafely(pc, candidate);
        } else {
          // Buffer the candidate — will be flushed after setRemoteDescription
          queueIceCandidate(candidate, "remote description not set yet");
        }
      } catch (error) {
        console.error("❌ Error adding ICE candidate:", error.message);
      }
    };

    // ICE restart offer from remote peer (sent when their ICE failed)
    // The backend enriches this event with `from` (userId) and `callerSocketId`
    // so we avoid stale closures over remoteUser/incomingCall state.
    const handleIceRestart = async ({ offer, from, callerSocketId }) => {
      console.log("🔄 ICE restart offer received");
      try {
        const pc = peerConnectionRef.current;
        if (!pc) {
          console.warn("⚠️ No peer connection, ignoring ICE restart offer");
          return;
        }

        remoteUserIdRef.current = from || remoteUserIdRef.current;
        if (callerSocketId) {
          remoteSocketIdRef.current = callerSocketId;
        }

        console.log("signalingState:", pc.signalingState);

        // Only accept if signaling state allows setting a remote offer
        if (pc.signalingState !== "stable") {
          console.warn(
            `⚠️ Cannot handle ICE restart in state "${pc.signalingState}" (expected "stable")`
          );
          return;
        }

        logSdpSummary(offer, "remote-ice-restart-offer");
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        applyVideoCodecPreferences(pc);
        logSdpSummary(pc.remoteDescription, "remote-ice-restart-offer-set");

        // Flush any buffered ICE candidates for the new session
        await flushIceCandidateBuffer(pc);

        const answer = await pc.createAnswer();
        logSdpSummary(answer, "local-ice-restart-answer");
        await pc.setLocalDescription(answer);
        logSdpSummary(pc.localDescription, "local-ice-restart-answer-set");

        // Route the answer back to the caller's specific socket
        const targetUserId = from || remoteUserIdRef.current;
        if (!targetUserId) {
          console.warn("⚠️ Missing target user for ICE restart answer");
          return;
        }
        socket.emit("call:answer", {
          to: targetUserId,
          answer,
          callerSocketId: callerSocketId || remoteSocketIdRef.current,
        });
      } catch (err) {
        console.error("❌ ICE restart handling failed:", err);
      }
    };

    // Call ended
    const handleCallEnded = () => {
      console.log("📴 Call ended by remote user");
      cleanupCall();
    };

    // Call rejected
    const handleCallRejected = () => {
      console.log("❌ Call was rejected");
      alert("Call was rejected");
      cleanupCall();
    };

    // User busy
    const handleCallBusy = () => {
      console.log("⏳ User is busy");
      alert("User is busy");
      cleanupCall();
    };

    // Defensively remove same handler first to prevent accidental duplication.
    socket.off("call:incoming", handleIncomingCall);
    socket.off("call:answered", handleCallAnswered);
    socket.off("call:ice-candidate", handleIceCandidate);
    socket.off("call:ice-restart", handleIceRestart);
    socket.off("call:ended", handleCallEnded);
    socket.off("call:rejected", handleCallRejected);
    socket.off("call:user-busy", handleCallBusy);

    socket.on("call:incoming", handleIncomingCall);
    socket.on("call:answered", handleCallAnswered);
    socket.on("call:ice-candidate", handleIceCandidate);
    socket.on("call:ice-restart", handleIceRestart);
    socket.on("call:ended", handleCallEnded);
    socket.on("call:rejected", handleCallRejected);
    socket.on("call:user-busy", handleCallBusy);

    return () => {
      socket.off("call:incoming", handleIncomingCall);
      socket.off("call:answered", handleCallAnswered);
      socket.off("call:ice-candidate", handleIceCandidate);
      socket.off("call:ice-restart", handleIceRestart);
      socket.off("call:ended", handleCallEnded);
      socket.off("call:rejected", handleCallRejected);
      socket.off("call:user-busy", handleCallBusy);
    };
  }, [
    socket,
    user?._id,
    cleanupCall,
    addIceCandidateSafely,
    flushIceCandidateBuffer,
    queueIceCandidate,
    logSdpSummary,
    applyVideoCodecPreferences,
    logPeerStats,
  ]);

  const value = {
    isCallActive,
    incomingCall,
    callType,
    isMuted,
    isVideoOff,
    remoteUser,
    localVideoRef,
    remoteVideoRef,
    remoteStreamRef,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
