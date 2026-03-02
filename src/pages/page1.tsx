import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const modules = [
  {
    title: "Landing Composition",
    description: "Hero + supporting cards that can be remixed quickly.",
    progress: 86,
  },
  {
    title: "Token-Friendly Styling",
    description: "All key color/spacing decisions are centralized in theme vars.",
    progress: 71,
  },
  {
    title: "Client Routing Paths",
    description: "Static pages mapped for `/`, `/page1`, and `/page2`.",
    progress: 100,
  },
];

const sequence = [
  "Establish shell and visual language",
  "Drop in reusable component primitives",
  "Layer route-level UX modules",
  "Keep API surface ready for Netlify functions",
];

export function PageOne() {
  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-border/80 bg-white/70 p-6 backdrop-blur">
        <Badge className="mb-3">Page 1</Badge>
        <h2 className="font-serif text-3xl leading-tight">Design module overview</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          A compact snapshot of the frontend structure. This page is intentionally
          static and API-free, so it can act as a baseline before backend wiring.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {modules.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{item.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-700"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Prototype sequence</CardTitle>
          <CardDescription>
            A suggested order for expanding this POC into a full stack.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sequence.map((step, index) => (
            <div key={step} className="flex items-start gap-3 rounded-xl bg-muted/60 p-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-foreground">
                {index + 1}
              </span>
              <p className="text-sm">{step}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
