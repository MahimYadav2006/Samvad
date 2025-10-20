import React, { useEffect } from "react";
import { useCall } from "../../context/CallContext";
import { FiPhone, FiPhoneOff } from "react-icons/fi";

const IncomingCallModal = () => {
  const { incomingCall, answerCall, rejectCall } = useCall();

  useEffect(() => {
    console.log("📱 IncomingCallModal rendered, incomingCall:", incomingCall);
  }, [incomingCall]);

  if (!incomingCall) {
    console.log("❌ No incoming call, modal hidden");
    return null;
  }

  console.log("✅ Showing incoming call modal for:", incomingCall.callerName);

  return (incomingCall.type === "video" ? 
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-96 shadow-2xl">
        {/* Caller Info */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">
              {incomingCall.callerName?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {incomingCall.callerName || "Unknown Caller"}
          </h2>
          <p className="text-gray-600">Incoming video call...</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6">
          {/* Reject Call */}
          <button
            onClick={() => {
              console.log("🚫 Rejecting call");
              rejectCall();
            }}
            className="w-16 h-16 bg-[#ff1a1a] hover:bg-[#e60000] border-2 border-red-800 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ring-4 ring-red-300 shadow-lg shadow-red-400"
          >
            <FiPhoneOff className="text-white text-3xl drop-shadow-md" />
          </button>


          {/* Answer Call */}
          <button
            onClick={() => {
              console.log("✅ Answering call");
              answerCall();
            }}
            className="w-16 h-16 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-all transform hover:scale-110"
          >
            <FiPhone className="text-white text-2xl" />
          </button>
        </div>
      </div>
    </div> : //###
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-96 shadow-2xl">
        {/* Caller Info */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">
              {incomingCall.callerName?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {incomingCall.callerName || "Unknown Caller"}
          </h2>
          <p className="text-gray-600">Incoming Audio call...</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6">
          {/* Reject Call */}
          <button
            onClick={() => {
              console.log("🚫 Rejecting call");
              rejectCall();
            }}
            className="w-16 h-16 bg-[#ff1a1a] hover:bg-[#e60000] border-2 border-red-800 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ring-4 ring-red-300 shadow-lg shadow-red-400"
          >
            <FiPhoneOff className="text-white text-3xl drop-shadow-md" />
          </button>


          {/* Answer Call */}
          <button
            onClick={() => {
              console.log("✅ Answering call");
              answerCall();
            }}
            className="w-16 h-16 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-all transform hover:scale-110"
          >
            <FiPhone className="text-white text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
