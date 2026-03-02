import { Compass, Sparkles } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { ThemeSelector } from "@/components/theme/theme-selector";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Page 1", to: "/page1" },
  { label: "Page 2", to: "/page2" },
  { label: "Page 3", to: "/page3" },
  { label: "Page 4", to: "/page4" },
];

export function AppShell() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-grid-pattern opacity-30" />
      <div className="pointer-events-none absolute -left-24 top-32 -z-10 h-80 w-80 rounded-full bg-brand/20 blur-[90px]" />
      <div className="pointer-events-none absolute -right-24 top-4 -z-10 h-80 w-80 rounded-full bg-cyan-300/25 blur-[110px]" />

      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/75 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-5">
          <NavLink to="/" className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-glow">
              <Compass size={16} />
            </span>
            <span className="hidden sm:inline">Netlify POC UI</span>
          </NavLink>

          <nav className="flex items-center gap-1 rounded-full border border-border/80 bg-white/70 p-1 backdrop-blur">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-brand text-brand-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeSelector />
            <NavLink
              to="/page2"
              className={buttonVariants({
                variant: "secondary",
                size: "sm",
                className: "hidden md:inline-flex",
              })}
            >
              <Sparkles size={14} />
              Preview
            </NavLink>
          </div>
        </div>
      </header>

      <main className="container pb-14 pt-8 md:pt-12">
        <Outlet />
      </main>
    </div>
  );
}
