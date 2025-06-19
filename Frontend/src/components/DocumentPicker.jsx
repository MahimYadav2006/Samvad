import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PaperPlaneTiltIcon, XIcon } from "@phosphor-icons/react";
import { toggleDocumentModal, toggleMediaModal } from "../redux/slices/app";
import FileDropZone from "./FileDropZone";

export default function DocumentPicker() {
  const modalRef = useRef(null);
  const dispatch = useDispatch();
  const { document: documenti } = useSelector((state) => state.app.modals);


  useEffect(() => {
    const keyHandler = (event) => {
      if (!documenti || event.key !== "Escape") return;
      dispatch(toggleMediaModal(false));
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [documenti, dispatch]);


  return (
    <div
      className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
        documenti ? "block" : "hidden"
      }`}
    >
      <div
        ref={modalRef}
        className="md:px-17.5 w-full max-w-142.5 rounded-lg bg-white dark:bg-boxdark md:py-8 px-8 py-12"
      >
            {/* Header */}
        <div className="flex flex-row items-center justify-between mb-8 space-x-2">
          <div className="text-md font-medium text-black dark:text-white">
            Choose Documents to Send
          </div>
          <button
            onClick={() => {
              //
            }}
          >
            <XIcon onClick={()=> dispatch(toggleDocumentModal(false))}  size={24}></XIcon>
          </button>
        </div>

            {/* FilePicker */}
            <FileDropZone acceptedFiles=".pdf,.ppt,.doc,.docx,.xls,.xlsx,.txt,.csv,.fig" ></FileDropZone>
            {/* MessageFooter */}
        <div className="flex flex-row items-center space-x-2 justify-between mt-4">
          <input
            type="text"
            className="border rounded-lg hover:border-primary outline-none w-full p-2 border-stroke dark:border-strokedark bg-transparent dark:bg-form-input"
            placeholder="Type your message.."
          />
          <button className="p-2.5 border border-primary flex items-center justify-center rounded-lg bg-primary hover:bg-opacity-90 text-white">
            <PaperPlaneTiltIcon size={20} weight="bold"></PaperPlaneTiltIcon>
          </button>
        </div>
      </div>
    </div>
  );
}
