import { ChatTeardropTextIcon } from "@phosphor-icons/react";
function Logo(){
    return (
        <div className="flex flex-row items-center space-x-2">
            <ChatTeardropTextIcon size={32} weight='bold'></ChatTeardropTextIcon>
            <div className="text-2xl font-medium text-body dark:text-white">Samvad</div>
        </div>
    )
}
export default Logo;