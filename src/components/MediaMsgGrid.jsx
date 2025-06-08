import React from 'react'
import { DownloadSimpleIcon } from '@phosphor-icons/react';
const images = [
    {
        key: 0,
        imgSrc: "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
        key: 1,
        imgSrc: "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
        key:2,
        imgSrc: "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
        key:3,
        imgSrc: "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=600",
    }
]

export default function MediaMsgGrid({incoming}) {
    const renderImages = () => {
        if (images.length === 1) {
          return (
            <div className="col-span-2 row-span-2 relative rounded-2xl">
              <img
                src={images[0].imgSrc}
                className="h-full w-full rounded-lg object-cover object-center"
              />
              <button className="absolute top-3 right-4 bg-gray/80 dark:bg-boxdark p-2 rounded-md hover:bg-opacity-80 hover:cursor-pointer hover:text-black dark:hover:text-white">
                <DownloadSimpleIcon size={20} />
              </button>
            </div>
          );
        } else if (images.length === 2) {
          return images.map((image) => (
            <div
              key={image.key}
              className="col-span-1 row-span-2 relative rounded-2xl"
            >
              <img
                src={image.imgSrc}
                className="h-full w-full rounded-lg object-cover object-center"
              />
              <button className="absolute top-3 right-4 bg-gray/80 dark:bg-boxdark p-2 rounded-md hover:bg-opacity-80 hover:cursor-pointer hover:text-black dark:hover:text-white">
                <DownloadSimpleIcon size={20} />
              </button>
            </div>
          ));
        } else if (images.length === 3) {
          return (
            <>
              {images.slice(0, 2).map((image) => (
                <div
                  key={image.key}
                  className="col-span-1 row-span-1 relative rounded-2xl"
                >
                  <img
                    src={image.imgSrc}
                    className="h-full w-full rounded-lg object-cover object-center"
                  />
                  <button className="absolute top-3 right-4 bg-gray/80 dark:bg-boxdark p-2 rounded-md hover:bg-opacity-80 hover:cursor-pointer hover:text-black dark:hover:text-white">
                    <DownloadSimpleIcon size={20} />
                  </button>
                </div>
              ))}
              <div className="col-span-1 row-span-1 relative rounded-2xl">
                <img
                  src={images[2].imgSrc}
                  className="h-full w-full rounded-lg object-cover object-center"
                />
                <button className="absolute top-3 right-4 bg-gray/80 dark:bg-boxdark p-2 rounded-md hover:bg-opacity-80 hover:cursor-pointer hover:text-black dark:hover:text-white">
                  <DownloadSimpleIcon size={20} />
                </button>
              </div>
            </>
          );
        } else {
          return (
            <>
              {images.slice(0, 3).map((image) => (
                <div
                  key={image.key}
                  className="col-span-1 row-span-1 relative rounded-2xl"
                >
                  <img
                    src={image.imgSrc}
                    className="h-full w-full rounded-lg object-cover object-center"
                  />
                  <button className="absolute top-3 right-4 bg-gray/80 dark:bg-boxdark p-2 rounded-md hover:bg-opacity-80 hover:cursor-pointer hover:text-black dark:hover:text-white">
                    <DownloadSimpleIcon size={20} />
                  </button>
                </div>
              ))}
              <div className="relative rounded-2xl bg-body/50 flex flex-row items-center justify-center text-xl text-white font-semibold">
                <div>+{images.length - 3}</div>
              </div>
            </>
          );
        }
      };

  return (
    <div className={`grid grid-cols-2 grid-rows-2 gap-3 pt-4 pb-2 rounded-2xl rounded-tl-none ${incoming ? "bg-gray dark:bg-boxdark-2" : "bg-transparent"}`}>
      {renderImages()}
    </div>
  )
}
