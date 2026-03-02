import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PaperPlaneTiltIcon, XIcon } from "@phosphor-icons/react";
import { toggleMediaModal } from "../redux/slices/app";
import MediaDropZone from "./MediaDropZone";
import { newDirectMessage } from "../redux/slices/chat";

export default function MediaPicker() {
  const modalRef = useRef(null);
  const dispatch = useDispatch();
  const media = useSelector((state) => state.app.modals.media);
  const [fileData, setFileData] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    const keyHandler = (event) => {
      if (!media || event.key !== "Escape") return;
      dispatch(toggleMediaModal(false));
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [media, dispatch]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!fileData?.url) return;
    dispatch(
      newDirectMessage({
        content: messageText,
        author: user._id,
        media: [
          {
            type: fileData?.type?.startsWith("video/") ? "video" : "image",
            url: fileData?.url,
          },
        ],
        audioUrl: null,
        document: null,
        type: null,
        giphyUrl: null,
      })
    );
    setMessageText("");
    setFileData(null);
    dispatch(toggleMediaModal(false));
  };

  return (
    <div
      className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-5 ${
        media ? "block" : "hidden"
      }`}
    >
      <div
        ref={modalRef}
        className="w-full max-w-142.5 rounded-2xl bg-white dark:bg-boxdark px-6 py-6 md:px-8 md:py-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-black dark:text-white">
            Send Media
          </h3>
          <button
            onClick={() => dispatch(toggleMediaModal(false))}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-body/50 transition-colors hover:bg-gray-2 hover:text-black dark:text-bodydark/40 dark:hover:bg-meta-4/50 dark:hover:text-white"
          >
            <XIcon size={16} />
          </button>
        </div>

        <MediaDropZone
          acceptedFiles="image/*,video/*"
          fileData={fileData}
          setFileData={setFileData}
        />

        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 mt-4"
        >
          <input
            type="text"
            className="flex-1 rounded-xl border border-stroke/70 bg-white py-2.5 pl-4 pr-4 text-sm outline-none transition-colors focus:border-primary/50 dark:border-strokedark/60 dark:bg-form-input dark:text-white"
            placeholder="Add a caption..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <button
            type="submit"
            disabled={!fileData?.url}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-40 disabled:shadow-none"
          >
            <PaperPlaneTiltIcon size={18} weight="bold" />
          </button>
        </form>
      </div>
    </div>
  );
}
