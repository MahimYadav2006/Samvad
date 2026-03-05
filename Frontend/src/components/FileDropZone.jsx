import { useDispatch } from "react-redux";
import { uploadDocument } from "../redux/slices/chat";
import { useRef, useEffect} from "react";
import Dropzone from "dropzone";
import { UploadSimpleIcon } from "@phosphor-icons/react";

export default function FileDropZone({ setFileData, acceptedFiles, maxFileSize = 16 * 1024 * 1024 }) {
  const dropZoneRef = useRef(null);
  const formRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    Dropzone.autoDiscover = false;

    if (!dropZoneRef.current && formRef.current) {
      dropZoneRef.current = new Dropzone(formRef.current, {
        url: "/", // dummy
        autoProcessQueue: false,
        acceptedFiles,
        maxFilesize: maxFileSize / (1024 * 1024),
        addRemoveLinks: true,
        init() {
          this.on("addedfile", async (file) => {
            console.log("📁 File added:", file);

            try {
              const resultAction = await dispatch(uploadDocument(file));
              if (uploadDocument.fulfilled.match(resultAction)) {
                console.log("✅ Document uploaded:", resultAction.payload);
                const docData  = {
                    url: resultAction.payload.url,
                    name: resultAction.payload.name,
                    size: resultAction.payload.size,
                }
                setFileData(docData);
                this.emit("success", file, "Uploaded");
              } else {
                console.error("❌ Upload failed:", resultAction.payload);
                this.emit("error", file, "Upload failed");
              }
              this.emit("complete", file);
            } catch (err) {
              console.error("❌ Exception during upload:", err);
              this.emit("error", file, "Upload failed");
            }
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
  }, [acceptedFiles, maxFileSize, dispatch, setFileData]);

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="p-6.5">
        <form
          ref={formRef}
          id="upload"
          className="dropzone rounded-md !border-dashed !border-bodydark1 bg-gray hover:!border-primary dark:!border-strokedark dark:bg-graydark dark:hover:!border-primary"
        >
          <div className="dz-message">
            <div className="mb-2.5 flex flex-col items-center space-y-2 justify-center">
              <div className="shadow-10 flex h-15 w-15 items-center justify-center rounded-full bg-white text-black dark:bg-black dark:text-white">
                <UploadSimpleIcon size={24} />
              </div>
              <span className="font-medium text-black dark:text-white">
                Drop files here to upload
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
