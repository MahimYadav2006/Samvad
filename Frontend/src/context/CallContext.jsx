import React, { createContext, use, useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { getSocket } from "../utils/socket";

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
  const socket = useSelector((state) => state.user.socket);
  // const [socket, setSocket] = useState(null);
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

  // ✅ Initialize socket once when provider mounts
  // useEffect(() => {
  //   const s = getSocket();
  //   setSocket(s);
  //   console.log("Socket initialized in CallProvider:", s);
  // }, []);

  // ICE servers configuration
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // ✅ Create PeerConnection
  const createPeerConnection = () => {
    const peerConnection = new RTCPeerConnection(iceServers);

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && remoteUser && socket) {
        socket.emit("call:ice-candidate", {
          to: remoteUser._id,
          candidate: event.candidate,
        });
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteStreamRef.current = event.streams[0];
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  };

  // ✅ Get user media (camera/mic)
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

  // ✅ Initiate a call
const initiateCall = async (recipient, type = "video") => {
  try {
    console.log("🎬 Initiating call to:", recipient);
    console.log("Call type:", type);
    console.log("Current user:", user);

    setCallType(type);
    setRemoteUser(recipient);
    setIsCallActive(true);

    console.log("📹 Requesting user media...");
    // Get user media
    await getUserMedia(type === "video", true);
    console.log("✅ User media obtained");

    console.log("🔗 Creating peer connection...");
    // Create peer connection
    const peerConnection = createPeerConnection();
    console.log("✅ Peer connection created");

    // Create offer
    console.log("📝 Creating offer...");
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log("✅ Offer created:", offer);

    // Send offer to remote user
    console.log("📤 Sending offer to:", recipient._id);
    socket.emit("call:initiate", {
      to: recipient._id,
      offer,
      from: user._id,
      callerName: user.name,
    });
    console.log("✅ Offer sent successfully");
  } catch (error) {
    console.error("❌ Error initiating call:", error);
    alert(`Error initiating call: ${error.message}`);
    endCall();
  }
};


  // ✅ Answer an incoming call
  const answerCall = async () => {
    if (!incomingCall || !socket) return;
    try {
      setIsCallActive(true);
      setCallType(incomingCall.type || "video");
      setRemoteUser({ _id: incomingCall.from });

      await getUserMedia(true, true);
      const peerConnection = createPeerConnection();

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit("call:answer", {
        to: incomingCall.from,
        answer,
      });

      setIncomingCall(null);
    } catch (error) {
      console.error("Error answering call:", error);
      rejectCall();
    }
  };

  // ✅ Reject incoming call
  const rejectCall = () => {
    if (incomingCall && socket) {
      socket.emit("call:reject", { to: incomingCall.from });
      setIncomingCall(null);
    }
  };

  // ✅ End call
  const endCall = () => {
    if (remoteUser && socket) {
      socket.emit("call:end", { to: remoteUser._id });
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setIsCallActive(false);
    setIncomingCall(null);
    setRemoteUser(null);
    setCallType(null);
    setIsMuted(false);
    setIsVideoOff(false);
    remoteStreamRef.current = null;
  };

  // ✅ Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // ✅ Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // ✅ Socket listeners
  useEffect(() => {
    if (!socket || !user) {
      console.log(`Inside CallContxt.jsx user is ${user} and socket is ${socket}`);
      return;
    }

    // Incoming call
    socket.on("call:incoming", (data) => {
      console.log("📞 INCOMING CALL EVENT RECEIVED:", data);
      console.log("From:", data.from);
      console.log("Caller name:", data.callerName);
      console.log("Offer:", data.offer);
      
      setIncomingCall(data);
      setRemoteUser({ _id: data.from, name: data.callerName });
      
      console.log("✅ incomingCall state updated");
    });

  // Call answered
  socket.on("call:answered", async ({ answer }) => {
    console.log("✅ Call answered by recipient");
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        console.log("✅ Remote description set");
      }
    } catch (error) {
      console.error("❌ Error handling answer:", error);
    }
  });

  // ICE candidate received
  socket.on("call:ice-candidate", async ({ candidate }) => {
    console.log("🧊 ICE candidate received");
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    } catch (error) {
      console.error("❌ Error adding ICE candidate:", error);
    }
  });

  // Call ended
  socket.on("call:ended", () => {
    console.log("📴 Call ended by remote user");
    endCall();
  });

  // Call rejected
  socket.on("call:rejected", () => {
    console.log("❌ Call was rejected");
    alert("Call was rejected");
    endCall();
  });
  
  // User busy
  socket.on("call:user-busy", () => {
    console.log("⏳ User is busy");
    alert("User is busy");
    endCall();
  });

    return () => {
      socket.off("call:incoming");
      socket.off("call:answered");
      socket.off("call:ice-candidate");
      socket.off("call:ended");
      socket.off("call:rejected");
      socket.off("call:user-busy");
    };
  }, [socket, user, remoteUser]);

  const value = {
    isCallActive,
    incomingCall,
    callType,
    isMuted,
    isVideoOff,
    remoteUser,
    localVideoRef,
    remoteVideoRef,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
