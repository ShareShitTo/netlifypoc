import type {
  ApiErrorResponse,
  DeleteFileResponse,
  FileMeta,
  ListFilesResponse,
  UploadFileResponse,
} from "@/types/files";

const FILES_ENDPOINT = "/.netlify/functions/files";
const DOWNLOAD_ENDPOINT = "/.netlify/functions/file-download";

async function parseJson<T>(
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

function pickError(
  payload: ApiErrorResponse | Record<string, unknown> | null,
  fallback: string,
) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const candidate = payload.error;
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return fallback;
}

export async function listFiles() {
  const response = await fetch(FILES_ENDPOINT, {
    method: "GET",
    headers: { accept: "application/json" },
  });

  const payload = await parseJson<ListFilesResponse>(response);
  if (!response.ok) {
    throw new Error(
      pickError(
        payload as ApiErrorResponse | Record<string, unknown> | null,
        "Unable to fetch files.",
      ),
    );
  }

  if (!payload || !("files" in payload) || !Array.isArray(payload.files)) {
    throw new Error("Unexpected list files response.");
  }

  return payload.files;
}

export async function uploadFile(file: File): Promise<FileMeta> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(FILES_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  const payload = await parseJson<UploadFileResponse>(response);
  if (!response.ok) {
    throw new Error(
      pickError(
        payload as ApiErrorResponse | Record<string, unknown> | null,
        "Unable to upload file.",
      ),
    );
  }

  if (!payload || !("file" in payload) || !payload.file) {
    throw new Error("Unexpected upload response.");
  }

  return payload.file;
}

export async function deleteFile(id: string) {
  const response = await fetch(
    `${FILES_ENDPOINT}?id=${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: { accept: "application/json" },
    },
  );

  const payload = await parseJson<DeleteFileResponse>(response);
  if (!response.ok) {
    throw new Error(
      pickError(
        payload as ApiErrorResponse | Record<string, unknown> | null,
        "Unable to delete file.",
      ),
    );
  }

  if (!payload || !("deleted" in payload) || payload.deleted !== true) {
    throw new Error("Unexpected delete response.");
  }

  return payload;
}

export function getDownloadUrl(id: string) {
  return `${DOWNLOAD_ENDPOINT}?id=${encodeURIComponent(id)}`;
}
