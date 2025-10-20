import React from "react";
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
    isMuted,
    isVideoOff,
    remoteUser,
    localVideoRef,
    remoteVideoRef,
    toggleMute,
    toggleVideo,
    endCall,
  } = useCall();

  if (!isCallActive) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Remote Video (Full Screen) */}
      <div className="flex-1 relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {remoteUser && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-4 py-2 rounded-lg">
            <p className="text-white text-lg font-semibold">
              {remoteUser.name}
            </p>
          </div>
        )}
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <div className="absolute top-20 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-600">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {isVideoOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">You</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
        {/* Mute/Unmute */}
        <button
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isMuted
              ? "bg-red-600 hover:bg-red-700"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          {isMuted ? (
            <FiMicOff className="text-white text-xl" />
          ) : (
            <FiMic className="text-white text-xl" />
          )}
        </button>

        {/* Video On/Off */}
        <button
          onClick={toggleVideo}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isVideoOff
              ? "bg-red-600 hover:bg-red-700"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          {isVideoOff ? (
            <FiVideoOff className="text-white text-xl" />
          ) : (
            <FiVideo className="text-white text-xl" />
          )}
        </button>

        {/* End Call */}
        <button
          onClick={endCall}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all"
        >
          <FiPhoneOff className="text-white text-xl" />
        </button>
      </div>
    </div>
  );
};

export default VideoCallModal;
