import { XIcon , ClockIcon, VideoCameraIcon, ChatIcon, DotsThreeVerticalIcon} from "@phosphor-icons/react";
import User01 from "../../images/user/user-01.png";
import { useSelector } from "react-redux";
export default function UserInfo({handleToggleUserInfo}) {
    const oppositeUser = useSelector((state) => state.user.oppositeUser);
  return (
    <div className="border-l flex flex-col h-full border-stroke dark:border-strokedark" >
        {/* Header */}
        <div className="sticky border-b border-stroke dark:border-strokedark flex flex-row items-center justify-between w-full px-6 py-7.5">
            <div className="text-black dark:text-white font-semibold text-lg">
                Profile
            </div>
            <button onClick={handleToggleUserInfo}>
                <XIcon size={24}></XIcon>
            </button>
        </div>

        {/* User Info */}
        <div className="mx-auto my-8">
            <img src={oppositeUser.avatar || User01} alt=""  className="w-44 h-44 rounded-lg object-cover object-center" />
        </div>

        <div className="px-6 space-y-1">
            <div className="text-black dark:text-white font-medium text-xl">
                {oppositeUser.name || "User Name"}
            </div>
            <span className="text-body text-md">{oppositeUser.bio || "Available"}</span>
        </div>

        <div className="px-6 my-3">
            <div className="flex flex-row items-center space-x-2">
                <ClockIcon size={20}></ClockIcon>
                <div>{new Date().toLocaleTimeString()}</div>
            </div>
        </div>

        <div className="px-6 flex flex-row space-x-2">
            <button className="w-full border border-stroke dark:border-strokedark p-2 rounded-md flex flex-row items-center justify-center">
                <ChatIcon size={20} className="mr-3"></ChatIcon>
                Message
            </button>
            <button className="w-full border border-stroke dark:border-strokedark p-2 rounded-md flex flex-row items-center justify-center">
                <VideoCameraIcon size={20} className="mr-3"></VideoCameraIcon>
                Huddle
            </button>
            <button className="border border-stroke dark:border-strokedark p-2 rounded-md flex flex-row items-center justify-center">
                <DotsThreeVerticalIcon size={20}></DotsThreeVerticalIcon>
            </button>
        </div>
    </div>
  );
}
