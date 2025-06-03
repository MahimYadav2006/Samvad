// Messages.jsx
import React from "react";
import Sidebar from "../section/chat/Sidebar";
import ChatList from "../section/chat/ChatList";
import Inbox from "../section/chat/Inbox";
import GifModal from "../components/GifModal";
import VoiceRecorder from "../components/VoiceRecorder";
import MediaPicker from "../components/MediaPicker";
import DocumentPicker from "../components/DocumentPicker";

export default function Messages() {
  return (
    <div className="h-screen overflow-hidden">
      <div className="h-full rounded-sm border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark flex">
        <Sidebar />
        <ChatList />
        <Inbox />
        <GifModal></GifModal>
        <VoiceRecorder></VoiceRecorder>
        <MediaPicker></MediaPicker>
        <DocumentPicker></DocumentPicker>
      </div>
    </div>
  );
}