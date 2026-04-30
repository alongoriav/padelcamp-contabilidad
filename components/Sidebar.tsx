"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Receipt,
  Building2,
  Users,
  FileText,
  LogOut,
  Settings,
} from "lucide-react";

interface SidebarProps {
  userName: string;
  userRole: string;
}

const navigation = [
  {
    name: "Movimientos",
    href: "/movimientos",
    icon: Receipt,
    badge: null,
  },
  {
    name: "Estado de Resultados",
    href: "/resultados",
    icon: LayoutDashboard,
    badge: "pronto",
  },
  {
    name: "Proveedores",
    href: "/proveedores",
    icon: Building2,
    badge: "pronto",
  },
  {
    name: "Clientes",
    href: "/clientes",
    icon: Users,
    badge: "pronto",
  },
  {
    name: "Facturas",
    href: "/facturas",
    icon: FileText,
    badge: "pronto",
  },
];

export default function Sidebar({ userName, userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-primary-950 text-slate-100 flex flex-col">
      {/* Header / Logo */}
      <div className="p-6 border-b border-primary-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-primary-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-white">Padel Camp</h1>
            <p className="text-xs text-primary-300">Contabilidad</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          const isDisabled = item.badge === "pronto";

          if (isDisabled) {
            return (
              <div
                key={item.name}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-primary-400 cursor-not-allowed text-sm"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                <span className="text-[10px] bg-primary-800 text-primary-300 px-1.5 py-0.5 rounded">
                  PRONTO
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-700 text-white"
                  : "text-primary-200 hover:bg-primary-900 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-primary-900">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-9 h-9 bg-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {userName}
            </p>
            <p className="text-xs text-primary-300 capitalize">{userRole}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary-200 hover:bg-primary-900 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
