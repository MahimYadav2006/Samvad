import { useEffect, useRef } from "react";
import Dropzone from "dropzone";
import { UploadSimpleIcon } from "@phosphor-icons/react";

export default function FileDropZone({acceptedFiles, maxFileSize = 16*1024*1024, url="/file/post"}){
    const dropZoneRef = useRef(null);
    const formRef = useRef(null);

    useEffect(()=>{
        Dropzone.autoDiscover = false; // to avoid creating multiple instances of dropzone
        if(!dropZoneRef.current && formRef.current){
            dropZoneRef.current = new Dropzone(formRef.current,{
                url,
                acceptedFiles,
                maxFileSize : maxFileSize/(1024*1024), // DropZone expects the value to be in MBs.
            })
        }
        return ()=>{
            if(dropZoneRef.current){
                dropZoneRef.current.destroy();
                dropZoneRef.current = null;
            }
        }

    },[]);

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="p-6.5">
                <form action={url} ref={formRef} id="upload" className="dropzone rounded-md !border-dashed !border-bodydark1 bg-gray hover:!border-primary dark:!border-strokedark dark:bg-graydark dark:hover:!border-primary">
                    <div className="dz-message">
                        <div className="mb-2.5 flex flex-col items-center space-y-2 justify-center">
                            <div className="shadow-10 flex h-15 w-15 items-center justify-center rounded-full bg-white text-black dark:bg-black dark:text-white">
                                <UploadSimpleIcon size={24}></UploadSimpleIcon>
                            </div>
                            <span className="font-medium text-black dark:text-white">
                                Drop files here to upload
                            </span>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}