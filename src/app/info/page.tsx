"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

const TABS = [
  { id: "events", label: "イベント", href: "/events" },
  { id: "quests", label: "クエスト", href: "/quests" },
  { id: "news", label: "ニュース", href: "/news" },
] as const;

export default function InfoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("events");

  function handleTabClick(tab: typeof TABS[number]) {
    setActiveTab(tab.id);
    router.push(tab.href);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white pt-12 pb-0 px-5">
        <h1 className="text-[17px] font-medium text-[#231714]">Info</h1>
      </header>

      {/* タブバー */}
      <div className="bg-white border-b border-gray-100 flex sticky top-0 z-10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={clsx(
              "flex-1 py-3 text-xs font-medium text-center relative transition-colors",
              activeTab === tab.id
                ? "text-[#A5C1C8]"
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-[20%] right-[20%] h-[2px] bg-[#A5C1C8] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* 各タブページへリダイレクト */}
      <div className="p-4 text-center text-sm text-gray-400">
        読み込み中...
      </div>
    </div>
  );
}
