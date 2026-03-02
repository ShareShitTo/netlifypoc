import { randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";
import { connectLambda, getStore } from "@netlify/blobs";
import type { Handler, HandlerEvent, HandlerResponse } from "@netlify/functions";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_RESULTS = 100;
const FILES_PREFIX = "file:";

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "text/plain",
  "text/csv",
  "application/json",
  "text/markdown",
]);

const ALLOWED_EXT = new Set([
  "pdf",
  "zip",
  "txt",
  "csv",
  "json",
  "md",
  "markdown",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
]);

type FileMeta = {
  id: string;
  name: string;
  size: number;
  mime: string;
  ext: string;
  uploadedAt: string;
};

type ApiErrorResponse = {
  error: string;
};

function store() {
  return getStore("uploaded-files");
}

function toJson(statusCode: number, body: object): HandlerResponse {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function toError(statusCode: number, message: string) {
  return toJson(statusCode, { error: message } satisfies ApiErrorResponse);
}

function fileKey(id: string) {
  return `${FILES_PREFIX}${id}`;
}

function getExtension(fileName: string) {
  const parts = fileName.split(".");
  if (parts.length < 2) {
    return "";
  }
  return parts.at(-1)?.toLowerCase() ?? "";
}

function sanitizeFileName(input: string) {
  const basename = input.replace(/^.*[\\/]/, "").trim();
  const cleaned = basename
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[/"\\]/g, "_");
  return cleaned || "upload.bin";
}

function isAllowedType(mime: string, ext: string) {
  if (mime.startsWith("image/")) {
    return true;
  }
  return ALLOWED_MIME.has(mime) || ALLOWED_EXT.has(ext);
}

function toFileMeta(metadata: unknown): FileMeta | null {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const source = metadata as Record<string, unknown>;
  const id = source.id;
  const name = source.name;
  const size = source.size;
  const mime = source.mime;
  const ext = source.ext;
  const uploadedAt = source.uploadedAt;

  const numericSize =
    typeof size === "number"
      ? size
      : typeof size === "string"
        ? Number(size)
        : Number.NaN;

  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof mime !== "string" ||
    typeof ext !== "string" ||
    typeof uploadedAt !== "string" ||
    !Number.isFinite(numericSize)
  ) {
    return null;
  }

  return {
    id,
    name,
    size: numericSize,
    mime,
    ext,
    uploadedAt,
  };
}

async function listFiles() {
  const result = await store().list({ prefix: FILES_PREFIX });
  const files = await Promise.all(
    result.blobs.map(async ({ key }) => {
      const info = await store().getMetadata(key);
      if (!info) {
        return null;
      }
      return toFileMeta(info.metadata);
    }),
  );

  const normalized = files
    .filter((item): item is FileMeta => item !== null)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    .slice(0, MAX_RESULTS);

  return toJson(200, { files: normalized });
}

async function uploadFile(event: HandlerEvent) {
  if (!event.body) {
    return toError(400, "Request body is required.");
  }

  const contentType =
    event.headers["content-type"] ??
    event.headers["Content-Type"] ??
    event.multiValueHeaders?.["content-type"]?.[0] ??
    event.multiValueHeaders?.["Content-Type"]?.[0];
  if (!contentType || !contentType.toLowerCase().includes("multipart/form-data")) {
    return toError(400, "Expected multipart/form-data upload.");
  }

  const body = Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8");
  const request = new Request("http://localhost/upload", {
    method: "POST",
    headers: { "content-type": contentType },
    body,
  });
  const formData = await request.formData();
  const incoming = formData.get("file");
  if (!(incoming instanceof File)) {
    return toError(400, "Missing multipart file under field `file`.");
  }

  const name = sanitizeFileName(incoming.name || "upload.bin");
  const mime = (incoming.type || "application/octet-stream").toLowerCase();
  const ext = getExtension(name);
  const bytes = Buffer.from(await incoming.arrayBuffer());

  if (bytes.byteLength === 0) {
    return toError(400, "Cannot upload an empty file.");
  }

  if (bytes.byteLength > MAX_FILE_BYTES) {
    return toError(413, "File exceeds 10MB limit.");
  }

  if (!isAllowedType(mime, ext)) {
    return toError(400, "File type not allowed for this POC.");
  }

  const id = randomUUID();
  const uploadedAt = new Date().toISOString();
  const metadata: FileMeta = {
    id,
    name,
    size: bytes.byteLength,
    mime,
    ext,
    uploadedAt,
  };

  await store().set(fileKey(id), bytes, { metadata });
  return toJson(201, { file: metadata });
}

async function deleteFile(event: HandlerEvent) {
  const id = event.queryStringParameters?.id?.trim();
  if (!id) {
    return toError(400, "Query parameter `id` is required.");
  }

  const key = fileKey(id);
  const existing = await store().getMetadata(key);
  if (!existing) {
    return toError(404, "File not found.");
  }

  await store().delete(key);
  return toJson(200, { deleted: true, id });
}

export const handler: Handler = async (event) => {
  try {
    connectLambda(event);

    if (event.httpMethod === "GET") {
      return await listFiles();
    }
    if (event.httpMethod === "POST") {
      return await uploadFile(event);
    }
    if (event.httpMethod === "DELETE") {
      return await deleteFile(event);
    }

    return toError(405, "Method not allowed.");
  } catch (error) {
    console.error("files function error", error);
    return toError(500, "Internal server error.");
  }
};
