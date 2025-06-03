import { useEffect, useRef, useState } from "react";
import { FileIcon, ImageIcon, PaperclipIcon } from "@phosphor-icons/react";
import { useDispatch } from "react-redux";
import { toggleDocumentModal, toggleMediaModal } from "../redux/slices/app";
function Attachment() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger = useRef(null);
  const dropdown = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (
        !dropdown ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <>
      <button
        className="text-[#98A6AD] hover:text-body"
        ref={trigger}
        onClick={(e) =>{
            e.preventDefault();
            setDropdownOpen((prev) => !prev)
        }}
      >
        <PaperclipIcon size={20}></PaperclipIcon>
      </button>
      <div
        ref={dropdown}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`absolute right-0 -top-24 z-40 space-40 space-y-1 rounded-sm border border-stroke bg-white p-1.5 shadow-default dark:border-strokedark dark:bg-boxdark ${
          dropdownOpen ? "block" : "hidden"
        }`}
        onClick={(e)=> e.preventDefault()}
      >
        <button className="flex w-54 items-center gap-2 rounded-sm px-5 py-1.5 text-left text-sm hover:bg-gray dark:hover:bg-meta-4" onClick={()=> dispatch(toggleMediaModal(true))}>
          <ImageIcon size={20}></ImageIcon>
          Images & Videos
        </button>

        <button className="flex w-full items-center gap-2 rounded-sm px-5 py-1.5 text-left text-sm hover:bg-gray dark:hover:bg-meta-4" onClick={()=> dispatch(toggleDocumentModal(true))}>
          <FileIcon size={20}></FileIcon>
          Files and documents
        </button>
      </div>
    </>
  );
}
export default Attachment;
