import React from 'react'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="h-[100dvh] overflow-hidden p-0 md:p-2.5">
      <div className="surface-card flex h-full rounded-none md:rounded-2xl md:shadow-xl md:shadow-black/[0.04]">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-hidden pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
