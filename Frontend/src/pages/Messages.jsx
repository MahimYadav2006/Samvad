import React from 'react'
import { ChatList } from '../section/chat'
import { MessageInbox } from '../section/chat'
import GifModal from "../components/GifModal";
import VoiceRecorder from "../components/VoiceRecorder";
import MediaPicker from "../components/MediaPicker";
import DocumentPicker from "../components/DocumentPicker";
import { useState,useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { fetchUserList } from "../redux/slices/chat";
import { startConversation } from '../redux/slices/user';



export default function Messages() {
  const [otherPerson, setOtherPerson] = useState(null);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchUserList());
  }, [dispatch]);
  
  const { userList } = useSelector((state) => state.chat);
  useEffect(() => {
    if (userList.length > 0 && !otherPerson) {
      setOtherPerson(userList[0]._id);
      dispatch(startConversation({ userId: (otherPerson || userList[0]._id) })); 
    }
  }, [userList, otherPerson]);
  
  return (
    <>
      <div className='flex w-full'>
        <ChatList otherPerson = {otherPerson} setOtherPerson={setOtherPerson} userList={userList}></ChatList>
        <MessageInbox otherPerson = {otherPerson}></MessageInbox>
      </div>
      <GifModal></GifModal>
      <VoiceRecorder></VoiceRecorder>
      <MediaPicker></MediaPicker>
      <DocumentPicker></DocumentPicker>
    </>
  )
}
