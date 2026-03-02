import { Buffer } from "node:buffer";
import { connectLambda, getStore } from "@netlify/blobs";
import type { Handler, HandlerEvent, HandlerResponse } from "@netlify/functions";

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
  return `file:${id}`;
}

function pickString(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  return fallback;
}

function safeFileName(name: string) {
  return name.replace(/[\r\n"]/g, "_");
}

function metadataFromUnknown(value: unknown) {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as Record<string, unknown>;
}

async function download(event: HandlerEvent): Promise<HandlerResponse> {
  const id = event.queryStringParameters?.id?.trim();
  if (!id) {
    return toError(400, "Query parameter `id` is required.");
  }

  const result = await store().getWithMetadata(fileKey(id), { type: "arrayBuffer" });
  if (!result) {
    return toError(404, "File not found.");
  }

  const metadata = metadataFromUnknown(result.metadata);
  const mime = pickString(metadata.mime, "application/octet-stream");
  const fileName = safeFileName(pickString(metadata.name, `${id}.bin`));
  const buffer = Buffer.from(result.data);

  return {
    statusCode: 200,
    isBase64Encoded: true,
    headers: {
      "content-type": mime,
      "content-length": String(buffer.byteLength),
      "cache-control": "no-store",
      "content-disposition": `attachment; filename="${fileName}"`,
    },
    body: buffer.toString("base64"),
  };
}

export const handler: Handler = async (event) => {
  try {
    connectLambda(event);

    if (event.httpMethod !== "GET") {
      return toError(405, "Method not allowed.");
    }

    return await download(event);
  } catch (error) {
    console.error("file-download function error", error);
    return toError(500, "Internal server error.");
  }
};
