import React, { useEffect, useRef, useState } from "react";
import { XIcon, PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { useDispatch, useSelector } from "react-redux";
import { toggleGifModal } from "../redux/slices/app";
import { newDirectMessage } from "../redux/slices/chat";

export default function GifModal() {
  const gif = useSelector((state) => state.app.modals.gif);
  const selectedGifUrl = useSelector((state) => state.app.selectedGifUrl);
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const [messageText, setMessageText] = useState("");
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const keyHandler = (event) => {
      if (!gif || event.key !== "Escape") return;
      dispatch(
        toggleGifModal({
          value: false,
          url: "",
        })
      );
    };
    document.addEventListener("keydown", keyHandler);

    return () => document.removeEventListener("keydown", keyHandler);
  }, [gif, dispatch]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!selectedGifUrl) return;
    dispatch(newDirectMessage({ content: messageText, author: user._id, media: null, audioUrl: null, document: null, type: null, giphyUrl: selectedGifUrl }));
    setMessageText("");
  };

  return (
    <div
      className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-5 ${
        gif ? "block" : "hidden"
      }`}
    >
      <div
        ref={modalRef}
        className="w-full max-w-142.5 rounded-2xl bg-white dark:bg-boxdark shadow-2xl px-6 py-6 md:px-8 md:py-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="text-base font-bold text-black dark:text-white">
            Send Giphy
          </div>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg text-body/50 transition-colors hover:bg-gray-2 hover:text-black dark:text-bodydark/40 dark:hover:bg-meta-4/50 dark:hover:text-white"
            onClick={() => {
              dispatch(
                toggleGifModal({
                  value: false,
                  url: "",
                })
              );
            }}
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* GIF Preview */}
        <img
          src={selectedGifUrl}
          alt=""
          className="rounded-xl max-h-80 w-full object-contain"
        />

        {/* Input + Send */}
        <div className="flex items-center gap-2 mt-4">
          <input
            type="text"
            className="w-full rounded-xl border border-stroke/70 bg-white py-2.5 pl-4 pr-4 text-sm outline-none transition-colors focus:border-primary/50 dark:border-strokedark/60 dark:bg-form-input dark:text-white"
            placeholder="Type your message.."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <button
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
            onClick={handleSendMessage}
          >
            <PaperPlaneTiltIcon size={18} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
