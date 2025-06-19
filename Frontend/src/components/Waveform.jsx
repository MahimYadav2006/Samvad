import { PauseIcon, PlayIcon  } from '@phosphor-icons/react';
import { set } from 'lodash';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import AudioFile from '../assets/audio/sample_audio.webm';

export default function Waveform(props) {
    const {incoming} = props;
    const waveformRef = useRef(null);
    const [waveSurfer,setWaveSurfer] = useState(null);
    const [isPlaying,setIsPlaying] = useState(false);
    const [currentTime,setCurrentTime] = useState("0:00");
    const [duration,setDuration] = useState("0:00");

    useEffect(()=>{
      if(waveformRef.current){
        const ws = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: "#3C50E0",
          progressColor: "80CAEE",
          url : AudioFile,
          renderFunction: (channels, ctx) => {
            const { width, height } = ctx.canvas;
            const scale = channels[0].length / width;
            const step = 6;
  
            ctx.translate(0, height / 2);
            ctx.strokeStyle = ctx.fillStyle;
            ctx.beginPath();
  
            for (let i = 0; i < width; i += step * 2) {
              const index = Math.floor(i * scale);
              const value = Math.abs(channels[0][index]);
              let x = i;
              let y = value * height;
  
              ctx.moveTo(x, 0);
              ctx.lineTo(x, y);
              ctx.arc(x + step / 2, y, step / 2, Math.PI, 0, true);
              ctx.lineTo(x + step, 0);
  
              x = x + step;
              y = -y;
              ctx.moveTo(x, 0);
              ctx.lineTo(x, y);
              ctx.arc(x + step / 2, y, step / 2, Math.PI, 0, false);
              ctx.lineTo(x + step, 0);
            }
  
            ctx.stroke();
            ctx.closePath();
          },    
        });

        // using .on can help us listen various events on the waveSurfer instance
        // when the first argument happens the second argument is the callback function which is processed.

        ws.on('ready',()=>{
          const totalDuration = ws.getDuration();
          setDuration(formatTime(totalDuration));
        });

        ws.on('audioprocess',()=>{
          const currentTime = ws.getCurrentTime();
          setCurrentTime(formatTime(currentTime)); // While the audio being processed we will keep updating the duration
        });

        ws.on('finish',()=>{
          setIsPlaying(false);
          setCurrentTime(formatTime(0));
        })
        
        setWaveSurfer(ws);
        return ()=>{
          ws.destroy();
        }
      }
    },[]);

    const formatTime = (seconds)=>{
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    const handlePlayPause = ()=>{
      if(waveSurfer){
        if(isPlaying){
          waveSurfer.pause();
        }else{
          waveSurfer.play();
        }
      }
      setIsPlaying(!isPlaying); // If it was in playing state turn it off and vice versa
    }
  return (
    <div className={`flex flex-row items-center space-x-2 p-2 rounded-md ${incoming ? 'bg-transparent' : 'bg-gray-3 dark:bg-boxdark'}`}>
        <button onClick={handlePlayPause}   className='bg-gray dark:bg-boxdark-2 rounded-full h-18 w-18 flex items-center justify-center shadow-2'>
          {isPlaying ? <PauseIcon size={24} weight='bold' /> : <PlayIcon size={24} weight='bold' />}
        </button>

        <div className='grow flex flex-col space-y-1'>
          <div className='w-full !z-0' ref={waveformRef} style={{overflow: 'hidden'}}>

          </div>
          <div className='text-sm'>
            {currentTime}/{duration}
          </div>
        </div>
    </div>
  )
}
