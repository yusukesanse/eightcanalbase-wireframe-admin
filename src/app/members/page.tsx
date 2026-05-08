"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SKILL_CATEGORIES } from "@/types";

interface MemberItem {
  lineUserId: string;
  displayName: string;
  pictureUrl: string;
  catchphrase: string;
  skills: string[];
}

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/members", { credentials: "include" });
        if (!res.ok) {
          if (res.status === 401) router.replace("/login");
          return;
        }
        const data = await res.json();
        setMembers(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  // 全メンバーが持つスキルのユニーク一覧（出現頻度順）
  const allSkills = useMemo(() => {
    const counts = new Map<string, number>();
    members.forEach((m) =>
      m.skills.forEach((s) => counts.set(s, (counts.get(s) || 0) + 1))
    );
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([skill]) => skill);
  }, [members]);

  // フィルタリング
  const filtered = useMemo(() => {
    let list = members;

    if (selectedSkill) {
      list = list.filter((m) => m.skills.includes(selectedSkill));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.displayName.toLowerCase().includes(q) ||
          m.catchphrase.toLowerCase().includes(q) ||
          m.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    return list;
  }, [members, selectedSkill, search]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white pt-12 pb-4 px-5">
        <h1 className="text-[17px] font-medium text-[#231714]">メンバー</h1>
        <p className="text-[11px] text-[#231714]/40 mt-1">
          {members.length}人のメンバー
        </p>
      </header>

      {/* 検索バー */}
      <div className="bg-white px-5 pb-3 border-b border-gray-100">
        <div className="relative">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="名前やスキルで検索..."
            className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-gray-50 rounded-lg border border-gray-100 focus:outline-none focus:border-[#A5C1C8] transition-colors"
          />
        </div>
      </div>

      {/* スキルフィルタ */}
      {allSkills.length > 0 && (
        <div className="bg-white px-5 py-3 border-b border-gray-100 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setSelectedSkill("")}
              className={`px-3 py-1.5 text-[11px] rounded-full border whitespace-nowrap transition-colors ${
                !selectedSkill
                  ? "bg-[#A5C1C8] text-white border-[#A5C1C8]"
                  : "bg-white text-[#231714]/50 border-gray-200"
              }`}
            >
              すべて
            </button>
            {allSkills.map((skill) => (
              <button
                key={skill}
                onClick={() =>
                  setSelectedSkill(selectedSkill === skill ? "" : skill)
                }
                className={`px-3 py-1.5 text-[11px] rounded-full border whitespace-nowrap transition-colors ${
                  selectedSkill === skill
                    ? "bg-[#A5C1C8] text-white border-[#A5C1C8]"
                    : "bg-white text-[#231714]/50 border-gray-200"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* メンバー一覧 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#A5C1C8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mb-3 text-gray-200">
            <path d="M15 18a6 6 0 100-12 6 6 0 000 12zM3 34c0-6 5-10 12-10s12 4 12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M27 6a6 6 0 010 12M33 24c4 1 7 4 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-gray-400">
            {search || selectedSkill
              ? "該当するメンバーが見つかりません"
              : "まだメンバーがいません"}
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {filtered.map((member) => (
            <MemberCard
              key={member.lineUserId}
              member={member}
              onClick={() => router.push(`/members/${member.lineUserId}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MemberCard({
  member,
  onClick,
}: {
  member: MemberItem;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl p-4 flex items-start gap-3 text-left shadow-sm hover:shadow transition-shadow"
    >
      {member.pictureUrl ? (
        <img
          src={member.pictureUrl}
          alt=""
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-[#A5C1C8]/20 flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3a3.5 3.5 0 013.5 3.5v0A3.5 3.5 0 0110 10v0a3.5 3.5 0 01-3.5-3.5v0A3.5 3.5 0 0110 3z" stroke="#A5C1C8" strokeWidth="1.3" />
            <path d="M3 17c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="#A5C1C8" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-[#231714] truncate">
          {member.displayName}
        </p>
        {member.catchphrase && (
          <p className="text-[11px] text-[#231714]/50 mt-0.5 truncate">
            {member.catchphrase}
          </p>
        )}
        {member.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {member.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 text-[10px] rounded-full bg-[#A5C1C8]/10 text-[#A5C1C8]"
              >
                {skill}
              </span>
            ))}
            {member.skills.length > 4 && (
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-50 text-gray-400">
                +{member.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-1 flex-shrink-0">
        <path d="M5 3l4 4-4 4" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
