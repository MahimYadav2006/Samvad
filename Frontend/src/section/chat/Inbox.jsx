import User01 from "../../images/user/user-01.png";
import {
  PaperPlaneTiltIcon,
  VideoCameraIcon,
  PhoneCallIcon,
  GifIcon,
  MicrophoneIcon,
  CaretLeftIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import Dropdown from "../../components/Dropdown";
import EmojiPicker from "../../components/EmojiPicker";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Giphy from "../../components/Giphy";
import { useDispatch, useSelector } from "react-redux";
import { toggleAudioModal } from "../../redux/slices/app";
import Attachment from "../../components/Attachment";
import { TextMessage, DocumentMessage, VoiceMessage } from "../../components/Messages/index";
import { newDirectMessage } from "../../redux/slices/chat";
import { findOppositeUser } from "../../redux/slices/user";
import GiphyMessage from "../../components/Messages/GiphyMessage";
import MediaMessage from "../../components/Messages/MediaMessage";
import { useCall } from "../../context/CallContext";
import UserInfo from "./UserInfo";
import TypingIndicator from "../../components/TypingIndicator";
import { getSocket } from "../../utils/socket";

function Inbox({ otherPerson, onBackToList, className = "" }) {
  const dispatch = useDispatch();
  const { initiateCall } = useCall();

  const [gifOpen, setGifOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const messagesContainerRef = useRef(null);
  const previousConversationRef = useRef(null);
  const previousMessageCountRef = useRef(0);

  useEffect(() => {
    if (otherPerson !== null) {
      dispatch(findOppositeUser(otherPerson));
    }
  }, [dispatch, otherPerson]);

  const currMessages = useSelector((state) => state.user.currMessages);
  const oppositeUser = useSelector((state) => state.user.oppositeUser);
  const user = useSelector((state) => state.user.user);
  const currConversation = useSelector((state) => state.user.currConversation);
  const typingIndicators = useSelector((state) => state.chat.typingIndicators);
  const currentUserId = user?._id;
  const hasConversation = Boolean(otherPerson);
  const isOppositeUserTyping = currConversation && typingIndicators[currConversation];

  // Typing event refs
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const emitStartTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket || !oppositeUser?._id || !currConversation) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("start-typing", {
        userId: oppositeUser._id,
        conversationId: currConversation,
      });
    }

    // Reset the stop-typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("stop-typing", {
        userId: oppositeUser._id,
        conversationId: currConversation,
      });
    }, 2000);
  }, [oppositeUser?._id, currConversation]);

  const emitStopTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket || !oppositeUser?._id || !currConversation) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      socket.emit("stop-typing", {
        userId: oppositeUser._id,
        conversationId: currConversation,
      });
    }
  }, [oppositeUser?._id, currConversation]);

  // Cleanup typing timeout on unmount or conversation change
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Emit stop typing when switching conversations
      emitStopTyping();
    };
  }, [currConversation, emitStopTyping]);

  const handleToggleGif = (e) => {
    e.preventDefault();
    setGifOpen((prev) => !prev);
  };

  const handleMicClick = (e) => {
    e.preventDefault();
    dispatch(toggleAudioModal(true));
  };

  const handleToggleVideoCall = (e) => {
    e.preventDefault();
    if (oppositeUser && oppositeUser._id) {
      initiateCall(oppositeUser, "video");
    }
  };

  const handleToggleAudioCall = (e) => {
    e.preventDefault();
    if (oppositeUser && oppositeUser._id) {
      initiateCall(oppositeUser, "audio");
    }
  };

  const scrollToBottom = (behavior = "auto") => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  useEffect(() => {
    if (!hasConversation) return;

    const nextMessageCount = currMessages?.length || 0;
    const isConversationChanged = previousConversationRef.current !== otherPerson;

    if (isConversationChanged) {
      requestAnimationFrame(() => scrollToBottom("auto"));
    } else if (nextMessageCount > previousMessageCountRef.current) {
      requestAnimationFrame(() => scrollToBottom("smooth"));
    }

    previousConversationRef.current = otherPerson;
    previousMessageCountRef.current = nextMessageCount;
  }, [currMessages, otherPerson, hasConversation]);

  // Auto-scroll when typing indicator appears
  useEffect(() => {
    if (isOppositeUserTyping) {
      requestAnimationFrame(() => scrollToBottom("smooth"));
    }
  }, [isOppositeUserTyping]);

  useEffect(() => {
    setIsProfileOpen(false);
  }, [otherPerson]);

  useEffect(() => {
    if (!isProfileOpen) return undefined;

    const closeOnEsc = (event) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEsc);
    return () => window.removeEventListener("keydown", closeOnEsc);
  }, [isProfileOpen]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !currentUserId) return;

    emitStopTyping();
    dispatch(
      newDirectMessage({
        content: messageText,
        author: currentUserId,
        media: null,
        audioUrl: null,
        document: null,
        type: null,
        giphyUrl: null,
      })
    );
    setMessageText("");
  };

  return (
    <div className={`relative h-full min-w-0 w-full ${className}`}>
      <div className="flex h-full min-w-0 w-full flex-col bg-white/30 dark:bg-boxdark/30">
          <header className="flex items-center justify-between border-b border-stroke/70 px-3 py-3 md:px-5 md:py-4 dark:border-strokedark/70">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={onBackToList}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-stroke bg-white text-body dark:border-strokedark dark:bg-boxdark md:hidden"
              >
                <CaretLeftIcon size={18} />
              </button>
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                disabled={!oppositeUser || !oppositeUser._id}
                className="flex min-w-0 items-center gap-3 text-left disabled:opacity-80"
              >
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl">
                  <img
                    src={oppositeUser.avatar || User01}
                    alt="avatar"
                    className="h-full w-full object-cover object-center"
                  />
                  {oppositeUser.name && (
                    `${oppositeUser.status || ""}`.toLowerCase() === "online" ? (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-boxdark">
                        <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-40" />
                        <span className="absolute inset-0 rounded-full bg-success" />
                      </span>
                    ) : (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-graydark dark:border-boxdark" />
                    )
                  )}
                </div>
                <div className="min-w-0">
                  <h5 className="truncate text-sm font-bold text-black dark:text-white md:text-base">
                    {oppositeUser.name || "Select a chat"}
                  </h5>
                  <div className="flex items-center gap-1.5">
                    {oppositeUser.name && (
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${
                          `${oppositeUser.status || ""}`.toLowerCase() === "online"
                            ? "bg-success animate-pulse"
                            : "bg-graydark"
                        }`}
                      />
                    )}
                    <p className={`text-xs font-medium ${
                      `${oppositeUser.status || ""}`.toLowerCase() === "online"
                        ? "text-success"
                        : "text-body dark:text-bodydark"
                    }`}>
                      {isOppositeUserTyping
                        ? "typing..."
                        : `${oppositeUser.status || "Offline"}`}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="relative flex items-center gap-1.5 md:gap-2">
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-stroke bg-white text-body hover:border-primary hover:text-primary disabled:opacity-50 dark:border-strokedark dark:bg-boxdark-2 dark:text-bodydark md:h-10 md:w-10"
                title="View profile"
                disabled={!oppositeUser || !oppositeUser._id}
                type="button"
              >
                <UserCircleIcon size={18} />
              </button>

              <button
                onClick={handleToggleVideoCall}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-stroke bg-white text-body hover:border-primary hover:text-primary disabled:opacity-50 dark:border-strokedark dark:bg-boxdark-2 dark:text-bodydark md:h-10 md:w-10"
                title="Start Video Call"
                disabled={!oppositeUser || !oppositeUser._id}
                type="button"
              >
                <VideoCameraIcon size={18} />
              </button>

              <button
                onClick={handleToggleAudioCall}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-stroke bg-white text-body hover:border-primary hover:text-primary disabled:opacity-50 dark:border-strokedark dark:bg-boxdark-2 dark:text-bodydark md:h-10 md:w-10"
                title="Start Audio Call"
                disabled={!oppositeUser || !oppositeUser._id}
                type="button"
              >
                <PhoneCallIcon size={18} />
              </button>

              <Dropdown />
            </div>
          </header>

          <div
            ref={messagesContainerRef}
            className="fancy-scrollbar no-scrollbar flex-1 space-y-3 overflow-y-auto px-3 py-4 md:px-6 md:py-6"
          >
            {!hasConversation && (
              <div className="mx-auto mt-12 max-w-md rounded-2xl border border-dashed border-stroke px-6 py-8 text-center dark:border-strokedark">
                <p className="text-sm font-semibold text-black dark:text-white">
                  Select a conversation to start chatting
                </p>
                <p className="mt-1 text-xs text-body dark:text-bodydark">
                  Your messages will appear here in real time.
                </p>
              </div>
            )}

            {hasConversation && currMessages && currMessages.length === 0 && (
              <div className="mx-auto mt-10 max-w-sm rounded-2xl bg-gray-2 px-4 py-3 text-center text-sm font-semibold text-body dark:bg-meta-4 dark:text-bodydark">
                Send a message to start this conversation.
              </div>
            )}

            {currMessages &&
              currMessages.map((message, index) => {
                if (
                  message.content !== null &&
                  message.giphyUrl === null &&
                  message.media === null &&
                  message.audioUrl === null &&
                  (message.document === null || message.document === undefined)
                ) {
                  return (
                    <TextMessage
                      key={index}
                      author={message.author}
                      content={message.content}
                      read_receipt={message.read_receipt}
                      incoming={message.author !== currentUserId}
                    />
                  );
                } else if (message.document !== null && message.document !== undefined) {
                  return (
                    <DocumentMessage
                      key={index}
                      author={message.author}
                      text={message.content}
                      incoming={message.author !== currentUserId}
                      document={message.document}
                    />
                  );
                } else if (message.audioUrl !== null) {
                  return (
                    <VoiceMessage
                      audioUrl={message.audioUrl}
                      incoming={message.author !== currentUserId}
                      author={message.author}
                      key={index}
                    />
                  );
                } else if (message.giphyUrl !== null) {
                  return (
                    <GiphyMessage
                      key={index}
                      incoming={message.author !== currentUserId}
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
                      incoming={message.author !== currentUserId}
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

            {/* Typing indicator */}
            {isOppositeUserTyping && <TypingIndicator />}
          </div>

          <div className="border-t border-stroke/70 bg-white/80 px-3 py-3 dark:border-strokedark/70 dark:bg-boxdark-2/70 md:px-6 md:py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="space-y-3"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => {
                    setMessageText(e.target.value);
                    if (e.target.value.trim()) {
                      emitStartTyping();
                    } else {
                      emitStopTyping();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      emitStopTyping();
                      handleSendMessage();
                    }
                  }}
                  className="h-12 w-full rounded-2xl border border-stroke bg-white py-2.5 pl-4 pr-36 text-sm text-black placeholder-body dark:border-form-strokedark dark:bg-form-input dark:text-white md:h-13"
                />

                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2 text-bodydark2">
                  <button className="hover:text-primary" type="button" onClick={handleMicClick}>
                    <MicrophoneIcon size={20} />
                  </button>
                  <Attachment />
                  <button className="hover:text-primary" type="button" onClick={handleToggleGif}>
                    <GifIcon size={20} />
                  </button>
                  <EmojiPicker
                    onEmojiSelect={(emoji) => {
                      setMessageText((prev) => prev + emoji.native);
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 md:h-12"
              >
                <PaperPlaneTiltIcon size={18} weight="bold" />
                Send
              </button>
            </form>
            {gifOpen && <Giphy />}
          </div>
        </div>

      {isProfileOpen && (
        <>
          <button
            type="button"
            aria-label="Close profile panel"
            className="absolute inset-0 z-20 bg-black/30 backdrop-blur-[1px]"
            onClick={() => setIsProfileOpen(false)}
          />
          <aside className="absolute bottom-3 right-3 top-3 z-30 w-[min(92vw,360px)] overflow-hidden rounded-3xl border border-stroke/70 shadow-2xl shadow-black/20 dark:border-strokedark/70">
            <UserInfo handleToggleUserInfo={() => setIsProfileOpen(false)} />
          </aside>
        </>
      )}
      </div>
  );
}

export default Inbox;
