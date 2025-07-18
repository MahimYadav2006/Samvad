import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import react, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import dummyAvatar from "../../images/user/user-01.png";
import { startConversation } from "../../redux/slices/user";



function ChatList({otherPerson, setOtherPerson,userList}) {
  let [selected, setSelected] = useState(0);

  const dispatch = useDispatch();


  return (
    <div className="hidden md:flex h-full flex-col md:w-1/4">
      <div className="sticky border-b border-stroke px-6 dark:border-strokedark py-7.5 flex flex-row gap-x-4">
        <h3 className="text-lg font-medium text-black dark:text-white 2xl:text-xl">
          Chat List
        </h3>
        <span className="rounded-md border-[.5px] border-stroke dark:border-strokedark bg-gray px-2 py-0.5 text-base font-medium text-black dark:bg-boxdark-2 dark:text-white 2xl:ml-4">
          {userList.length}
        </span>
      </div>

      <div className="flex max-h-full flex-col overflow-auto p-5">
        <form action="" className="sticky mb-7">
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded border border-stroke bg-gray-2 py-2.5 pl-5 pr-10 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark-2"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2">
            <MagnifyingGlassIcon size={20}></MagnifyingGlassIcon>
          </button>
        </form>

        <div className="no-scrollbar overflow-auto max-h-full space-y-2.5">
          {(userList || []).map((object, item) => {
            return (
              <div
                className={`flex cursor-pointer items-center rounded px-4 py-2  ${
                  selected === item
                    ? "bg-gray dark:bg-boxdark-2"
                    : "hover:bg-gray-2 dark:hover:bg-strokedark"
                } `}
                key={item}
                onClick={() => {
                  setSelected(item);
                  setOtherPerson(object._id);
                  dispatch(startConversation({ userId: object._id }));
                }}
              >
                <div className="relative mr-3.5 h-11 w-full max-w-11 rounded-full">
                  <img
                    src={object.avatar || dummyAvatar}
                    alt="profile"
                    className="h-full w-full rounded-full object-cover object-center"
                  />
                  <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-gray-2 ${object.status === "online" ? "bg-success": "bg-gray"}`}></span>
                </div>
                <div className="w-full">
                  <h5 className="text-sm font-medium text-black dark:text-white">
                    {object.name}
                  </h5>
                  <p className="text-sm">{object.message || "Start Conversation"}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default ChatList;
