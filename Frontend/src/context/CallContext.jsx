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

  // Current ICE-server config – refreshed before every call via
  // fetchFreshIceServers(), which hits the backend Metered API endpoint.
  const iceServersRef = useRef({ iceServers: getWebRtcIceServers() });

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  useEffect(() => {
    isCallActiveRef.current = isCallActive;
  }, [isCallActive]);

  const logSdpMediaSections = useCallback((description, label) => {
    const sdp = description?.sdp || "";
    const hasAudio = /\nm=audio\s/.test(`\n${sdp}`);
    const hasVideo = /\nm=video\s/.test(`\n${sdp}`);
    console.log(`📄 SDP ${label}:`, {
      type: description?.type || "unknown",
      hasAudio,
      hasVideo,
    });
  }, []);

  const logPeerTrackState = useCallback((peerConnection, label) => {
    if (!peerConnection) return;
    const senders = peerConnection
      .getSenders()
      .map((sender) => sender.track)
      .filter(Boolean)
      .map((track) => ({
        id: track.id,
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState,
        muted: track.muted,
      }));
    const receivers = peerConnection
      .getReceivers()
      .map((receiver) => receiver.track)
      .filter(Boolean)
      .map((track) => ({
        id: track.id,
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState,
        muted: track.muted,
      }));

    console.log(`📤 getSenders (${label}):`, senders);
    console.log(`📥 getReceivers (${label}):`, receivers);
  }, []);

  const logPeerStats = useCallback(async (peerConnection, label) => {
    if (!peerConnection || peerConnection.connectionState === "closed") return;
    try {
      const stats = await peerConnection.getStats();
      const outbound = [];
      const inbound = [];
      let selectedPair = null;

      stats.forEach((report) => {
        if (report.type === "outbound-rtp" && !report.isRemote) {
          outbound.push(report);
        }
        if (report.type === "inbound-rtp" && !report.isRemote) {
          inbound.push(report);
        }
        if (
          report.type === "candidate-pair" &&
          report.state === "succeeded" &&
          (report.nominated || report.selected)
        ) {
          selectedPair = report;
        }
      });

      console.log(
        `📊 outbound-rtp (${label}):`,
        outbound.map((report) => ({
          id: report.id,
          kind: report.kind || report.mediaType || null,
          packetsSent: report.packetsSent,
          bytesSent: report.bytesSent,
          framesEncoded: report.framesEncoded,
        }))
      );
      console.log(
        `📊 inbound-rtp (${label}):`,
        inbound.map((report) => ({
          id: report.id,
          kind: report.kind || report.mediaType || null,
          packetsReceived: report.packetsReceived,
          bytesReceived: report.bytesReceived,
          framesDecoded: report.framesDecoded,
        }))
      );
      if (selectedPair) {
        console.log(`🧊 selected ICE pair (${label}):`, {
          id: selectedPair.id,
          state: selectedPair.state,
          nominated: selectedPair.nominated,
          localCandidateId: selectedPair.localCandidateId,
          remoteCandidateId: selectedPair.remoteCandidateId,
          currentRoundTripTime: selectedPair.currentRoundTripTime,
        });
      }
    } catch (err) {
      console.warn("⚠️ Failed to read getStats():", err.message);
    }
  }, []);

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
      logPeerTrackState(peerConnection, "after-addTrack");
    }

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

    // Handle remote tracks robustly: event.streams can be empty on some mobile browsers.
    peerConnection.ontrack = (event) => {
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }
      const alreadyPresent = remoteStreamRef.current
        .getTracks()
        .some((track) => track.id === event.track.id);
      if (!alreadyPresent) {
        remoteStreamRef.current.addTrack(event.track);
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        remoteVideoRef.current.autoplay = true;
        remoteVideoRef.current.playsInline = true;
        remoteVideoRef.current.play?.().catch(() => {});
      }
      console.log("🎧 ontrack:", {
        id: event.track.id,
        kind: event.track.kind,
        muted: event.track.muted,
        readyState: event.track.readyState,
      });
      logPeerTrackState(peerConnection, "ontrack");
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
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
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
      logPeerTrackState(peerConnection, "before-createOffer");

      console.log("📝 Creating offer...");
      const offer = await peerConnection.createOffer();
      logSdpMediaSections(offer, "local-offer");
      await peerConnection.setLocalDescription(offer);
      logSdpMediaSections(peerConnection.localDescription, "local-offer-set");
      pendingRemoteAnswerRef.current = true;
      console.log("✅ Offer created:", offer);
      logPeerStats(peerConnection, "after-local-offer");

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
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );
      logSdpMediaSections(peerConnection.remoteDescription, "remote-offer-set");
      logPeerTrackState(peerConnection, "after-remote-offer");

      // Flush any ICE candidates that arrived while we were setting up
      await flushIceCandidateBuffer(peerConnection);

      const answer = await peerConnection.createAnswer();
      logSdpMediaSections(answer, "local-answer");
      await peerConnection.setLocalDescription(answer);
      logSdpMediaSections(peerConnection.localDescription, "local-answer-set");
      logPeerStats(peerConnection, "after-local-answer");

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
  }, []);

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

        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        logSdpMediaSections(pc.remoteDescription, "remote-answer-set");
        pendingRemoteAnswerRef.current = false;
        console.log("✅ Remote description set");

        // Flush any ICE candidates that arrived before remote description was set
        await flushIceCandidateBuffer(pc);
        logPeerTrackState(pc, "after-remote-answer");
        logPeerStats(pc, "after-remote-answer");
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

        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Flush any buffered ICE candidates for the new session
        await flushIceCandidateBuffer(pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

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
    logSdpMediaSections,
    logPeerTrackState,
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
