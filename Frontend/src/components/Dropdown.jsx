import { useEffect, useRef, useState } from "react";
import { DotsThreeIcon,PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
function Dropdown(){
    const [dropdownOpen , setDropdownOpen] = useState(false);
    const trigger = useRef(null);
    const dropdown = useRef(null);

    useEffect(()=>{
        const clickHandler = ({target})=>{
            if(!dropdown.current) return;
            if(!dropdown || dropdown.current.contains(target) || trigger.current.contains(target)) return;
            setDropdownOpen(false);
        }
        document.addEventListener("click",clickHandler);
        return ()=> document.removeEventListener("click",clickHandler);
    })

    useEffect(()=>{
        const keyHandler = ({keyCode}) =>{
            if(!dropdownOpen || keyCode !== 27) return;
            setDropdownOpen(false);
        }
        document.addEventListener("keydown",keyHandler );
        return ()=> document.removeEventListener("keydown",keyHandler);
    })


    return (
        <>
            <button className="text-[#98A6AD] hover:text-body" ref={trigger} onClick={()=> setDropdownOpen((prev)=> !prev)}>
                <DotsThreeIcon size={24}></DotsThreeIcon>
            </button>
            <div ref={dropdown} onFocus={()=> setDropdownOpen(true)} onBlur={()=> setDropdownOpen(false)} className={`absolute right-0 top-full z-40 space-40 space-y-1 rounded-sm border border-stroke bg-white p-1.5 shadow-default dark:border-strokedark dark:bg-boxdark ${dropdownOpen ? "block" : "hidden"}`}>
                <button className="flex w-full items-center gap-2 rounded-sm px-5 py-1.5 text-left text-sm hover:bg-gray dark:hover:bg-meta-4">
                    <PencilSimpleIcon size={20}></PencilSimpleIcon>
                    Edit
                </button>
                <button className="flex w-full items-center gap-2 rounded-sm px-5 py-1.5 text-left text-sm hover:bg-gray dark:hover:bg-meta-4">
                    <TrashIcon size={20}></TrashIcon>
                    Delete
                </button>
            </div>
        </>
    )
}
export default Dropdown;