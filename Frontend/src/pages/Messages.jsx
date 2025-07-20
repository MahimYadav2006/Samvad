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
  // useEffect(() => {
  //   dispatch(fetchUserList());
  // }, [dispatch]);

  // let userList = useSelector((state)=> state.chat.userList);
  const token = useSelector((state) => state.auth.token);
  useEffect(()=>{
    if(token != null || token != undefined){
      dispatch(fetchUserList());
      console.log("Fetching User List is done with token", token);
    }
  },[dispatch,token]);
  
  const userList = useSelector((state) => state.chat.userList);
  console.log("Inside Messages.jsx, userList is", userList);
  useEffect(() => {
    if (userList.length > 0 && otherPerson === null) {
      setOtherPerson(userList[0]._id);
      dispatch(startConversation({ userId: userList[0]._id })); 
      console.log("Inside Messages.jsx, setting otherPerson to", userList[0]._id);
      // dispatch(fetchMessages(conversationId));
    }
  }, [userList]);
  useEffect(()=>{
    if(otherPerson){
      dispatch(startConversation({ userId: otherPerson })); 
      // console.log("Fetching messages for other person", otherPerson," whose conversation id is",conversationId);
      // dispatch(fetchMessages(conversationId));
    }
  },[otherPerson])
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
