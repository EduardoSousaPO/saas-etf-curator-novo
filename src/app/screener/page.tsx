// src/app/screener/page.tsx
"use client";

import React from "react";
import UnifiedNavbar from "@/components/layout/UnifiedNavbar";
import RequireAuth from "@/components/auth/RequireAuth";
import { UnifiedScreener } from "@/components/screener/UnifiedScreener";

export default function ScreenerPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-white">
        <UnifiedNavbar />
        <UnifiedScreener type="etf" />
      </div>
    </RequireAuth>
  );
}