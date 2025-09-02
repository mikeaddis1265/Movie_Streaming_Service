"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";

export default function ConditionalNavigation() {
  const pathname = usePathname();
  
  // Hide navigation on auth page
  const hideNavigation = pathname === "/auth";
  
  if (hideNavigation) {
    return null;
  }
  
  return <Navigation />;
}