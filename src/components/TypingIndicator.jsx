export default function TypingIndicator(){
    return (
        <div className="flex flex-row items-center space-x-3 max-w-fit bg-gray dark:bg-boxdark-2 p-4 rounded-xl rounded-tl-none">
            <div className="text-md text-body dark:text-white">

                <div className="ticontainer">
                        ṣ
                    <div className="flex items-center h-[17px]">
                        <div className="tidot"></div>
                        <div className="tidot"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}