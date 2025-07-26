import { useRef, useEffect, useState } from "react";
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

  const [recordedBlob, setRecordedBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const keyHandler = (event) => {
      if (!audioModal || event.key !== "Escape") return;
      handleCancel();
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [audioModal]);

  const handleRecordingComplete = (blob) => {
    setRecordedBlob(blob);

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

  const handleCancel = () => {
    setRecordedBlob(null);
    setAudioUrl(null);
    setUploading(false);
    dispatch(toggleAudioModal(false));
  };

  return (
    <div
      className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
        audioModal ? "block" : "hidden"
      }`}
    >
      <div
        ref={modalRef}
        className="md:px-17.5 w-full max-w-142.5 rounded-lg bg-white dark:bg-boxdark md:py-8 px-8 py-12"
      >
        <div className="flex flex-col space-y-4 items-center">
          <AudioRecorder
            showVisualizer={true}
            onRecordingComplete={handleRecordingComplete}
            recorderControls={recorderControls}
            downloadOnSavePress={false}
          />

          {audioUrl && (
            <audio controls src={audioUrl} className="mt-4" />
          )}

          <button
            className="w-full bg-primary rounded-lg p-2 text-white hover:bg-opacity-90 disabled:opacity-50"
            onClick={handleSendMessage}
            disabled={!audioUrl || uploading}
          >
            {uploading ? "Uploading..." : "Send"}
          </button>

          <button
            onClick={handleCancel}
            className="w-full border bg-transparent border-red rounded-lg p-2 text-red"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
