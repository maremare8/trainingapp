"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Workouts", icon: Dumbbell, match: (p: string) => p === "/" || p.startsWith("/workouts") },
  { href: "/history", label: "History", icon: History, match: (p: string) => p.startsWith("/history") },
  { href: "/settings", label: "Settings", icon: Settings, match: (p: string) => p.startsWith("/settings") },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <nav className="mx-4 flex w-full max-w-xs items-stretch justify-around rounded-2xl border border-border bg-background/90 shadow-lg backdrop-blur-xl">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.5 : 1.5} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
