import { connectLambda, getStore } from "@netlify/blobs";
import type { Handler, HandlerEvent, HandlerResponse } from "@netlify/functions";

type Item = {
  id: string;
  text: string;
  createdAt: string;
};

type ApiErrorResponse = {
  error: string;
};

const MAX_TEXT_LENGTH = 160;
const MAX_RESULTS = 50;

function getItemStore() {
  return getStore("one-line-items");
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

function toError(statusCode: number, message: string): HandlerResponse {
  return toJson(statusCode, { error: message } satisfies ApiErrorResponse);
}

function keyForItem(id: string) {
  return `item:${id}`;
}

function validateText(input: unknown): string | null {
  if (typeof input !== "string") {
    return null;
  }

  if (/\r|\n/.test(input)) {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX_TEXT_LENGTH) {
    return null;
  }

  return trimmed;
}

async function listItems(): Promise<HandlerResponse> {
  const store = getItemStore();
  const { blobs } = await store.list({ prefix: "item:" });

  const resolved = await Promise.all(
    blobs.map(async ({ key }) => {
      const item = (await store.get(key, { type: "json" })) as Item | null;
      if (!item) {
        return null;
      }
      if (
        typeof item.id !== "string" ||
        typeof item.text !== "string" ||
        typeof item.createdAt !== "string"
      ) {
        return null;
      }
      return item;
    }),
  );

  const items = resolved
    .filter((item): item is Item => item !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, MAX_RESULTS);

  return toJson(200, { items });
}

async function createItem(event: HandlerEvent): Promise<HandlerResponse> {
  const store = getItemStore();
  if (!event.body) {
    return toError(400, "Request body is required.");
  }

  let payload: { text?: unknown };
  try {
    payload = JSON.parse(event.body) as { text?: unknown };
  } catch {
    return toError(400, "Invalid JSON body.");
  }

  const text = validateText(payload.text);
  if (!text) {
    return toError(
      400,
      `Text must be one line and between 1 and ${MAX_TEXT_LENGTH} characters.`,
    );
  }

  const item: Item = {
    id: crypto.randomUUID(),
    text,
    createdAt: new Date().toISOString(),
  };

  await store.setJSON(keyForItem(item.id), item);
  return toJson(201, { item });
}

async function deleteItem(event: HandlerEvent): Promise<HandlerResponse> {
  const store = getItemStore();
  const id = event.queryStringParameters?.id?.trim();
  if (!id) {
    return toError(400, "Query parameter `id` is required.");
  }

  const key = keyForItem(id);
  const existing = await store.get(key, { type: "json" });
  if (!existing) {
    return toError(404, "Item not found.");
  }

  await store.delete(key);
  return toJson(200, { deleted: true, id });
}

export const handler: Handler = async (event) => {
  try {
    connectLambda(event);

    if (event.httpMethod === "GET") {
      return await listItems();
    }

    if (event.httpMethod === "POST") {
      return await createItem(event);
    }

    if (event.httpMethod === "DELETE") {
      return await deleteItem(event);
    }

    return toError(405, "Method not allowed.");
  } catch (error) {
    console.error("items function error", error);
    return toError(500, "Internal server error.");
  }
};
