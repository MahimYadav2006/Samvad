import {
  XIcon,
  ClockIcon,
  VideoCameraIcon,
  ChatIcon,
  DotsThreeVerticalIcon,
} from "@phosphor-icons/react";
import User01 from "../../images/user/user-01.png";
import { useSelector } from "react-redux";

export default function UserInfo({ handleToggleUserInfo }) {
  const oppositeUser = useSelector((state) => state.user.oppositeUser);

  return (
    <div className="flex h-full flex-col bg-white/40 dark:bg-boxdark/40">
      <div className="flex items-center justify-between border-b border-stroke/70 px-5 py-4 dark:border-strokedark/70">
        <div className="font-display text-lg font-bold text-black dark:text-white">
          Profile
        </div>
        <button
          type="button"
          onClick={handleToggleUserInfo}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-stroke bg-white hover:border-primary hover:text-primary dark:border-strokedark dark:bg-boxdark-2"
        >
          <XIcon size={18} />
        </button>
      </div>

      <div className="fancy-scrollbar no-scrollbar flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto w-fit">
          <img
            src={oppositeUser.avatar || User01}
            alt="User"
            className="h-40 w-40 rounded-3xl border border-stroke/70 object-cover object-center shadow-lg dark:border-strokedark"
          />
        </div>

        <div className="mt-6 space-y-2 text-center">
          <h3 className="font-display text-2xl font-bold text-black dark:text-white">
            {oppositeUser.name || "User Name"}
          </h3>
          <p className="mx-auto max-w-[220px] text-sm text-body dark:text-bodydark">
            {oppositeUser.bio || "Available for conversations"}
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-stroke/70 bg-white/70 px-4 py-3 dark:border-strokedark dark:bg-boxdark-2/60">
          <div className="flex items-center gap-2 text-sm font-semibold text-black dark:text-white">
            <ClockIcon size={17} weight="fill" className="text-primary" />
            Local Time
          </div>
          <div className="mt-1 text-sm text-body dark:text-bodydark">
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-xl border border-stroke bg-white/80 px-3 py-2.5 text-sm font-semibold text-black hover:border-primary hover:text-primary dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
          >
            <ChatIcon size={18} />
            Message
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-xl border border-stroke bg-white/80 px-3 py-2.5 text-sm font-semibold text-black hover:border-primary hover:text-primary dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
          >
            <VideoCameraIcon size={18} />
            Huddle
          </button>
          <button
            type="button"
            className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-stroke bg-white/80 px-3 py-2.5 text-sm font-semibold text-black hover:border-primary hover:text-primary dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
          >
            <DotsThreeVerticalIcon size={18} />
            More Actions
          </button>
        </div>
      </div>
    </div>
  );
}
