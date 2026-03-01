import React from "react";
import { useCall } from "../../context/CallContext";
import { FiPhone, FiPhoneOff, FiVideo } from "react-icons/fi";

const IncomingCallModal = () => {
  const { incomingCall, answerCall, rejectCall } = useCall();

  if (!incomingCall) return null;

  const isVideo = incomingCall.type === "video";
  const callerInitial =
    incomingCall.callerName?.charAt(0).toUpperCase() || "?";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.95) 40%, rgba(15,23,42,0.95) 100%)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />

      {/* Card */}
      <div className="relative call-animate-in w-full max-w-sm">
        <div
          className="rounded-3xl px-8 py-10 sm:px-10 sm:py-12 flex flex-col items-center"
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
          }}
        >
          {/* Avatar with pulse ring */}
          <div className="relative mb-6 sm:mb-8">
            <div className="call-pulse-ring relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/25">
              <span className="text-white text-3xl sm:text-4xl font-bold">
                {callerInitial}
              </span>
            </div>
          </div>

          {/* Caller info */}
          <h2 className="text-white text-xl sm:text-2xl font-bold tracking-tight text-center mb-1">
            {incomingCall.callerName || "Unknown Caller"}
          </h2>
          <p className="text-white/50 text-sm sm:text-base mb-8 sm:mb-10">
            Incoming {isVideo ? "video" : "audio"} call...
          </p>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-8 sm:gap-12">
            {/* Reject */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={rejectCall}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#DC3545] hover:bg-[#c82333] flex items-center justify-center transition-all duration-200 active:scale-90 shadow-lg shadow-red-500/30"
              >
                <FiPhoneOff className="text-white text-2xl sm:text-[26px]" />
              </button>
              <span className="text-white/50 text-xs">Decline</span>
            </div>

            {/* Accept */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={answerCall}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#22c55e] hover:bg-[#16a34a] flex items-center justify-center transition-all duration-200 active:scale-90 shadow-lg shadow-green-500/30"
              >
                {isVideo ? (
                  <FiVideo className="text-white text-2xl sm:text-[26px]" />
                ) : (
                  <FiPhone className="text-white text-2xl sm:text-[26px]" />
                )}
              </button>
              <span className="text-white/50 text-xs">Accept</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
