import React, { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import WaveSurfer from "wavesurfer.js";
import SampleAudioFile from "../assets/audio/sample_audio.webm";

export default function Waveform({ incoming = false, audioUrl = SampleAudioFile }) {
  const waveformRef = useRef(null);
  const [waveSurfer, setWaveSurfer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");

  useEffect(() => {
    if (!waveformRef.current) return;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#3C50E0",
      progressColor: "#80CAEE",
      url: audioUrl,
      height: 60,
      barWidth: 2,
      responsive: true,
      normalize: true,
    });

    ws.on("ready", () => {
      setDuration(formatTime(ws.getDuration()));
    });

    ws.on("audioprocess", () => {
      setCurrentTime(formatTime(ws.getCurrentTime()));
    });

    ws.on("finish", () => {
      setIsPlaying(false);
      setCurrentTime("0:00");
    });

    setWaveSurfer(ws);

    return () => ws.destroy();
  }, [audioUrl]);

  const handlePlayPause = () => {
    if (!waveSurfer) return;

    if (isPlaying) {
      waveSurfer.pause();
    } else {
      waveSurfer.play();
    }

    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-lg p-2 shadow-sm ${
        incoming ? "bg-transparent" : "bg-gray-100 dark:bg-boxdark-2"
      }`}
    >
      <button
        onClick={handlePlayPause}
        className="bg-primary text-white rounded-full h-10 w-10 flex items-center justify-center shadow hover:scale-105 transition"
      >
        {isPlaying ? (
          <PauseIcon size={20} weight="bold" />
        ) : (
          <PlayIcon size={20} weight="bold" />
        )}
      </button>

      <div className="flex flex-col flex-1">
        <div
          ref={waveformRef}
          className="w-full"
          style={{ overflow: "hidden" }}
        ></div>
        <div className="text-xs text-right mt-1 text-gray-500">
          {currentTime} / {duration}
        </div>
      </div>
    </div>
  );
}
