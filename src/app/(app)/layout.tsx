import { BottomNav } from "@/components/layout/bottom-nav";

/**
 * Shell for the authenticated part of the app: a centered mobile-width column
 * with a fixed bottom navigation bar. The middleware enforces auth.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <main className="flex-1 px-4 pb-24 pt-[max(1.5rem,env(safe-area-inset-top))]">{children}</main>
      <BottomNav />
    </div>
  );
}
