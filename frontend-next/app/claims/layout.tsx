import { UserShell } from "@/components/user-shell";

export default function ClaimsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserShell>{children}</UserShell>;
}
