import React from 'react'
import { ChatList } from '../section/chat'
import { MessageInbox } from '../section/chat'
import GifModal from "../components/GifModal";
import VoiceRecorder from "../components/VoiceRecorder";
import MediaPicker from "../components/MediaPicker";
import DocumentPicker from "../components/DocumentPicker";
export default function Messages() {
  return (
    <>
      <div className='flex w-full'>
        <ChatList></ChatList>
        <MessageInbox></MessageInbox>
      </div>
      <GifModal></GifModal>
      <VoiceRecorder></VoiceRecorder>
      <MediaPicker></MediaPicker>
      <DocumentPicker></DocumentPicker>
    </>
  )
}
