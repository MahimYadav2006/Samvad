import User01 from "../../images/user/user-01.png";
import {
  DotsThreeIcon,
  PaperPlaneTiltIcon,
  LinkSimpleIcon,
  SmileyIcon,
  VideoCameraIcon,
  PhoneCallIcon,
  GifIcon,
  MicrophoneIcon
} from "@phosphor-icons/react";
import Dropdown from "../../components/Dropdown";
import EmojiPicker from "../../components/EmojiPicker";
import React, { useState } from "react";
import UserInfo from "./UserInfo";
import Giphy from "../../components/Giphy";
import { useDispatch } from "react-redux";
import { toggleAudioModal } from "../../redux/slices/app";
import Attachment from "../../components/Attachment";
import MsgSeparator from "../../components/MsgSeparator";
import TypingIndicator from "../../components/TypingIndicator";
import {TextMessage, DocumentMessage, VoiceMessage, MediaMessage} from "../../components/Messages/index";
import VideoRoom from "../../components/VideoRoom";
import AudioRoom from "../../components/AudioRoom";

function Inbox() {
  const dispatch = useDispatch();
  const [userInfoOpen, setUserInfoOpen] = useState(false);
  const [gifOpen,setGifOpen] = useState(false);
  const [videoCall, setVideoCall] = useState(false);
  const [audioCall, setAudioCall] = useState(false);
  const handleToggleGif = (e) =>{
    e.preventDefault();
    setGifOpen((prev) => !prev);
  }

  const handleToggleUserInfo = () => {
    setUserInfoOpen((prev) => !prev);
  };

  const handleMicClick = (e)=>{
    e.preventDefault();
    dispatch(toggleAudioModal(true));
  };

  const handleToggleVideoCall = (e)=>{
    e.preventDefault();
    setVideoCall((prev)=>!prev);
  };

  const handleToggleAudioCall = (e)=>{
    e.preventDefault();
    setAudioCall((prev)=>!prev);
  };

  return (
    <>
      <div className={`flex h-full flex-col border-l border-stroke p-2 dark:border-strokedark  ${userInfoOpen ? "w-1/2" : "w-3/4"}`}>
        {/* ChatHeader */}
        <div className="sticky flex items-center flex-row justify-between border-b dark:border-strokedark px-6 py-4.5">
          <div className="flex items-center" onClick={handleToggleUserInfo}>
            <div className="mr-4.5 h-13 w-full max-w-13 overflow-hidden rounded-full">
              <img
                src={User01}
                alt="avatar"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div>
              <h5 className="font-medium text-black dark:text-white">
                Henry Dholi
              </h5>
              <p>Reply to message</p>
            </div>
          </div>
          <div className="flex flex-row align-center space-x-4">
            <button onClick={handleToggleVideoCall}>
              <VideoCameraIcon size={24}></VideoCameraIcon>
            </button >
            <button onClick={handleToggleAudioCall}>
              <PhoneCallIcon size={24}></PhoneCallIcon>
            </button>
            <Dropdown></Dropdown>
          </div>
        </div>

        {/* Messages */}
        <div className="max-h-full space-y-3.5 overflow-auto no-scrollbar px-6 py-7.5 grow">
          <div className="max-w-125 w-fit">
            <p className="mb-2.5 text-sm font-medium">Andri Thomas</p>
            <div className="rounded-2xl mb-2.5 rounded-tl-none bg-gray px-5 py-3 dark:bg-boxdark-2">
              <p>I want to meet you tomorrow from 3pm - 5pm.</p>
            </div>
            <p className="text-xs">1:55pm</p>
          </div>

          <TextMessage author="Mahim Yadav" content="Hi There How are you doing man? https://Google.com" read_receipt="read" incoming={false} timestamp={"2:44 pm"}  />

          <div className="max-w-125 ml-auto text-right w-fit">
            <div className="rounded-2xl mb-2.5 rounded-br-none bg-primary px-5 py-3 ">
              <p className="text-white">
                I will check my schedule and will let you know by tonight.
              </p>
            </div>
            <p className="text-xs">1:55pm</p>
          </div>
            <MsgSeparator></MsgSeparator>
            <DocumentMessage author="Mahim Yadav" incoming={true} read_receipt="sent" timestamp="4:23 PM"></DocumentMessage>
            <VoiceMessage author="Mahim Yadav" incoming={false} read_receipt="read" timestamp="4:23 PM"></VoiceMessage>
            <MediaMessage assets={[]} author="Mahim Yadav" caption="This Project is really Awesome" incoming={true} read_receipt="sent" timestamp="5:32 PM"></MediaMessage>
          <div className="max-w-125 w-fit">
            <p className="mb-2.5 text-sm font-medium">Andri Thomas</p>
            <div className="rounded-2xl mb-2.5 rounded-tl-none bg-gray px-5 py-3 dark:bg-boxdark-2">
              <p>Okay fine lmk.</p>
            </div>
            <p className="text-xs">2:07 pm</p>
          </div>

          <div className="max-w-125 ml-auto text-right w-fit">
            <div className="rounded-2xl mb-2.5 rounded-br-none bg-primary px-5 py-3 ">
              <p className="text-white">
                Not possible already busy in a meeting.
              </p>
            </div>
            <p className="text-xs">4:05 pm</p>
          </div>

          <div className="max-w-125 w-fit">
            <p className="mb-2.5 text-sm font-medium">Andri Thomas</p>
            <div className="rounded-2xl mb-2.5 rounded-tl-none bg-gray px-5 py-3 dark:bg-boxdark-2">
              <p>What about after 5pm ?</p>
            </div>
            <p className="text-xs">4:55pm</p>
          </div>

          <div className="max-w-125 ml-auto text-right w-fit">
            <div className="rounded-2xl mb-2.5 rounded-br-none bg-primary px-5 py-3 ">
              <p className="text-white">
                Yes it is possible but just for 50 minutes.
              </p>
            </div>
            <p className="text-xs">5:30 pm</p>
          </div>

          <div className="max-w-125 w-fit">
            <p className="mb-2.5 text-sm font-medium">Andri Thomas</p>
            <div className="rounded-2xl mb-2.5 rounded-tl-none bg-gray px-5 py-3 dark:bg-boxdark-2">
              <p>Okay I am fine with that.</p>
            </div>
            <p className="text-xs">6:12 pm</p>
          </div>

          <div className="max-w-125 ml-auto text-right w-fit">
            <div className="rounded-2xl mb-2.5 rounded-br-none bg-primary px-5 py-3 ">
              <p className="text-white">
                Sent you meeting link through mail. Pls check.
              </p>
            </div>
            <p className="text-xs">9:00 pm</p>
          </div>

          <TypingIndicator></TypingIndicator>
        </div>

        {/* Input Section */}
        <div className="sticky bottom-0 border-t border-stroke bg-white px-6 py-5 dark:border-strokedark dark:bg-boxdark ">
          <form
            action=""
            className="flex items-center justify-between space-x-4.5"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Type your message..."
                className="h-13 w-full rounded-md border border-stroke bg-gray pl-5 pr-19 text-black placeholder-body outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
              />

              <div className="absolute right-5 top-1/2 -translate-y-1/2 items-center justify-end space-x-4">
                <button className="hover:text-primary">
                  <MicrophoneIcon size={20} onClick={handleMicClick} ></MicrophoneIcon>
                </button>
                <button className="hover:text-primary">
                  <Attachment size={20}></Attachment>
                </button>
                <button className="hover:text-primary" onClick={handleToggleGif}>
                  <GifIcon size={20}></GifIcon>
                </button>
                <button className="hover:text-primary">
                  <EmojiPicker></EmojiPicker>
                </button>
              </div>
            </div>
            <button className="flex items-center justify-center h-13 max-w-13 w-full rounded-md bg-primary text-white hover:bg-opacity-90">
              <PaperPlaneTiltIcon size={24} weight="bold"></PaperPlaneTiltIcon>
            </button>
          </form>
          {gifOpen && <Giphy/>}
          {/* <Giphy></Giphy> */}
        </div>
      </div>

      {videoCall && <VideoRoom open={videoCall} handleClose={handleToggleVideoCall}/>}
      {audioCall && <AudioRoom open={audioCall} handleClose={handleToggleAudioCall}/>}

      {userInfoOpen && (
        <div className="w-1/4">
          <UserInfo handleToggleUserInfo={handleToggleUserInfo}></UserInfo>
        </div>
      )}
    </>
  );
}
export default Inbox;
