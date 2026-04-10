"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "◇" },
  { href: "/growth", label: "Growth", icon: "◆" },
  { href: "/legal", label: "Legal", icon: "§" },
  { href: "/brand", label: "Brand", icon: "◈" },
  { href: "/industry", label: "Industry", icon: "◊" },
  { href: "/dev", label: "Dev", icon: "⌘" },
  { href: "/canvas", label: "Canvas", icon: "▣" },
  { href: "/drive", label: "Drive", icon: "▤" },
  { href: "/tracker", label: "Tracker", icon: "▥" },
  { href: "/approvals", label: "Approvals", icon: "✓" },
  { href: "/slack", label: "Slack", icon: "#" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-5 dark:border-gray-800">
        <span className="text-2xl text-coral">◆</span>
        <span className="font-serif text-xl font-bold tracking-tight">
          Yemz
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-coral/10 text-coral"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                  }`}
                >
                  <span className="w-5 text-center">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-coral/20 flex items-center justify-center">
            <span className="text-xs font-medium text-coral">Y</span>
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Yemz Team
            </p>
            <p className="text-xs text-gray-500">Platform</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
