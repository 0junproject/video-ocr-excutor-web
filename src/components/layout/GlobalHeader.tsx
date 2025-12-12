"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function GlobalHeader() {
  const pathname = usePathname();

  const navItems = [
    { name: "🛠️ Workspace", href: "/workspace" },
    { name: "📖 User Guide", href: "/guide" },
  ];

  return (
    <header className="h-[50px] bg-background border-b border-border flex items-center justify-between px-5 shrink-0 z-50">
      <Link href="/" className="font-bold text-lg text-primary">
        OCR <span className="text-muted-foreground text-sm font-normal">Studio</span>
      </Link>

      <nav className="flex gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm px-3 py-1.5 rounded-md transition-colors",
              pathname.startsWith(item.href)
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
