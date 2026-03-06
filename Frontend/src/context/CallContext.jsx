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

  // Current ICE-server config – refreshed before every call via
  // fetchFreshIceServers(), which hits the backend Metered API endpoint.
  const iceServersRef = useRef({ iceServers: getWebRtcIceServers() });

  // Helper: flush buffered ICE candidates after remote description is set
  const flushIceCandidateBuffer = async (peerConnection) => {
    const buffered = iceCandidateBufferRef.current;
    iceCandidateBufferRef.current = [];
    for (const candidate of buffered) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("✅ Buffered ICE candidate added");
      } catch (error) {
        console.warn("⚠️ Error adding buffered ICE candidate:", error.message);
      }
    }
  };

  // Create PeerConnection
  // Accept remoteUserId as a parameter to avoid stale closure over remoteUser state
  const createPeerConnection = (remoteUserId) => {
    // Close any existing peer connection before creating a new one
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    // Clear ICE candidate buffer for the new connection
    iceCandidateBufferRef.current = [];
    iceRestartAttemptedRef.current = false;

    const peerConnection = new RTCPeerConnection(iceServersRef.current);

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    // Handle ICE candidates - use remoteUserId param instead of remoteUser state
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && remoteUserId && socket) {
        socket.emit("call:ice-candidate", {
          to: remoteUserId,
          candidate: event.candidate,
        });
      }
    };

    // Handle remote stream - always save to ref, then try to attach to video element
    peerConnection.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Monitor ICE connection state for diagnostics and failure recovery
    peerConnection.oniceconnectionstatechange = () => {
      const state = peerConnection.iceConnectionState;
      console.log("🧊 ICE connection state:", state);
      if (state === "failed") {
        // Attempt a single ICE restart before giving up
        if (!iceRestartAttemptedRef.current && peerConnection.signalingState !== "closed") {
          iceRestartAttemptedRef.current = true;
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
    try {
      console.log("🎬 Initiating call to:", recipient);
      console.log("Call type:", type);
      console.log("Current user:", user);

      setCallType(type);
      setRemoteUser(recipient);
      setIsCallActive(true);

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

      console.log("📝 Creating offer...");
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
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
    isAnsweringRef.current = true;

    try {
      setIsCallActive(true);
      setCallType(incomingCall.type || "video");
      setRemoteUser({ _id: incomingCall.from, name: incomingCall.callerName });

      // Fetch fresh TURN credentials before creating the connection
      console.log("🔑 Fetching fresh TURN credentials...");
      const freshServers = await fetchFreshIceServers();
      iceServersRef.current = { iceServers: freshServers };
      console.log("✅ ICE servers ready:", freshServers.length, "server(s)");

      await getUserMedia(incomingCall.type === "video", true);
      const peerConnection = createPeerConnection(incomingCall.from);

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );

      // Flush any ICE candidates that arrived while we were setting up
      await flushIceCandidateBuffer(peerConnection);

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit("call:answer", {
        to: incomingCall.from,
        answer,
        callerSocketId: incomingCall.callerSocketId,
      });

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
    if (remoteUser && socket) {
      socket.emit("call:end", { to: remoteUser._id });
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
    if (!socket || !user) {
      console.log(`Inside CallContext.jsx user is ${user} and socket is ${socket}`);
      return;
    }

    // Incoming call
    socket.on("call:incoming", (data) => {
      console.log("📞 INCOMING CALL EVENT RECEIVED:", data);

      // Ignore if already in a call or already answering
      if (peerConnectionRef.current || isAnsweringRef.current) {
        console.warn("⚠️ Already in a call, sending busy signal");
        socket.emit("call:busy", { to: data.from });
        return;
      }

      setIncomingCall(data);
      setRemoteUser({ _id: data.from, name: data.callerName });
      console.log("✅ incomingCall state updated");
    });

    // Call answered — GUARDED: only process if signaling state is have-local-offer
    socket.on("call:answered", async ({ answer }) => {
      console.log("✅ Call answered by recipient");
      try {
        const pc = peerConnectionRef.current;
        if (!pc) {
          console.warn("⚠️ No peer connection, ignoring answer");
          return;
        }

        // STATE GUARD: prevent "Cannot set remote answer in state stable"
        if (pc.signalingState !== "have-local-offer") {
          console.warn(
            `⚠️ Ignoring duplicate answer — signaling state is "${pc.signalingState}" (expected "have-local-offer")`
          );
          return;
        }

        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("✅ Remote description set");

        // Flush any ICE candidates that arrived before remote description was set
        await flushIceCandidateBuffer(pc);
      } catch (error) {
        console.error("❌ Error handling answer:", error);
      }
    });

    // ICE candidate received — BUFFERED: queue if remote description not yet set
    socket.on("call:ice-candidate", async ({ candidate }) => {
      console.log("🧊 ICE candidate received");
      try {
        const pc = peerConnectionRef.current;
        if (!pc) {
          console.warn("⚠️ No peer connection, ignoring ICE candidate");
          return;
        }

        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          // Buffer the candidate — will be flushed after setRemoteDescription
          console.log("📦 Buffering ICE candidate (remote description not set yet)");
          iceCandidateBufferRef.current.push(candidate);
        }
      } catch (error) {
        console.error("❌ Error adding ICE candidate:", error);
      }
    });

    // ICE restart offer from remote peer (sent when their ICE failed)
    socket.on("call:ice-restart", async ({ offer }) => {
      console.log("🔄 ICE restart offer received");
      try {
        const pc = peerConnectionRef.current;
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        // Send the answer back through the normal channel
        const targetId = remoteUser?._id || incomingCall?.from;
        if (targetId) {
          socket.emit("call:answer", { to: targetId, answer });
        }
      } catch (err) {
        console.error("❌ ICE restart handling failed:", err);
      }
    });

    // Call ended
    socket.on("call:ended", () => {
      console.log("📴 Call ended by remote user");
      cleanupCall();
    });

    // Call rejected
    socket.on("call:rejected", () => {
      console.log("❌ Call was rejected");
      alert("Call was rejected");
      cleanupCall();
    });

    // User busy
    socket.on("call:user-busy", () => {
      console.log("⏳ User is busy");
      alert("User is busy");
      cleanupCall();
    });

    return () => {
      socket.off("call:incoming");
      socket.off("call:answered");
      socket.off("call:ice-candidate");
      socket.off("call:ice-restart");
      socket.off("call:ended");
      socket.off("call:rejected");
      socket.off("call:user-busy");
    };
  }, [socket, user, cleanupCall]);

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
