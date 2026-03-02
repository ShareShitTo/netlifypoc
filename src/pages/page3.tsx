import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CDN_EASYMDE_CSS =
  "https://cdn.jsdelivr.net/npm/easymde@2.20.0/dist/easymde.min.css";
const CDN_EASYMDE_JS =
  "https://cdn.jsdelivr.net/npm/easymde@2.20.0/dist/easymde.min.js";
const CDN_MARKED_JS =
  "https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js";

const DEFAULT_MD = `# Markdown playground

Write markdown on the left.

- This editor is EasyMDE loaded from a CDN
- Preview rendering uses Marked loaded from a CDN
- This page is fully client-side

## Small code block

\`\`\`ts
const hello = "netlify + react";
console.log(hello);
\`\`\`
`;

function loadScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-cdn-id="${id}"]`,
    );
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed: ${src}`)), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.cdnId = id;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener("error", () => reject(new Error(`Failed: ${src}`)), {
      once: true,
    });
    document.head.appendChild(script);
  });
}

function loadStylesheet(href: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLLinkElement>(
      `link[data-cdn-id="${id}"]`,
    );
    if (existing) {
      resolve();
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.cdnId = id;
    link.addEventListener("load", () => resolve(), { once: true });
    link.addEventListener("error", () => reject(new Error(`Failed: ${href}`)), {
      once: true,
    });
    document.head.appendChild(link);
  });
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function PageThree() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [markdown, setMarkdown] = useState(DEFAULT_MD);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let easyMdeInstance:
      | {
          value: () => string;
          codemirror: {
            on: (event: string, handler: () => void) => void;
          };
          toTextArea?: () => void;
        }
      | null = null;

    void (async () => {
      try {
        await loadStylesheet(CDN_EASYMDE_CSS, "easymde-css");
        await Promise.all([
          loadScript(CDN_MARKED_JS, "marked-js"),
          loadScript(CDN_EASYMDE_JS, "easymde-js"),
        ]);

        if (!mounted || !textareaRef.current) {
          return;
        }

        const w = window as unknown as {
          EasyMDE?: new (config: Record<string, unknown>) => {
            value: () => string;
            codemirror: {
              on: (event: string, handler: () => void) => void;
            };
            toTextArea?: () => void;
          };
        };

        if (!w.EasyMDE) {
          throw new Error("EasyMDE did not load from CDN.");
        }

        easyMdeInstance = new w.EasyMDE({
          element: textareaRef.current,
          initialValue: DEFAULT_MD,
          spellChecker: false,
          status: false,
          minHeight: "280px",
          autofocus: false,
          toolbar: [
            "bold",
            "italic",
            "heading",
            "|",
            "quote",
            "unordered-list",
            "ordered-list",
            "|",
            "link",
            "image",
            "code",
            "|",
            "preview",
            "side-by-side",
            "fullscreen",
          ],
        });

        easyMdeInstance.codemirror.on("change", () => {
          setMarkdown(easyMdeInstance?.value() ?? "");
        });

        setMarkdown(easyMdeInstance.value());
        setStatus("ready");
      } catch (requestError) {
        if (!mounted) {
          return;
        }
        setStatus("error");
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load CDN editor dependencies.",
        );
      }
    })();

    return () => {
      mounted = false;
      if (easyMdeInstance?.toTextArea) {
        easyMdeInstance.toTextArea();
      }
    };
  }, []);

  const previewHtml = useMemo(() => {
    const w = window as unknown as {
      marked?: { parse: (source: string) => string };
    };
    if (w.marked?.parse) {
      return w.marked.parse(markdown);
    }
    return `<pre>${escapeHtml(markdown)}</pre>`;
  }, [markdown]);

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-border/80 bg-white/70 p-6 backdrop-blur">
        <Badge className="mb-3">Page 3</Badge>
        <h2 className="font-serif text-3xl leading-tight">CDN markdown editor demo</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Editor: EasyMDE from jsDelivr CDN. Preview parser: Marked from jsDelivr CDN.
        </p>
      </section>

      {status === "loading" && (
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">Loading editor assets...</p>
          </CardContent>
        </Card>
      )}

      {status === "error" && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-5">
            <p className="text-sm text-red-700">
              Failed to load CDN dependencies. {error}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-card/90">
          <CardHeader>
            <CardTitle>Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea ref={textareaRef} defaultValue={DEFAULT_MD} />
          </CardContent>
        </Card>

        <Card className="bg-card/90">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <article
              className="markdown-preview min-h-[320px] rounded-xl border border-border bg-white/80 p-4"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
