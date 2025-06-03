import { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleAudioModal } from "../redux/slices/app";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";

export default function VoiceRecorder() {
  const modalRef = useRef(null);
  const dispatch = useDispatch();
  const { audio } = useSelector((state) => state.app.modals);

  useEffect(() => {
    const keyHandler = (event) => {
      if (!audio || event.key !== "Escape") return;
      dispatch(toggleAudioModal(false));
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [audio, dispatch]);

  const recorderControls = useAudioRecorder();

  const addAudioElement = (blob) => {
    const url = URL.createObjectURL(blob);
    const audioEl = document.createElement("audio");
    audioEl.src = url;
    audioEl.controls = true;
    const targetContainer = document.getElementById("audio-container");
    targetContainer.appendChild(audioEl);
  };

  return (
    <div
      className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
        audio ? "block" : "hidden"
      }`}
    >
      <div
        ref={modalRef}
        className="md:px-17.5 w-full max-w-142.5 rounded-lg bg-white dark:bg-boxdark md:py-8 px-8 py-12"
      >
        <div id="audio-container" className="flex flex-col space-y-4 items-center">
          <AudioRecorder
            showVisualizer={true}
            onRecordingComplete={addAudioElement}
            recorderControls={recorderControls}
            downloadOnSavePress={true}
          />
          <button className="w-full bg-primary rounded-lg p-2 text-white hover:bg-opacity-90">
            Send
          </button>
          <button onClick={()=>{
            dispatch(toggleAudioModal(false));
          }}  className="w-full border bg-transparent border-red rounded-lg p-2 text-red">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
