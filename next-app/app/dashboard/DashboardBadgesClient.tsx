"use client";
import dynamic from "next/dynamic";

const BadgeDisplay = dynamic(() => import("@/components/BadgeDisplay"), { ssr: false });

export default function DashboardBadgesClient() {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-yellow-700 mb-4">Your Earned Badges</h2>
      <BadgeDisplay />
    </div>
  );
}