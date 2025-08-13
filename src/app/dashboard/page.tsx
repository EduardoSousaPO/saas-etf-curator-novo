"use client"

import React from 'react'
import Navbar from '@/components/layout/Navbar'
import RequireAuth from '@/components/auth/RequireAuth'
import SimplifiedWealthDashboard from '@/components/wealth/SimplifiedWealthDashboard'

export default function Dashboard() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-16">
          <SimplifiedWealthDashboard />
        </div>
      </div>
    </RequireAuth>
  )
}