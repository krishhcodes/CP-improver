"use client";

import React from "react";
import { UserProvider } from "@/context/UserContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}
