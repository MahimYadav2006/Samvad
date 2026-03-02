import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ChatList } from "../section/chat";
import { MessageInbox } from "../section/chat";
import GifModal from "../components/GifModal";
import VoiceRecorder from "../components/VoiceRecorder";
import MediaPicker from "../components/MediaPicker";
import DocumentPicker from "../components/DocumentPicker";
import { fetchUserList } from "../redux/slices/chat";
import { startConversation } from "../redux/slices/user";
import { isJwtToken } from "../utils/authToken";

export default function Messages() {
  const [otherPerson, setOtherPerson] = useState(null);
  const [showChatListMobile, setShowChatListMobile] = useState(true);
  const [chatListWidth, setChatListWidth] = useState(() => {
    const savedWidth = Number(
      window.localStorage.getItem("samvad-chat-list-width") || 320
    );
    if (Number.isNaN(savedWidth)) return 320;
    return Math.min(430, Math.max(260, savedWidth));
  });
  const [isResizing, setIsResizing] = useState(false);
  const layoutRef = useRef(null);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const userList = useSelector((state) => state.chat.userList);

  useEffect(() => {
    if (isJwtToken(token)) {
      dispatch(fetchUserList());
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (userList.length === 0) {
      setOtherPerson(null);
      setShowChatListMobile(true);
      return;
    }
    if (otherPerson && !userList.some((user) => user._id === otherPerson)) {
      setOtherPerson(null);
      setShowChatListMobile(true);
    }
  }, [userList, otherPerson]);

  useEffect(() => {
    if (otherPerson) {
      dispatch(startConversation({ userId: otherPerson }));
    }
  }, [dispatch, otherPerson]);

  useEffect(() => {
    const storedWidth = Number(chatListWidth);
    if (Number.isNaN(storedWidth)) return;
    window.localStorage.setItem("samvad-chat-list-width", String(storedWidth));
  }, [chatListWidth]);

  useEffect(() => {
    if (!isResizing) return undefined;

    const handlePointerMove = (event) => {
      const layout = layoutRef.current;
      if (!layout) return;

      const rect = layout.getBoundingClientRect();
      const availableWidth = rect.width;
      const minWidth = 260;
      const maxWidth = Math.min(430, Math.max(minWidth, availableWidth - 520));
      const nextWidth = event.clientX - rect.left;
      const clampedWidth = Math.min(maxWidth, Math.max(minWidth, nextWidth));
      setChatListWidth(clampedWidth);
    };

    const stopResizing = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResizing);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResizing);
    };
  }, [isResizing]);

  const handleConversationSelect = (userId) => {
    setOtherPerson(userId);
    setShowChatListMobile(false);
  };

  const startResize = () => {
    setIsResizing(true);
  };

  return (
    <>
      <div ref={layoutRef} className="flex h-full w-full overflow-hidden">
        <div
          style={{ "--chat-list-width": `${chatListWidth}px` }}
          className={`${showChatListMobile ? "flex" : "hidden"} min-h-0 w-full md:flex md:w-[var(--chat-list-width)]`}
        >
          <ChatList
            otherPerson={otherPerson}
            setOtherPerson={setOtherPerson}
            userList={userList}
            onConversationSelected={handleConversationSelect}
            className="w-full"
          />
        </div>

        <button
          type="button"
          onPointerDown={startResize}
          onDoubleClick={() => setChatListWidth(320)}
          className={`group hidden w-1.5 shrink-0 cursor-col-resize items-center justify-center md:flex ${
            isResizing ? "bg-primary/8" : ""
          }`}
          title="Drag to resize. Double click to reset."
          aria-label="Resize chat list panel"
        >
          <span
            className={`h-12 w-0.5 rounded-full transition-all ${
              isResizing
                ? "bg-primary/70"
                : "bg-stroke/60 group-hover:bg-primary/40 dark:bg-strokedark/50"
            }`}
          />
        </button>

        <MessageInbox
          otherPerson={otherPerson}
          onBackToList={() => setShowChatListMobile(true)}
          className={`${showChatListMobile ? "hidden" : "block"} min-w-0 flex-1 md:block`}
        />
      </div>
      <GifModal />
      <VoiceRecorder />
      <MediaPicker />
      <DocumentPicker />
    </>
  );
}
