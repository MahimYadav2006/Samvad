import { useDispatch } from "react-redux";
import { uploadMedia } from "../redux/slices/chat";
import { useRef, useEffect } from "react";
import Dropzone from "dropzone";
import { UploadSimpleIcon } from "@phosphor-icons/react";

export default function MediaDropZone({ setFileData, acceptedFiles }) {
  const dropZoneRef = useRef(null);
  const formRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    Dropzone.autoDiscover = false;

    if (!dropZoneRef.current && formRef.current) {
      dropZoneRef.current = new Dropzone(formRef.current, {
        url: "/", // Not used
        autoProcessQueue: false,
        acceptedFiles,
        maxFiles: 1, // Ensure only one file
        maxFilesize: 50, // MB — matches backend UPLOAD_LIMITS.media
        addRemoveLinks: true,
        init() {
          this.on("addedfile", async (file) => {
            try {
              const uploaded = await dispatch(uploadMedia(file));
              if (uploaded) {
                console.log("Uploaded:", uploaded);
                setFileData(uploaded); // SINGLE file
                this.emit("success", file, "Uploaded");
              } else {
                this.emit("error", file, "Upload failed");
              }
            } catch {
              this.emit("error", file, "Exception occurred");
            }
            this.emit("complete", file);
          });

          this.on("maxfilesexceeded", (file) => {
            this.removeAllFiles();
            this.addFile(file);
          });
        },
      });
    }

    return () => {
      if (dropZoneRef.current) {
        dropZoneRef.current.destroy();
        dropZoneRef.current = null;
      }
    };
  }, [acceptedFiles, dispatch, setFileData]);

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="p-6.5">
        <form
          ref={formRef}
          className="dropzone rounded-md !border-dashed !border-bodydark1 bg-gray hover:!border-primary dark:!border-strokedark dark:bg-graydark dark:hover:!border-primary"
        >
          <div className="dz-message">
            <div className="mb-2.5 flex flex-col items-center space-y-2 justify-center">
              <div className="shadow-10 flex h-15 w-15 items-center justify-center rounded-full bg-white text-black dark:bg-black dark:text-white">
                <UploadSimpleIcon size={24} />
              </div>
              <span className="font-medium text-black dark:text-white">
                Drop a media file here to upload
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
