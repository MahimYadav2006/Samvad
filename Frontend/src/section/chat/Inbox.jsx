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
import React, { useState, useEffect } from "react";
import UserInfo from "./UserInfo";
import Giphy from "../../components/Giphy";
import { useDispatch, useSelector } from "react-redux";
import { toggleAudioModal } from "../../redux/slices/app";
import Attachment from "../../components/Attachment";
import MsgSeparator from "../../components/MsgSeparator";
import TypingIndicator from "../../components/TypingIndicator";
import { TextMessage, DocumentMessage, VoiceMessage } from "../../components/Messages/index";
import VideoRoom from "../../components/VideoRoom";
import AudioRoom from "../../components/AudioRoom";
import { startConversation } from "../../redux/slices/user";
import { newDirectMessage } from "../../redux/slices/chat";
import { findOppositeUser } from "../../redux/slices/user";
import GiphyMessage from "../../components/Messages/GiphyMessage";
import MediaMessage from "../../components/Messages/MediaMessage";
import { useCall } from "../../context/CallContext";

function Inbox({ otherPerson }) {
  const dispatch = useDispatch();
  const { initiateCall } = useCall(); // WebRTC call hook
  
  const [userInfoOpen, setUserInfoOpen] = useState(false);
  const [gifOpen, setGifOpen] = useState(false);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    if (otherPerson !== null) {
      console.log("Entered the inbox and finded and started the conversation with the otherperson", otherPerson);
      dispatch(startConversation(otherPerson));
      dispatch(findOppositeUser(otherPerson));
    } else {
      console.log("Entered the inbox but otherperson is null");
    }
  }, [dispatch, otherPerson]);

  const currMessages = useSelector((state) => state.user.currMessages);
  const oppositeUser = useSelector((state) => state.user.oppositeUser);
  const user = useSelector((state) => state.user.user);

  const handleToggleGif = (e) => {
    e.preventDefault();
    setGifOpen((prev) => !prev);
  };

  const handleToggleUserInfo = () => {
    setUserInfoOpen((prev) => !prev);
  };

  const handleMicClick = (e) => {
    e.preventDefault();
    dispatch(toggleAudioModal(true));
  };

  // Updated Video Call Handler using WebRTC
  const handleToggleVideoCall = (e) => {
    e.preventDefault();
    if (oppositeUser && oppositeUser._id) {
      initiateCall(oppositeUser, "video");
    } else {
      console.error("Cannot initiate call: oppositeUser not found");
    }
  };

  // Updated Audio Call Handler using WebRTC
  const handleToggleAudioCall = (e) => {
    e.preventDefault();
    if (oppositeUser && oppositeUser._id) {
      initiateCall(oppositeUser, "audio");
    } else {
      console.error("Cannot initiate call: oppositeUser not found");
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    dispatch(newDirectMessage({ 
      content: messageText, 
      author: user._id, 
      media: null, 
      audioUrl: null, 
      document: null, 
      type: null, 
      giphyUrl: null 
    }));
    setMessageText("");
  };

  return (
    <>
      <div className={`flex h-full flex-col border-l border-stroke p-2 dark:border-strokedark ${userInfoOpen ? "w-1/2" : "w-3/4"}`}>
        {/* Chat Header - Updated with WebRTC Integration */}
        <div className="sticky flex items-center flex-row justify-between border-b dark:border-strokedark px-6 py-4.5">
          <div className="flex items-center cursor-pointer" onClick={handleToggleUserInfo}>
            <div className="mr-4.5 h-13 w-full max-w-13 overflow-hidden rounded-full">
              <img
                src={oppositeUser.avatar || User01}
                alt="avatar"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div>
              <h5 className="font-medium text-black dark:text-white">
                {oppositeUser.name || "User Name"}
              </h5>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {oppositeUser.online ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          <div className="flex flex-row align-center space-x-4">
            {/* Video Call Button */}
            <button
              onClick={handleToggleVideoCall}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
              title="Start Video Call"
              disabled={!oppositeUser || !oppositeUser._id}
            >
              <VideoCameraIcon size={24} className="text-gray-700 dark:text-gray-300" />
            </button>

            {/* Audio Call Button */}
            <button
              onClick={handleToggleAudioCall}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
              title="Start Audio Call"
              disabled={!oppositeUser || !oppositeUser._id}
            >
              <PhoneCallIcon size={24} className="text-gray-700 dark:text-gray-300" />
            </button>

            {/* More Options */}
            <Dropdown />
          </div>
        </div>

        {/* Messages */}
        <div className="max-h-full space-y-3.5 overflow-auto no-scrollbar px-6 py-7.5 grow">
          {currMessages && currMessages.length === 0 && (
            <div className="flex items-center justify-center m-auto dark:text-white text-black">
              Send Message and Start Conversation
            </div>
          )}
          
          {currMessages && currMessages.map((message, index) => {
            if (message.content !== null && message.giphyUrl === null && message.media === null && message.audioUrl === null && (message.document === null || message.document === undefined)) {
              return (
                <TextMessage
                  key={index}
                  author={message.author}
                  content={message.content}
                  read_receipt={message.read_receipt}
                  incoming={message.author !== user._id}
                />
              );
            } else if (message.document !== null && message.document !== undefined) {
              return (
                <DocumentMessage
                  key={index}
                  author={message.author}
                  text={message.content}
                  incoming={message.author !== user._id}
                  document={message.document}
                />
              );
            } else if (message.audioUrl !== null) {
              return (
                <VoiceMessage 
                  audioUrl={message.audioUrl} 
                  incoming={message.author !== user._id} 
                  author={message.author} 
                  key={index}
                />
              );
            } else if (message.giphyUrl !== null) {
              return (
                <GiphyMessage
                  key={index}
                  incoming={message.author !== user._id}
                  author={message.author}
                  timestamp={message.timestamp}
                  read_receipt={message.read_receipt}
                  giphyUrl={message.giphyUrl}
                  content={message.content}
                />
              );
            } else if (message.media != null && message.media.length > 0) {
              return (
                <MediaMessage
                  key={index}
                  incoming={message.author !== user._id}
                  author={message.author}
                  timestamp={message.timestamp}
                  read_receipt={message.read_receipt}
                  media={message.media}
                  content={message.content}
                />
              );
            }
            return null;
          })}
        </div>

        {/* Input Section */}
        <div className="sticky bottom-0 border-t border-stroke bg-white px-6 py-5 dark:border-strokedark dark:bg-boxdark">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center justify-between space-x-4.5"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="h-13 w-full rounded-md border border-stroke bg-gray pl-5 pr-19 text-black placeholder-body outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
              />

              <div className="absolute right-5 top-1/2 -translate-y-1/2 items-center justify-end space-x-4">
                <button className="hover:text-primary" type="button">
                  <MicrophoneIcon size={20} onClick={handleMicClick} />
                </button>
                <button className="hover:text-primary" type="button">
                  <Attachment size={20} />
                </button>
                <button className="hover:text-primary" type="button" onClick={handleToggleGif}>
                  <GifIcon size={20} />
                </button>
                <button className="hover:text-primary" type="button">
                  <EmojiPicker onEmojiSelect={(emoji) => {
                    setMessageText((prev) => prev + emoji.native);
                  }} />
                </button>
              </div>
            </div>
            <button 
              type="submit"
              className="flex items-center justify-center h-13 max-w-13 w-full rounded-md bg-primary text-white hover:bg-opacity-90"
            >
              <PaperPlaneTiltIcon size={24} weight="bold" />
            </button>
          </form>
          {gifOpen && <Giphy />}
        </div>
      </div>

      {userInfoOpen && (
        <div className="w-1/4">
          <UserInfo handleToggleUserInfo={handleToggleUserInfo} />
        </div>
      )}
    </>
  );
}

export default Inbox;
