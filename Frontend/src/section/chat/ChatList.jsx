import { MagnifyingGlassIcon, ChatCircleTextIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import dummyAvatar from "../../images/user/user-01.png";

function ChatList({
  otherPerson,
  setOtherPerson,
  userList,
  onConversationSelected,
  className = "",
}) {
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return userList || [];
    const keyword = query.trim().toLowerCase();
    return (userList || []).filter((user) =>
      `${user.name || ""}`.toLowerCase().includes(keyword)
    );
  }, [userList, query]);

  const handleSelect = (userId) => {
    setOtherPerson(userId);
    if (onConversationSelected) onConversationSelected(userId);
  };

  return (
    <aside
      className={`flex min-h-0 shrink-0 flex-col border-r border-stroke/70 bg-white/55 dark:border-strokedark/70 dark:bg-boxdark/20 ${className}`}
    >
      <div className="border-b border-stroke/70 px-4 py-4 dark:border-strokedark/70 md:px-6 md:py-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl font-bold text-black dark:text-white">
              Chats
            </h3>
            <p className="text-xs font-medium text-body dark:text-bodydark">
              {userList.length} contact{userList.length === 1 ? "" : "s"}
            </p>
          </div>
          <span className="rounded-xl bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Active
          </span>
        </div>

        <div className="relative mt-4">
          <input
            type="text"
            placeholder="Search conversations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-stroke bg-white py-2.5 pl-10 pr-4 text-sm text-black placeholder:text-body dark:border-form-strokedark dark:bg-form-input dark:text-white"
          />
          <MagnifyingGlassIcon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-bodydark2"
          />
        </div>
      </div>

      <div className="fancy-scrollbar no-scrollbar flex-1 overflow-y-auto p-3 md:p-4">
        {filteredUsers.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-stroke p-6 text-center dark:border-strokedark">
            <ChatCircleTextIcon size={34} className="mb-3 text-bodydark2" />
            <p className="text-sm font-semibold text-black dark:text-white">
              No chats found
            </p>
            <p className="mt-1 text-xs text-body dark:text-bodydark">
              Try another search keyword.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((user) => {
              const isActive = otherPerson === user._id;
              const isOnline = `${user.status || ""}`.toLowerCase() === "online";

              return (
                <button
                  type="button"
                  key={user._id}
                  onClick={() => handleSelect(user._id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition md:px-4 ${
                    isActive
                      ? "border-primary/30 bg-primary/10"
                      : "border-transparent bg-white/70 hover:border-stroke hover:bg-gray-2 dark:bg-boxdark/30 dark:hover:border-strokedark dark:hover:bg-meta-4/60"
                  }`}
                >
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl">
                    <img
                      src={user.avatar || dummyAvatar}
                      alt="profile"
                      className="h-full w-full object-cover object-center"
                    />
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-boxdark">
                        <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-40" />
                        <span className="absolute inset-0 rounded-full bg-success" />
                      </span>
                    )}
                    {!isOnline && (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-graydark dark:border-boxdark" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-black dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-body dark:text-bodydark">
                      {isOnline ? "Online" : "Tap to chat"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

export default ChatList;
