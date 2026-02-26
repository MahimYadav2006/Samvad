import { useState } from "react";
import ProfileForm from "../section/Profile/ProfileForm";
import UpdatePasswordForm from "../section/Profile/UpdatePasswordForm";

const TABS = [
  { key: 1, label: "Profile" },
  { key: 2, label: "Update Password" },
];

export default function ProfilePage() {
  const [openTab, setOpenTab] = useState(1);

  return (
    <div className="fancy-scrollbar h-full overflow-y-auto p-4 md:p-6">
      <div className="surface-card mx-auto w-full max-w-5xl rounded-3xl p-4 shadow-xl shadow-primary/5 sm:p-6">
        <div className="mb-5 border-b border-stroke/70 pb-4 dark:border-strokedark/70">
          <h1 className="font-display text-2xl font-bold text-black dark:text-white md:text-3xl">
            Profile Settings
          </h1>
          <p className="mt-1 text-sm text-body dark:text-bodydark">
            Manage your profile details and security preferences.
          </p>

          <div className="mt-4 inline-flex rounded-2xl border border-stroke/70 bg-white/70 p-1 dark:border-strokedark dark:bg-boxdark-2/70">
            {TABS.map((tab) => {
              const isActive = openTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setOpenTab(tab.key)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold md:px-5 ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-body hover:text-black dark:text-bodydark dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>{openTab === 1 ? <ProfileForm /> : <UpdatePasswordForm />}</div>
      </div>
    </div>
  );
}
