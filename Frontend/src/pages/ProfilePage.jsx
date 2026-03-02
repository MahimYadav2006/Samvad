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
      <div className="mx-auto w-full max-w-2xl space-y-5">
        <div>
          <h1 className="font-display text-xl font-bold text-black dark:text-white">
            Settings
          </h1>
          <p className="mt-0.5 text-sm text-body/60 dark:text-bodydark/50">
            Manage your profile and security.
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-stroke/50 bg-white/60 p-1 dark:border-strokedark/30 dark:bg-boxdark-2/50">
          {TABS.map((tab) => {
            const isActive = openTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setOpenTab(tab.key)}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-body/60 hover:text-black dark:text-bodydark/50 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div>{openTab === 1 ? <ProfileForm /> : <UpdatePasswordForm />}</div>
      </div>
    </div>
  );
}
