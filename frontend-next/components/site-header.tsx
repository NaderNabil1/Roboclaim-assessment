"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

type Variant = "user" | "admin";

const userNav = [
  { href: "/claims", label: "My claims" },
  { href: "/claims/policies", label: "My policies" },
  { href: "/claims/new", label: "New report" },
  { href: "/claims/support", label: "Contact admin" },
];

const adminNav = [
  { href: "/admin/reports", label: "Claim reports" },
  { href: "/admin/policies", label: "Policies" },
  { href: "/admin/messages", label: "Support" },
];

export function SiteHeader({ variant }: { variant: Variant }) {
  const router = useRouter();
  const { logout, user } = useAuth();
  const nav = variant === "admin" ? adminNav : userNav;
  const home = variant === "admin" ? "/admin/reports" : "/claims";

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href={home}
          className="flex min-w-0 items-center gap-2 text-slate-900 transition hover:text-slate-700"
        >
          <span className="truncate text-sm font-semibold tracking-tight">
            Roboclaim<span className="font-normal text-slate-600">Ai</span>
          </span>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <nav className="flex items-center gap-1" aria-label="Main">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {user && (
            <span className="hidden max-w-[140px] truncate text-xs text-slate-500 sm:inline">
              {user.email}
            </span>
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
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
