import React from 'react'
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProfileForm from '../section/Profile/ProfileForm';
import UpdatePasswordForm from '../section/Profile/UpdatePasswordForm';

export default function ProfilePage() {
  const [openTab,setOpenTab] = useState(1);
  const activeClass = "text-primary border-primary";
  const inactiveClass = "border-transparent";
  return (
    <div className='w-full min-h-screen overflow-auto rounded-sm border border-stroke bg-white py-7.5 px-20 shadow-default dark:border-strokedark dark:bg-boxdark'>
      {/* Buttons for tabs */}

      <div className="mb-6 flex flex-wrap gap-5 border-b border-stroke dark:border-strokedark sm:gap-10">
        <Link onClick={()=> setOpenTab(1)}  className={`py-4 text-sm font-medium hover:text-primary md:text-base border-b-2 ${openTab === 1 ? activeClass : inactiveClass}`} to="#">
          Profile
        </Link>
        <Link onClick={()=> setOpenTab(2)}  className={`py-4 text-sm font-medium hover:text-primary md:text-base border-b-2 ${openTab === 2 ? activeClass : inactiveClass}`} to="#">
          Update Password
        </Link>
      </div>

      {/* Content for tabs */}

      <div>
        <div className={`${openTab === 1 ? "block" : "hidden"}`}>
          {/* Profile Form */}
          <ProfileForm></ProfileForm>
        </div>

        <div className={`${openTab === 2 ? "block" : "hidden"}`}>
          {/* Update Password Form */}
          <UpdatePasswordForm></UpdatePasswordForm>
        </div>
      </div>

    </div>
  )
}
