import React, { useState } from 'react'
import { PhoneDisconnectIcon, MicrophoneIcon, VideoCameraIcon, MicrophoneSlashIcon, VideoCameraSlashIcon } from '@phosphor-icons/react';
import User01 from '../images/user/user-01.png';
import User02 from '../images/user/user-02.png';

export default function VideoRoom({open, handleClose}) {
    const [muteAudio,setMuteAudio] = useState(false);
    const [muteVideo,setMuteVideo] = useState(false);

    const handleToggleAudio = () => {
        setMuteAudio((prev) => !prev);
    }

    const handleToggleVideo = () => {
        setMuteVideo((prev) => !prev);
    }

  return (
    <div className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${open ? "block" : "hidden"}`}>
      <div className='w-full max-w-142.5 rounded-lg bg-white dark:bg-boxdark md:py-8 px-8 py-12'>
        <div className='flex flex-col space-y-6'>
            {/* Video Feed Grid */}

            <div className='grid grid-cols-2 gap-4 h-50 mb-4'>

                {/* Video Feed 1 */}
                <div className="relative h-full w-full bg-gray rounded-md flex dark:bg-boxdark-2 items-center justify-center">
                    <div className='space-y-2'>
                        <img src={User01} alt="" className='h-20 w-20 rounded-full object-cover object-center' />
                        <div className='font-medium text-sm text-center'>You</div>
                    </div>
                    <div className="absolute top-3 right-4">
                        {muteAudio ? <MicrophoneSlashIcon className='text-primary' size={20}></MicrophoneSlashIcon> : <MicrophoneIcon className='text-primary' size={20}></MicrophoneIcon>}
                    </div>
                </div>

                {/* Video Feed 2 */}
                <div className="relative h-full w-full bg-gray rounded-md flex dark:bg-boxdark-2 items-center justify-center">
                    <div className='space-y-2'>
                        <img src={User02} alt="" className='h-20 w-20 rounded-full object-cover object-center' />
                        <div className='font-medium text-sm text-center'>Mariya Desoja</div>
                    </div>
                    <div className="absolute top-3 right-4">
                        <MicrophoneSlashIcon className='text-primary' size={20}></MicrophoneSlashIcon>
                    </div>
                </div>

            </div>
            {/* Call Controls */}
            <div className='flex flex-row items-center justify-center space-x-4'>
                {/* Microphone Button */}

                <button onClick={handleToggleAudio} className='p-3 bg-gray rounded-md dark:bg-boxdark text-black dark:text-white hover:bg-opacity-80 flex items-center justify-center'>
                    {muteAudio ? <MicrophoneSlashIcon size={20}></MicrophoneSlashIcon> : <MicrophoneIcon size={20}></MicrophoneIcon>}
                </button>

                {/* Disconnet Button */}

                <button onClick={handleClose} className='p-3 bg-red rounded-full text-white hover:bg-opacity-80'>
                    <PhoneDisconnectIcon size={24}></PhoneDisconnectIcon>
                </button>

                {/* Video Camera Button */}

                <button onClick={handleToggleVideo} className='p-3 bg-gray rounded-md dark:bg-boxdark text-black dark:text-white hover:bg-opacity-80 flex items-center justify-center'>
                    {muteVideo ? <VideoCameraSlashIcon size={20}></VideoCameraSlashIcon> : <VideoCameraIcon size={20}></VideoCameraIcon>}
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}
