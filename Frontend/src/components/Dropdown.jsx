import { useEffect, useRef, useState } from "react";
import { DotsThreeIcon,PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
function Dropdown(){
    const [dropdownOpen , setDropdownOpen] = useState(false);
    const trigger = useRef(null);
    const dropdown = useRef(null);

    useEffect(()=>{
        const clickHandler = ({target})=>{
            if(!dropdown.current) return;
            if(!dropdown || dropdown.current.contains(target) || trigger.current?.contains(target)) return;
            setDropdownOpen(false);
        }
        document.addEventListener("click",clickHandler);
        return ()=> document.removeEventListener("click",clickHandler);
    },[])

    useEffect(()=>{
        const keyHandler = ({keyCode}) =>{
            if(!dropdownOpen || keyCode !== 27) return;
            setDropdownOpen(false);
        }
        document.addEventListener("keydown",keyHandler );
        return ()=> document.removeEventListener("keydown",keyHandler);
    },[dropdownOpen])


    return (
        <>
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-xl border border-stroke bg-white text-body hover:border-primary hover:text-primary dark:border-strokedark dark:bg-boxdark-2 dark:text-bodydark md:h-10 md:w-10" ref={trigger} onClick={()=> setDropdownOpen((prev)=> !prev)}>
                <DotsThreeIcon size={24}></DotsThreeIcon>
            </button>
            <div ref={dropdown} onFocus={()=> setDropdownOpen(true)} onBlur={()=> setDropdownOpen(false)} className={`absolute right-0 top-[110%] z-40 w-36 space-y-1 rounded-xl border border-stroke bg-white p-1.5 shadow-xl dark:border-strokedark dark:bg-boxdark ${dropdownOpen ? "block" : "hidden"}`}>
                <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-gray dark:hover:bg-meta-4">
                    <PencilSimpleIcon size={20}></PencilSimpleIcon>
                    Edit
                </button>
                <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-gray dark:hover:bg-meta-4">
                    <TrashIcon size={20}></TrashIcon>
                    Delete
                </button>
            </div>
        </>
    )
}
export default Dropdown;
