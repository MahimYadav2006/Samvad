import React from "react";
import { useCall } from "../../context/CallContext";
import { FiVideo, FiPhone, FiMoreVertical } from "react-icons/fi";

const ChatHeader = ({ selectedUser }) => {
  const { initiateCall } = useCall();

  if (!selectedUser) return null;

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">
            {selectedUser.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{selectedUser.name}</h3>
          <p className="text-xs text-gray-500">
            {selectedUser.online ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {/* Audio Call */}
        <button
          onClick={() => initiateCall(selectedUser, "audio")}
          className="p-2 hover:bg-gray-100 rounded-full transition-all"
          title="Audio Call"
        >
          <FiPhone className="text-gray-600 text-xl" />
        </button>

        {/* Video Call */}
        <button
          onClick={() => initiateCall(selectedUser, "video")}
          className="p-2 hover:bg-gray-100 rounded-full transition-all"
          title="Video Call"
        >
          <FiVideo className="text-gray-600 text-xl" />
        </button>

        {/* More Options */}
        <button className="p-2 hover:bg-gray-100 rounded-full transition-all">
          <FiMoreVertical className="text-gray-600 text-xl" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
