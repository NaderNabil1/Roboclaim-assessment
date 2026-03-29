import { LoginForm } from "@/components/login-form";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-slate-900">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white"
              aria-hidden
            >
              IS
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Roboclaim<span className="font-normal text-slate-600">Ai</span>
            </span>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-16 lg:px-8">
        <div className="max-w-md flex-1">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Sign in
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Access your claim workspace
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Policyholders submit reports and track status. Administrators manage
            all policies from one place.
          </p>
        </div>
        <div className="w-full max-w-md flex-1 sm:pt-2">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
