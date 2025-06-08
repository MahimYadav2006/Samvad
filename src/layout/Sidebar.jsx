import {
    ChatIcon,
    DotsThreeCircleIcon,
    ShapesIcon,
    SignOutIcon,
    UserCircleIcon,
    UsersIcon,
    ChatTeardropTextIcon,
  } from "@phosphor-icons/react";
  import DarkModeSwitcher from "../components/DarkModeSwitcher";
  import { useState } from "react";
  import { useNavigate } from "react-router-dom";
  const NAVIGATION = [
    {
      key: 0,
      title: "DMs",
      icon: <ChatIcon size={24} />,
      path: "/dashboard",
    },
    {
      key: 1,
      title: "Profile",
      icon: <UserCircleIcon size={24} />,
      path: "/dashboard/profile",
    },
  ];
  
  export default function Layout() {
    const [selected, setSelected] = useState(0);
    const navigate= useNavigate();

    const handleClick = (key) => {
      setSelected(key);
      navigate(NAVIGATION[key].path);
    };
  
    return (
      <div className="flex flex-col border-r border-stroke p-2 dark:border-strokedark">
  
        <div className="flex flex-col align-center justify-center space-y-5">

          <ChatTeardropTextIcon  size={32} weight="bold" className="text-primary"/>

          {/* <div className="space-y-2 flex flex-col text-center">
            <div className="mx-auto border rounded-md border-stroke p-2 dark:border-strokedark">
              <ShapesIcon size={24} />
            </div>
            <span className="font-medium text-sm">Workspace</span>
          </div> */}
  
          {NAVIGATION.map(({ key, icon, title }) => (
            <div
              key={key}
              className="space-y-2 flex flex-col text-center hover:cursor-pointer hover:text-primary"
              onClick={() => {
                handleClick(key);
              }}
            >
              <div
                className={`mx-auto border rounded-md border-stroke p-2 dark:border-strokedark ${
                  selected === key && "bg-primary bg-opacity-90 text-white"
                } hover:border-primary dark:hover:border-primary`}
              >
                {icon}
              </div>
              <span className="font-medium text-sm">{title}</span>
            </div>
          ))}
        </div>
  
        <div className="flex flex-col grow"></div>
  
        <div className="space-y-4.5">
          <div></div>
          <DarkModeSwitcher></DarkModeSwitcher>
          < button  onClick={()=>{
            navigate("/auth/login");
          }}  className="flex flex-row items-center justify-center border rounded-md border-stroke p-2 dark:border-strokedark hover:bg-stone-100 dark:hover:bg-stone-700 cursor-pointer">
            <SignOutIcon size={24} />
          </button>
        </div>
      </div>
    );
  }
  