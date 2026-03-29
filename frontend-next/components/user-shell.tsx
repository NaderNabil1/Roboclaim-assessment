"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { useAuth } from "@/contexts/auth-context";

const nav = [
  { href: "/claims", label: "My claims" },
  { href: "/claims/policies", label: "My policies" },
  { href: "/claims/new", label: "New report" },
  { href: "/claims/support", label: "Contact admin" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Account">
      {nav.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function UserShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarFooter = (
    <>
      {user && (
        <p className="mb-3 truncate text-xs text-slate-500" title={user.email}>
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
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
      >
        Sign out
      </button>
    </>
  );

  return (
    <div className="flex min-h-full flex-1 bg-slate-50 text-slate-900">
      <aside
        className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white md:flex"
        aria-label="Account navigation"
      >
        <div className="flex h-16 items-center border-b border-slate-200 px-5">
          <Link
            href="/claims"
            className="flex min-w-0 items-center gap-2 font-semibold tracking-tight text-slate-900"
          >
            <span className="truncate text-sm">
              Roboclaim<span className="font-normal text-slate-500">Ai</span>
            </span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <NavLinks />
        </div>
        <div className="border-t border-slate-200 p-4">{sidebarFooter}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 md:hidden">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
            aria-controls="user-mobile-nav"
          >
            Menu
          </button>
          <span className="truncate text-sm font-semibold text-slate-900">
            Account
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
          id="user-mobile-nav"
          className={`fixed inset-y-0 left-0 z-50 flex w-[min(100%,280px)] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 md:hidden ${
            mobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
          }`}
        >
          <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
            <span className="text-sm font-semibold">Menu</span>
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-sm text-slate-600"
              onClick={() => setMobileOpen(false)}
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </div>
          <div className="border-t border-slate-200 p-4">{sidebarFooter}</div>
        </div>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
