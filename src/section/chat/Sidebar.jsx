import { ChatIcon, SignOutIcon } from "@phosphor-icons/react" ;
import DarkModeSwitcher from "../../components/DarkModeSwitcher";
export default function Sidebar() {
    return (
        <div className="flex flex-col border-r border-stroke p-2 dark:border-strokedark">
            <div className="mx-auto border rounded-md border-stroke p-2 dark:border-strokedark">
                <ChatIcon size={24}/>
            </div>

            <div className="flex flex-col grow"></div>

            <div className="space-y-4.5">
                <DarkModeSwitcher></DarkModeSwitcher>
                <div className="mx-auto border rounded-md border-stroke p-2 dark:border-strokedark hover:bg-stone-100 dark:hover:bg-stone-700 cursor-pointer">
                    <SignOutIcon size={24}/>
                </div>
            </div>
        </div>
    )
}
