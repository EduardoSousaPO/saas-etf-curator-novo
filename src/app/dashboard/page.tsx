"use client"

import React from 'react'
import UnifiedNavbar from '@/components/layout/UnifiedNavbar'
import RequireAuth from '@/components/auth/RequireAuth'
import UniversalWealthDashboard from '@/components/wealth/UniversalWealthDashboard'

export default function Dashboard() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-white">
        <UnifiedNavbar />
        <div className="pt-16">
          <UniversalWealthDashboard />
        </div>
      </div>
    </RequireAuth>
  )
}