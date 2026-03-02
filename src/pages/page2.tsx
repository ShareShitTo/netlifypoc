import { FormEvent, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createItem, deleteItem, listItems } from "@/lib/items-api";
import type { Item } from "@/types/items";

const MAX_LENGTH = 160;

export function PageTwo() {
  const [items, setItems] = useState<Item[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      try {
        const next = await listItems();
        if (isMounted) {
          setItems(next);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load items.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedText = text.trim();
  const hasNewline = /\r|\n/.test(text);
  const isTooLong = normalizedText.length > MAX_LENGTH;
  const createDisabled =
    isCreating || !normalizedText || hasNewline || isTooLong || isLoading;

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createDisabled) {
      return;
    }

    setError(null);
    setIsCreating(true);

    try {
      const item = await createItem({ text: normalizedText });
      setItems((current) => [item, ...current].slice(0, 50));
      setText("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create item.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (deletingId) {
      return;
    }

    setError(null);
    setDeletingId(id);

    try {
      await deleteItem(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete item.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-border/80 bg-white/70 p-6 backdrop-blur">
        <Badge className="mb-3">Page 2</Badge>
        <h2 className="font-serif text-3xl leading-tight">
          One-line items via Netlify Functions + Blobs
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Create, query, and delete short text entries. This page now persists
          data through your local Netlify function runtime.
        </p>
      </section>

      <Card className="bg-card/90">
        <CardHeader>
          <CardTitle>Add item</CardTitle>
          <CardDescription>
            One line only, up to {MAX_LENGTH} characters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleCreate}>
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Text</span>
              <input
                type="text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                maxLength={MAX_LENGTH}
                placeholder="Write a short note"
                className={cn(
                  "h-11 w-full rounded-xl border border-border bg-white/90 px-3 text-sm outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  hasNewline || isTooLong ? "border-red-300 ring-red-200" : "",
                )}
              />
            </label>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {text.length}/{MAX_LENGTH}
              </p>
              <Button type="submit" disabled={createDisabled}>
                {isCreating ? "Saving..." : "Save item"}
              </Button>
            </div>

            {hasNewline && (
              <p className="text-xs text-red-600">Newlines are not allowed.</p>
            )}
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card className="bg-card/90">
        <CardHeader>
          <CardTitle>Saved items</CardTitle>
          <CardDescription>
            Newest first. Data is fetched from `/.netlify/functions/items`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

          {!isLoading && items.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              No items yet. Add your first one above.
            </div>
          )}

          {!isLoading &&
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-white/80 p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm">{item.text}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deletingId === item.id}
                  onClick={() => void handleDelete(item.id)}
                >
                  {deletingId === item.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
