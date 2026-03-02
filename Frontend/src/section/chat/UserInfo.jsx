import {
  XIcon,
  ClockIcon,
  VideoCameraIcon,
  ChatIcon,
} from "@phosphor-icons/react";
import User01 from "../../images/user/user-01.png";
import { useSelector } from "react-redux";

export default function UserInfo({ handleToggleUserInfo }) {
  const oppositeUser = useSelector((state) => state.user.oppositeUser);
  const isOnline = `${oppositeUser?.status || ""}`.toLowerCase() === "online";

  return (
    <div className="flex h-full flex-col bg-white dark:bg-boxdark">
      <div className="flex items-center justify-between border-b border-stroke/40 px-4 py-3 dark:border-strokedark/30">
        <h4 className="text-sm font-bold text-black dark:text-white">
          Profile
        </h4>
        <button
          type="button"
          onClick={handleToggleUserInfo}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-body/50 transition-colors hover:bg-gray-2 hover:text-black dark:text-bodydark/40 dark:hover:bg-meta-4/50 dark:hover:text-white"
        >
          <XIcon size={16} />
        </button>
      </div>

      <div className="fancy-scrollbar no-scrollbar flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto w-fit">
          <div className="relative">
            <img
              src={oppositeUser.avatar || User01}
              alt="User"
              className="h-28 w-28 rounded-2xl object-cover object-center shadow-md"
            />
            {isOnline && (
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-success dark:border-boxdark" />
            )}
          </div>
        </div>

        <div className="mt-5 space-y-1 text-center">
          <h3 className="font-display text-xl font-bold text-black dark:text-white">
            {oppositeUser.name || "User Name"}
          </h3>
          <p className="text-xs text-body/60 dark:text-bodydark/50">
            {isOnline ? "Online" : "Offline"}
          </p>
          {oppositeUser.bio && (
            <p className="mx-auto max-w-[200px] pt-1 text-sm text-body/70 dark:text-bodydark/60">
              {oppositeUser.bio}
            </p>
          )}
        </div>

        <div className="mt-5 rounded-xl border border-stroke/40 bg-gray-2/50 px-4 py-3 dark:border-strokedark/30 dark:bg-meta-4/30">
          <div className="flex items-center gap-2 text-xs font-semibold text-body/60 dark:text-bodydark/50">
            <ClockIcon size={14} weight="fill" className="text-primary/60" />
            Local Time
          </div>
          <div className="mt-1 text-sm font-medium text-black dark:text-white">
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-stroke/50 bg-white px-3 py-2 text-xs font-semibold text-body/70 transition-colors hover:border-primary/40 hover:text-primary dark:border-strokedark/40 dark:bg-boxdark-2/60 dark:text-bodydark/60"
          >
            <ChatIcon size={15} />
            Message
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-stroke/50 bg-white px-3 py-2 text-xs font-semibold text-body/70 transition-colors hover:border-primary/40 hover:text-primary dark:border-strokedark/40 dark:bg-boxdark-2/60 dark:text-bodydark/60"
          >
            <VideoCameraIcon size={15} />
            Huddle
          </button>
        </div>
      </div>
    </div>
  );
}
