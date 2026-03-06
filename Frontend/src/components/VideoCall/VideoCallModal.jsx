import React, { useEffect, useState } from "react";
import { useCall } from "../../context/CallContext";
import {
  FiVideo,
  FiVideoOff,
  FiMic,
  FiMicOff,
  FiPhoneOff,
} from "react-icons/fi";

const VideoCallModal = () => {
  const {
    isCallActive,
    callType,
    isMuted,
    isVideoOff,
    remoteUser,
    localVideoRef,
    remoteVideoRef,
    remoteStreamRef,
    toggleMute,
    toggleVideo,
    endCall,
  } = useCall();

  const [callDuration, setCallDuration] = useState(0);

  // Call timer
  useEffect(() => {
    if (!isCallActive) {
      setCallDuration(0);
      return;
    }
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Fallback: attach remote stream to video element when modal mounts
  useEffect(() => {
    if (isCallActive && remoteVideoRef.current && remoteStreamRef?.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
      remoteVideoRef.current.autoplay = true;
      remoteVideoRef.current.playsInline = true;
      remoteVideoRef.current.play?.().catch(() => {});
    }
  }, [isCallActive, remoteVideoRef, remoteStreamRef]);

  if (!isCallActive) return null;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const isVideo = callType === "video";
  const initial = remoteUser?.name?.charAt(0).toUpperCase() || "?";

  // ── Control button component ──────────────────────────
  const ControlButton = ({ onClick, active, activeColor, icon, label }) => {
    const IconComponent = icon;

    return (
      <button
        onClick={onClick}
        className={`group relative flex items-center justify-center rounded-full transition-all duration-200 active:scale-90
          w-12 h-12 sm:w-14 sm:h-14
          ${
            active
              ? `${activeColor} shadow-lg`
              : "bg-white/10 hover:bg-white/20"
          }`}
        title={label}
      >
        <IconComponent className="text-white text-lg sm:text-xl" />
      </button>
    );
  };

  // ── VIDEO CALL LAYOUT ─────────────────────────────────
  if (isVideo) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
        {/* Remote video (fullscreen) */}
        <div className="absolute inset-0">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlays for readability */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>

        {/* Top bar: user info + timer */}
        <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="call-glass rounded-xl px-4 py-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{initial}</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">
                {remoteUser?.name || "Connecting..."}
              </p>
              <p className="text-white/60 text-xs">{formatDuration(callDuration)}</p>
            </div>
          </div>
        </div>

        {/* Local video PiP */}
        <div
          className="absolute z-10 rounded-2xl overflow-hidden shadow-2xl border border-white/10
            bottom-28 sm:bottom-32 right-3 sm:right-5
            w-28 h-40 sm:w-40 sm:h-56"
        >
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {isVideoOff && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-white text-base sm:text-lg font-bold">You</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls bar */}
        <div className="absolute z-10 bottom-6 sm:bottom-8 left-1/2 call-controls-animate">
          <div className="call-glass rounded-2xl px-5 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
            <ControlButton
              onClick={toggleMute}
              active={isMuted}
              activeColor="bg-[#DC3545]"
              icon={isMuted ? FiMicOff : FiMic}
              label={isMuted ? "Unmute" : "Mute"}
            />
            <ControlButton
              onClick={toggleVideo}
              active={isVideoOff}
              activeColor="bg-[#DC3545]"
              icon={isVideoOff ? FiVideoOff : FiVideo}
              label={isVideoOff ? "Turn on camera" : "Turn off camera"}
            />
            <button
              onClick={endCall}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#DC3545] hover:bg-[#c82333] flex items-center justify-center transition-all duration-200 active:scale-90 shadow-lg shadow-red-500/30"
              title="End call"
            >
              <FiPhoneOff className="text-white text-lg sm:text-xl" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── AUDIO CALL LAYOUT ─────────────────────────────────
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-between"
      style={{
        background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)",
      }}
    >
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)" }}
      />

      {/* Top spacer */}
      <div className="pt-12 sm:pt-16" />

      {/* Center content */}
      <div className="flex flex-col items-center gap-6 sm:gap-8 call-animate-in">
        {/* Avatar */}
        <div className="relative">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
            <span className="text-white text-4xl sm:text-5xl font-bold">{initial}</span>
          </div>
          {/* Decorative ring */}
          <div className="absolute -inset-3 rounded-full border border-white/10" />
          <div className="absolute -inset-6 rounded-full border border-white/5" />
        </div>

        {/* User info */}
        <div className="text-center">
          <h2 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
            {remoteUser?.name || "Connecting..."}
          </h2>
          <p className="text-white/50 text-sm sm:text-base mt-1">Audio Call</p>
        </div>

        {/* Timer */}
        <div className="call-glass rounded-full px-5 py-2">
          <p className="text-white/90 text-lg sm:text-xl font-mono tracking-wider">
            {formatDuration(callDuration)}
          </p>
        </div>

        {/* Sound wave animation */}
        <div className="flex items-center justify-center gap-1.5 h-8 mt-2">
          <div className="call-sound-bar" />
          <div className="call-sound-bar" />
          <div className="call-sound-bar" />
          <div className="call-sound-bar" />
          <div className="call-sound-bar" />
        </div>
      </div>

      {/* Hidden video elements (needed for WebRTC stream) */}
      <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
      <video ref={localVideoRef} autoPlay muted playsInline className="hidden" />

      {/* Controls */}
      <div className="pb-10 sm:pb-14">
        <div className="call-glass rounded-2xl px-6 sm:px-8 py-3 sm:py-4 flex items-center gap-4 sm:gap-5">
          <ControlButton
            onClick={toggleMute}
            active={isMuted}
            activeColor="bg-[#DC3545]"
            icon={isMuted ? FiMicOff : FiMic}
            label={isMuted ? "Unmute" : "Mute"}
          />
          <button
            onClick={endCall}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#DC3545] hover:bg-[#c82333] flex items-center justify-center transition-all duration-200 active:scale-90 shadow-lg shadow-red-500/30"
            title="End call"
          >
            <FiPhoneOff className="text-white text-xl sm:text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
