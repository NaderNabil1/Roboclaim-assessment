"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { useAuth } from "@/contexts/auth-context";

const nav = [
  { href: "/admin/reports", label: "Claim reports" },
  { href: "/admin/policies", label: "Policies" },
  { href: "/admin/messages", label: "Support inbox" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {nav.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/admin/reports" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-white/10 text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarFooter = (
    <>
      {user && (
        <p className="mb-3 truncate text-xs text-slate-400" title={user.email}>
          {user.email}
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          void (async () => {
            await logout();
            router.push("/");
            router.refresh();
          })();
        }}
        className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
      >
        Sign out
      </button>
    </>
  );

  return (
    <div className="flex min-h-full flex-1 bg-slate-50 text-slate-900">
      <aside
        className="hidden w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-900 text-white md:flex"
        aria-label="Admin navigation"
      >
        <div className="flex h-16 items-center border-b border-slate-700/80 px-5">
          <Link
            href="/admin/reports"
            className="flex min-w-0 items-center gap-2 font-semibold tracking-tight"
          >

            <span className="truncate text-sm">
              Roboclaim<span className="font-normal text-slate-400">Ai</span>
            </span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <NavLinks />
        </div>
        <div className="border-t border-slate-700/80 p-4">{sidebarFooter}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 md:hidden">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
            aria-controls="admin-mobile-nav"
          >
            Menu
          </button>
          <span className="truncate text-sm font-semibold text-slate-900">
            Admin
          </span>
          <div className="w-[52px]" aria-hidden />
        </header>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            role="presentation"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <div
          id="admin-mobile-nav"
          className={`fixed inset-y-0 left-0 z-50 flex w-[min(100%,280px)] flex-col bg-slate-900 text-white shadow-xl transition-transform duration-200 md:hidden ${
            mobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
          }`}
        >
          <div className="flex h-14 items-center justify-between border-b border-slate-700/80 px-4">
            <span className="text-sm font-semibold">Navigation</span>
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-sm text-slate-300"
              onClick={() => setMobileOpen(false)}
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </div>
          <div className="border-t border-slate-700/80 p-4">{sidebarFooter}</div>
        </div>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
