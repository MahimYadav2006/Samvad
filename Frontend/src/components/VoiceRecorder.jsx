import { useRef, useEffect, useState, useCallback } from "react";
import { XIcon } from "@phosphor-icons/react";
import { useDispatch, useSelector } from "react-redux";
import { toggleAudioModal } from "../redux/slices/app";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";
import { uploadAudioMessage, newDirectMessage } from "../redux/slices/chat";

export default function VoiceRecorder() {
  const modalRef = useRef(null);
  const dispatch = useDispatch();
  const audioModal = useSelector((state) => state.app.modals.audio);
  const user = useSelector((state) => state.auth.user);

  const recorderControls = useAudioRecorder();

  const [audioUrl, setAudioUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleCancel = useCallback(() => {
    setAudioUrl(null);
    setUploading(false);
    dispatch(toggleAudioModal(false));
  }, [dispatch]);

  useEffect(() => {
    const keyHandler = (event) => {
      if (!audioModal || event.key !== "Escape") return;
      handleCancel();
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [audioModal, handleCancel]);

  const handleRecordingComplete = (blob) => {
    setUploading(true);
    dispatch(uploadAudioMessage(blob))
      .then((cloudUrl) => {
        setAudioUrl(cloudUrl);
      })
      .catch((err) => {
        console.error("Audio upload failed:", err);
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const handleSendMessage = () => {
    if (!audioUrl) return;

    dispatch(
      newDirectMessage({
        content: "",
        author: user._id,
        media: null,
        audioUrl,
        document: null,
        type: null,
        giphyUrl: null,
      })
    );

    handleCancel(); // close modal & reset state
  };

  return (
    <div
      className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-5 ${
        audioModal ? "block" : "hidden"
      }`}
    >
      <div
        ref={modalRef}
        className="w-full max-w-142.5 rounded-2xl bg-white dark:bg-boxdark shadow-2xl px-6 py-6 md:px-8 md:py-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="text-base font-bold text-black dark:text-white">
            Record Voice Message
          </div>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg text-body/50 transition-colors hover:bg-gray-2 hover:text-black dark:text-bodydark/40 dark:hover:bg-meta-4/50 dark:hover:text-white"
            onClick={handleCancel}
          >
            <XIcon size={16} />
          </button>
        </div>

        <div className="flex flex-col items-center">
          {/* Audio Recorder */}
          <AudioRecorder
            showVisualizer={true}
            onRecordingComplete={handleRecordingComplete}
            recorderControls={recorderControls}
            downloadOnSavePress={false}
          />

          {/* Audio Preview */}
          {audioUrl && (
            <audio controls src={audioUrl} className="w-full rounded-xl mt-3" />
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 w-full mt-4">
            <button
              className="w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-40 disabled:shadow-none transition-all"
              onClick={handleSendMessage}
              disabled={!audioUrl || uploading}
            >
              {uploading ? "Uploading..." : "Send"}
            </button>

            <button
              onClick={handleCancel}
              className="w-full h-11 rounded-xl border border-danger/30 text-danger text-sm font-semibold hover:bg-danger/8 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
