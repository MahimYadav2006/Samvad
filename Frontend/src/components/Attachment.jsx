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
        trigger.current?.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, []);

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [dropdownOpen]);

  return (
    <>
      <button
        className="rounded-lg p-1.5 transition-colors hover:bg-gray-2 hover:text-primary dark:hover:bg-meta-4/50"
        ref={trigger}
        onClick={(e) =>{
            e.preventDefault();
            setDropdownOpen((prev) => !prev)
        }}
      >
        <PaperclipIcon size={18}></PaperclipIcon>
      </button>
      <div
        ref={dropdown}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`absolute right-0 -top-[6.5rem] z-40 space-y-0.5 rounded-xl border border-stroke/60 bg-white p-1 shadow-xl shadow-black/[0.08] dark:border-strokedark/50 dark:bg-boxdark ${
          dropdownOpen ? "block" : "hidden"
        }`}
        onClick={(e)=> e.preventDefault()}
      >
        <button className="flex w-48 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-body/80 transition-colors hover:bg-gray-2 hover:text-black dark:text-bodydark/70 dark:hover:bg-meta-4/50 dark:hover:text-white" onClick={()=> dispatch(toggleMediaModal(true))}>
          <ImageIcon size={17}></ImageIcon>
          Images & Videos
        </button>

        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-body/80 transition-colors hover:bg-gray-2 hover:text-black dark:text-bodydark/70 dark:hover:bg-meta-4/50 dark:hover:text-white" onClick={()=> dispatch(toggleDocumentModal(true))}>
          <FileIcon size={17}></FileIcon>
          Documents
        </button>
      </div>
    </>
  );
}
export default Attachment;
