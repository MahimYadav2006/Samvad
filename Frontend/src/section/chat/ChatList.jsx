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
      className={`flex min-h-0 shrink-0 flex-col border-r border-stroke/40 bg-white/40 dark:border-strokedark/30 dark:bg-boxdark/20 ${className}`}
    >
      <div className="border-b border-stroke/40 px-4 py-3.5 dark:border-strokedark/30 md:px-5 md:py-4">
        <h3 className="font-display text-lg font-bold text-black dark:text-white">
          Chats
        </h3>

        <div className="relative mt-3">
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-stroke/70 bg-white py-2 pl-9 pr-4 text-sm text-black outline-none transition-colors placeholder:text-body/50 focus:border-primary/50 dark:border-strokedark/60 dark:bg-form-input dark:text-white dark:placeholder:text-bodydark/40"
          />
          <MagnifyingGlassIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-body/40 dark:text-bodydark/30"
          />
        </div>
      </div>

      <div className="fancy-scrollbar no-scrollbar flex-1 overflow-y-auto p-2 md:p-3">
        {filteredUsers.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center px-4 text-center">
            <ChatCircleTextIcon size={28} weight="duotone" className="text-body/30 dark:text-bodydark/20" />
            <p className="mt-2.5 text-sm font-medium text-body/60 dark:text-bodydark/50">
              No chats found
            </p>
            <p className="mt-0.5 text-xs text-body/40 dark:text-bodydark/30">
              Try a different search.
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredUsers.map((user) => {
              const isActive = otherPerson === user._id;
              const isOnline = `${user.status || ""}`.toLowerCase() === "online";

              return (
                <button
                  type="button"
                  key={user._id}
                  onClick={() => handleSelect(user._id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    isActive
                      ? "bg-primary/8 dark:bg-primary/12"
                      : "hover:bg-gray-2/80 dark:hover:bg-meta-4/30"
                  }`}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
                    <img
                      src={user.avatar || dummyAvatar}
                      alt="profile"
                      className="h-full w-full object-cover object-center"
                    />
                    {isOnline ? (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-[1.5px] border-white dark:border-boxdark">
                        <span className="absolute inset-0 rounded-full bg-success" />
                      </span>
                    ) : (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-[1.5px] border-white bg-body/25 dark:border-boxdark dark:bg-bodydark/25" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-semibold ${
                      isActive
                        ? "text-primary"
                        : "text-black dark:text-white"
                    }`}>
                      {user.name}
                    </p>
                    <p className="text-[11px] text-body/60 dark:text-bodydark/45">
                      {isOnline ? "Online" : "Tap to chat"}
                    </p>
                  </div>
                  {isActive && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  )}
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
