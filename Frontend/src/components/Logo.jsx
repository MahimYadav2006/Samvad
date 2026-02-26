import { ChatTeardropTextIcon } from "@phosphor-icons/react";
function Logo(){
    return (
        <div className="flex flex-row items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky-400 text-white shadow-lg shadow-primary/30">
                <ChatTeardropTextIcon size={24} weight='bold'></ChatTeardropTextIcon>
            </div>
            <div className="font-display text-2xl font-bold tracking-tight text-black dark:text-white">Samvad</div>
        </div>
    )
}
export default Logo;
