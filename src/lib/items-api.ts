import type {
  ApiErrorResponse,
  CreateItemRequest,
  CreateItemResponse,
  DeleteItemResponse,
  Item,
  ListItemsResponse,
} from "@/types/items";

const ITEMS_ENDPOINT = "/.netlify/functions/items";

async function parseResponse<T>(
  response: Response,
): Promise<T | ApiErrorResponse | null> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T | ApiErrorResponse;
  } catch {
    return null;
  }
}

function getErrorMessage(
  payload: ApiErrorResponse | Record<string, unknown> | null,
  fallback: string,
) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const message = payload.error;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return fallback;
}

export async function listItems(): Promise<Item[]> {
  const response = await fetch(ITEMS_ENDPOINT, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  const payload = await parseResponse<ListItemsResponse>(response);
  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        payload as ApiErrorResponse | Record<string, unknown> | null,
        "Unable to fetch items.",
      ),
    );
  }

  if (!payload || !("items" in payload) || !Array.isArray(payload.items)) {
    throw new Error("Unexpected response while listing items.");
  }

  return payload.items;
}

export async function createItem(input: CreateItemRequest): Promise<Item> {
  const response = await fetch(ITEMS_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = await parseResponse<CreateItemResponse>(response);
  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        payload as ApiErrorResponse | Record<string, unknown> | null,
        "Unable to create item.",
      ),
    );
  }

  if (!payload || !("item" in payload) || !payload.item) {
    throw new Error("Unexpected response while creating item.");
  }

  return payload.item;
}

export async function deleteItem(id: string): Promise<DeleteItemResponse> {
  const response = await fetch(
    `${ITEMS_ENDPOINT}?id=${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: {
        accept: "application/json",
      },
    },
  );

  const payload = await parseResponse<DeleteItemResponse>(response);
  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        payload as ApiErrorResponse | Record<string, unknown> | null,
        "Unable to delete item.",
      ),
    );
  }

  if (!payload || !("deleted" in payload) || payload.deleted !== true) {
    throw new Error("Unexpected response while deleting item.");
  }

  return payload;
}
