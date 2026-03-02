import User01 from "../../images/user/user-01.png";
import {
  PaperPlaneTiltIcon,
  VideoCameraIcon,
  PhoneCallIcon,
  GifIcon,
  MicrophoneIcon,
  CaretLeftIcon,
  UserCircleIcon,
  ChatCircleTextIcon,
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
          <header className="flex items-center justify-between border-b border-stroke/50 bg-white/50 px-3 py-2.5 backdrop-blur-sm dark:border-strokedark/40 dark:bg-boxdark/50 md:px-5 md:py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                type="button"
                onClick={onBackToList}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-body/70 transition-colors hover:bg-gray-2 dark:text-bodydark/60 dark:hover:bg-meta-4/50 md:hidden"
              >
                <CaretLeftIcon size={18} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                disabled={!oppositeUser || !oppositeUser._id}
                className="flex min-w-0 items-center gap-2.5 text-left transition-opacity disabled:opacity-60"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
                  <img
                    src={oppositeUser.avatar || User01}
                    alt="avatar"
                    className="h-full w-full object-cover object-center"
                  />
                  {oppositeUser.name && (
                    `${oppositeUser.status || ""}`.toLowerCase() === "online" ? (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-[1.5px] border-white dark:border-boxdark">
                        <span className="absolute inset-0 rounded-full bg-success" />
                      </span>
                    ) : (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-[1.5px] border-white bg-body/30 dark:border-boxdark dark:bg-bodydark/30" />
                    )
                  )}
                </div>
                <div className="min-w-0">
                  <h5 className="truncate text-sm font-semibold text-black dark:text-white">
                    {oppositeUser.name || "Select a chat"}
                  </h5>
                  <p className={`text-[11px] font-medium ${
                    isOppositeUserTyping
                      ? "text-primary"
                      : `${oppositeUser.status || ""}`.toLowerCase() === "online"
                        ? "text-success"
                        : "text-body/60 dark:text-bodydark/50"
                  }`}>
                    {isOppositeUserTyping
                      ? "typing..."
                      : `${oppositeUser.status || "Offline"}`}
                  </p>
                </div>
              </button>
            </div>

            <div className="relative flex items-center gap-1">
              <button
                onClick={handleToggleAudioCall}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-body/50 transition-colors hover:bg-gray-2 hover:text-primary disabled:opacity-40 dark:text-bodydark/40 dark:hover:bg-meta-4/50 md:h-9 md:w-9"
                title="Audio call"
                disabled={!oppositeUser || !oppositeUser._id}
                type="button"
              >
                <PhoneCallIcon size={17} />
              </button>

              <button
                onClick={handleToggleVideoCall}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-body/50 transition-colors hover:bg-gray-2 hover:text-primary disabled:opacity-40 dark:text-bodydark/40 dark:hover:bg-meta-4/50 md:h-9 md:w-9"
                title="Video call"
                disabled={!oppositeUser || !oppositeUser._id}
                type="button"
              >
                <VideoCameraIcon size={17} />
              </button>

              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-body/50 transition-colors hover:bg-gray-2 hover:text-primary disabled:opacity-40 dark:text-bodydark/40 dark:hover:bg-meta-4/50 md:h-9 md:w-9"
                title="View profile"
                disabled={!oppositeUser || !oppositeUser._id}
                type="button"
              >
                <UserCircleIcon size={17} />
              </button>

              <Dropdown />
            </div>
          </header>

          <div
            ref={messagesContainerRef}
            className="fancy-scrollbar no-scrollbar flex-1 space-y-3 overflow-y-auto px-3 py-4 md:px-6 md:py-6"
          >
            {!hasConversation && (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8 dark:bg-primary/10">
                  <ChatCircleTextIcon size={28} weight="duotone" className="text-primary/70" />
                </div>
                <p className="mt-4 text-sm font-semibold text-black dark:text-white">
                  Select a conversation
                </p>
                <p className="mt-1 max-w-[240px] text-xs text-body/60 dark:text-bodydark/50">
                  Choose someone from the list to start chatting.
                </p>
              </div>
            )}

            {hasConversation && currMessages && currMessages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <p className="rounded-full bg-gray-2/80 px-4 py-1.5 text-xs font-medium text-body/60 dark:bg-meta-4/50 dark:text-bodydark/50">
                  Send a message to start this conversation
                </p>
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

          <div className="border-t border-stroke/50 bg-white/60 px-3 py-2.5 backdrop-blur-sm dark:border-strokedark/40 dark:bg-boxdark-2/60 md:px-5 md:py-3">
            {gifOpen && <Giphy />}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <div className="relative min-w-0 flex-1">
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
                  className="h-11 w-full rounded-xl border border-stroke/70 bg-white py-2 pl-4 pr-32 text-sm text-black placeholder-body/60 outline-none transition-colors focus:border-primary/50 dark:border-strokedark/60 dark:bg-form-input dark:text-white dark:placeholder-bodydark/40 md:h-12 md:pr-36"
                />

                <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1 text-body/50 dark:text-bodydark/40 md:gap-1.5">
                  <button className="rounded-lg p-1.5 transition-colors hover:bg-gray-2 hover:text-primary dark:hover:bg-meta-4/50" type="button" onClick={handleMicClick} title="Voice message">
                    <MicrophoneIcon size={18} />
                  </button>
                  <Attachment />
                  <button className="rounded-lg p-1.5 transition-colors hover:bg-gray-2 hover:text-primary dark:hover:bg-meta-4/50" type="button" onClick={handleToggleGif} title="Send GIF">
                    <GifIcon size={18} />
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
                disabled={!messageText.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-40 disabled:shadow-none md:h-12 md:w-12"
              >
                <PaperPlaneTiltIcon size={18} weight="bold" />
              </button>
            </form>
          </div>
        </div>

      {isProfileOpen && (
        <>
          <button
            type="button"
            aria-label="Close profile panel"
            className="absolute inset-0 z-20 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setIsProfileOpen(false)}
          />
          <aside className="absolute bottom-2 right-2 top-2 z-30 w-[min(90vw,340px)] overflow-hidden rounded-2xl border border-stroke/50 bg-white shadow-2xl shadow-black/10 dark:border-strokedark/40 dark:bg-boxdark">
            <UserInfo handleToggleUserInfo={() => setIsProfileOpen(false)} />
          </aside>
        </>
      )}
      </div>
  );
}

export default Inbox;
