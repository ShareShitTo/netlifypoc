import { ArrowRight, Flame, Layers2, Route } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const highlights = [
  {
    title: "Lightweight Routing",
    description: "Simple client-side paths ready for Netlify SPA redirects.",
    icon: Route,
  },
  {
    title: "Composable Components",
    description: "shadcn-style UI building blocks for a clean baseline.",
    icon: Layers2,
  },
  {
    title: "Visual Polish",
    description: "Soft gradients, high contrast typography, and motion accents.",
    icon: Flame,
  },
];

const quickPanels = [
  {
    heading: "Page 1",
    copy: "A modular section view with cards and status snapshots.",
    href: "/page1",
  },
  {
    heading: "Page 2",
    copy: "A tiny interactive board with local-only state.",
    href: "/page2",
  },
];

export function HomePage() {
  return (
    <div className="space-y-8 md:space-y-10">
      <section className="grid gap-5 rounded-3xl border border-border/80 bg-white/70 p-6 shadow-sm backdrop-blur md:grid-cols-[1.25fr_0.75fr] md:p-8">
        <div className="space-y-5">
          <Badge>React + Tailwind + shadcn patterns</Badge>
          <h1 className="max-w-xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            Netlify-ready SPA shell with clean pages and zero backend coupling.
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            This frontend is intentionally minimal, but it still feels designed:
            expressive typography, responsive layout, and component consistency.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/page1" className={buttonVariants({ size: "lg" })}>
              Explore page 1
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/page2"
              className={buttonVariants({ variant: "ghost", size: "lg" })}
            >
              Open page 2
            </Link>
          </div>
        </div>

        <div className="grid gap-3">
          {quickPanels.map((panel, index) => (
            <Card
              key={panel.heading}
              className={cn(
                "border-dashed bg-white/75",
                index === 0 ? "animate-float" : "",
              )}
            >
              <CardHeader>
                <CardTitle>{panel.heading}</CardTitle>
                <CardDescription>{panel.copy}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  to={panel.href}
                  className={buttonVariants({
                    variant: "secondary",
                    className: "w-full",
                  })}
                >
                  Open section
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <div className="mb-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand">
                <item.icon size={18} />
              </div>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
