import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteFile, getDownloadUrl, listFiles, uploadFile } from "@/lib/files-api";
import { cn } from "@/lib/utils";
import type { FileMeta } from "@/types/files";

const CDN_BOOTSTRAP_ICONS =
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT_HINT =
  ".pdf,.zip,.txt,.csv,.json,.md,.markdown,.png,.jpg,.jpeg,.gif,.webp,.svg,image/*";

function ensureStylesheet(href: string, id: string) {
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

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function iconForFile(file: FileMeta) {
  const ext = file.ext.toLowerCase();
  const mime = file.mime.toLowerCase();

  if (mime.startsWith("image/")) {
    return "bi-file-earmark-image-fill text-sky-600";
  }
  if (mime === "application/pdf" || ext === "pdf") {
    return "bi-file-earmark-pdf-fill text-red-600";
  }
  if (mime.includes("zip") || ext === "zip") {
    return "bi-file-earmark-zip-fill text-amber-600";
  }
  if (
    mime.startsWith("text/") ||
    ext === "txt" ||
    ext === "md" ||
    ext === "markdown" ||
    ext === "csv" ||
    ext === "json"
  ) {
    return "bi-file-earmark-text-fill text-emerald-700";
  }
  return "bi-file-earmark-fill text-slate-600";
}

export function PageFour() {
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assetsStatus, setAssetsStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;
    void ensureStylesheet(CDN_BOOTSTRAP_ICONS, "bootstrap-icons")
      .then(() => {
        if (mounted) {
          setAssetsStatus("ready");
        }
      })
      .catch((loadError) => {
        if (!mounted) {
          return;
        }
        setAssetsStatus("error");
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load icon assets.",
        );
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const result = await listFiles();
        if (mounted) {
          setFiles(result);
        }
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load files.",
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedSize = selectedFile?.size ?? 0;
  const sizeExceeded = selectedSize > MAX_BYTES;
  const uploadDisabled =
    isUploading ||
    isLoading ||
    assetsStatus === "loading" ||
    !selectedFile ||
    sizeExceeded;

  const selectedFileSummary = useMemo(() => {
    if (!selectedFile) {
      return "No file selected";
    }
    return `${selectedFile.name} (${formatBytes(selectedFile.size)})`;
  }, [selectedFile]);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploadDisabled || !selectedFile) {
      return;
    }

    setError(null);
    setIsUploading(true);
    try {
      const created = await uploadFile(selectedFile);
      setFiles((current) => [created, ...current].slice(0, 100));
      setSelectedFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to upload file.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (deletingId) {
      return;
    }

    setError(null);
    setDeletingId(id);
    try {
      await deleteFile(id);
      setFiles((current) => current.filter((file) => file.id !== id));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete file.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-border/80 bg-white/70 p-6 backdrop-blur">
        <Badge className="mb-3">Page 4</Badge>
        <h2 className="font-serif text-3xl leading-tight">File upload + metadata list</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Upload files through a Netlify Function, store file metadata in Netlify
          Blobs, and list/delete/download entries from the same SPA view.
        </p>
      </section>

      <Card className="bg-card/90">
        <CardHeader>
          <CardTitle>Upload file</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleUpload}>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT_HINT}
              onChange={(event) => {
                setError(null);
                const next = event.target.files?.[0] ?? null;
                setSelectedFile(next);
              }}
              className="block w-full rounded-xl border border-border bg-white/90 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:text-xs file:font-medium file:text-brand-foreground"
            />
            <p className="text-xs text-muted-foreground">
              {selectedFileSummary} • Max {formatBytes(MAX_BYTES)}
            </p>
            {sizeExceeded && (
              <p className="text-xs text-red-600">Selected file exceeds 10MB limit.</p>
            )}
            <div className="flex items-center justify-end">
              <Button type="submit" disabled={uploadDisabled}>
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
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
          <CardTitle>Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading files...</p>}

          {!isLoading && files.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              No files uploaded yet.
            </div>
          )}

          {!isLoading &&
            files.map((file) => (
              <div
                key={file.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-white/85 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-xl",
                      assetsStatus === "error" ? "text-slate-600" : iconForFile(file),
                    )}
                  >
                    <i
                      className={cn(
                        assetsStatus === "error" ? "bi bi-file-earmark" : `bi ${iconForFile(file)}`,
                      )}
                      aria-hidden="true"
                    />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(file.size)} • {file.mime} •{" "}
                      {new Date(file.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={getDownloadUrl(file.id)}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Download
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={deletingId === file.id}
                    onClick={() => void handleDelete(file.id)}
                  >
                    {deletingId === file.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
