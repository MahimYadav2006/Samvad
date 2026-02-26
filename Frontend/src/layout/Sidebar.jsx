import {
  ChatIcon,
  SignOutIcon,
  UserCircleIcon,
  ChatTeardropTextIcon,
} from "@phosphor-icons/react";
import DarkModeSwitcher from "../components/DarkModeSwitcher";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LogoutUser } from "../redux/slices/auth";

const NAVIGATION = [
  {
    key: 0,
    title: "Chats",
    icon: <ChatIcon size={22} weight="duotone" />,
    path: "/dashboard",
  },
  {
    key: 1,
    title: "Profile",
    icon: <UserCircleIcon size={22} weight="duotone" />,
    path: "/dashboard/profile",
  },
];

const getSelectedFromPath = (pathname) =>
  pathname.startsWith("/dashboard/profile") ? 1 : 0;

export default function Sidebar() {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setSelected(getSelectedFromPath(location.pathname));
  }, [location.pathname]);

  const handleClick = (key) => {
    setSelected(key);
    navigate(NAVIGATION[key].path);
  };

  const handleLogout = () => {
    dispatch(LogoutUser(navigate));
  };

  return (
    <>
      <aside className="hidden h-full w-24 shrink-0 border-r border-stroke/70 px-3 py-5 dark:border-strokedark/70 md:flex md:flex-col">
        <div className="mb-8 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky-400 text-white shadow-lg shadow-primary/30">
            <ChatTeardropTextIcon size={26} weight="fill" />
          </div>
        </div>

        <nav className="flex flex-col gap-3">
          {NAVIGATION.map(({ key, icon, title }) => {
            const isActive = selected === key;
            return (
              <button
                key={key}
                type="button"
                className={`group relative flex flex-col items-center gap-1 rounded-2xl px-2 py-2.5 text-[11px] font-semibold transition ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-body hover:bg-gray-2 hover:text-black dark:text-bodydark dark:hover:bg-meta-4 dark:hover:text-white"
                }`}
                onClick={() => handleClick(key)}
              >
                <span>{icon}</span>
                <span>{title}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col items-center gap-4 pb-2">
          <DarkModeSwitcher />
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-stroke bg-white/70 text-danger hover:bg-red/10 dark:border-strokedark dark:bg-boxdark-2"
            title="Logout"
          >
            <SignOutIcon size={20} weight="bold" />
          </button>
        </div>
      </aside>

      <div className="fixed bottom-3 left-1/2 z-99 w-[calc(100%-1.25rem)] max-w-md -translate-x-1/2 rounded-3xl border border-stroke/60 bg-white/90 p-2 shadow-2xl backdrop-blur md:hidden dark:border-strokedark/70 dark:bg-boxdark/90">
        <div className="grid grid-cols-4 items-center gap-2">
          {NAVIGATION.map(({ key, icon, title }) => {
            const isActive = selected === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleClick(key)}
                className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-semibold ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-body dark:text-bodydark"
                }`}
              >
                {icon}
                <span className="mt-0.5">{title}</span>
              </button>
            );
          })}

          <div className="flex items-center justify-center">
            <DarkModeSwitcher className="scale-90" />
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger"
        >
          <SignOutIcon size={18} weight="bold" />
          Logout
        </button>
      </div>
    </>
  );
}
