import React from 'react';
import { FileIcon } from '@phosphor-icons/react';
import { DownloadSimpleIcon,CheckIcon, ChecksIcon } from '@phosphor-icons/react';
export default function Document({incoming,author,timestamp,read_receipt,}) {
  return (
    incoming? (
      <div className='max-w-125 w-fit'>
        <p className='mb-2.5 text-sm font-medium capitalize'>{author}</p>
        <div className='mb-2.5 rounded-2xl rounded-tl-none bg-gray px-5 py-3 dark:bg-boxdark-2 space-y-2'>
          <div className='flex flex-row items-center justify-between p-2 bg-gray-3 rounded-md dark:bg-boxdark'>
            <div className='flex flex-row items-center space-x-3'>
              <div className='p-2 rounded-md bg-primary/80 text-white'>
                <FileIcon size={20}></FileIcon>
              </div>
              <div className='flex flex-col'>
                <div>admin_v1.0.zip</div>
                <div className='text-sm font-medium'>12.5 MB</div>
              </div>
            </div>
            <button className='pl-5'>
              <DownloadSimpleIcon></DownloadSimpleIcon>
            </button>
          </div>
          <p>A Dummu Text for Development</p>
        </div>
        <p className='text-xs'>{timestamp}</p>
      </div>
    ):(
      <div className='max-w-125 w-fit ml-auto'>
        <div className='mb-2.5 rounded-2xl rounded-br-none bg-primary px-5 py-3 text-white space-y-2'>
          <div className='flex flex-row items-center justify-between p-2 bg-white rounded-md text-primary'>
            <div className='flex flex-row items-center space-x-3'>
              <div className='p-2 rounded-md bg-primary/20 text-primary'>
                <FileIcon size={20}></FileIcon>
              </div>
              <div className='flex flex-col'>
                <div>admin_v1.0.zip</div>
                <div className='text-sm font-medium'>12.5 MB</div>
              </div>
            </div>
            <button className='pl-5'>
              <DownloadSimpleIcon></DownloadSimpleIcon>
            </button>
          </div>
          <p>A Dummu Text for Development</p>
        </div>
      <div className="flex flex-row items-center justify-end space-x-2">
        <div className={`${read_receipt !== "read" ? "text-body dark:text-white" : "text-primary"}`}>
          {read_receipt !== "sent" ? (
            <ChecksIcon weight="bold" size={18} />
          ):(
            <CheckIcon weight="bold" size={18}/>
          )}
        </div>
        <p className="text-xs text-right">{timestamp}</p>
      </div>
      </div>
    )
  )
}
