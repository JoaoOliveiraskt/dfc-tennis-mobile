import { AUTH_BASE_URL, authClient } from "@/lib/auth";
import { ApiError } from "@/lib/api/errors";
import type { ApiErrorEnvelope, ApiSuccessEnvelope } from "@/lib/api/types";

interface ApiRequestOptions extends Omit<RequestInit, "body" | "headers"> {
  readonly authenticated?: boolean;
  readonly body?: BodyInit | FormData | Record<string, unknown> | undefined;
  readonly headers?: HeadersInit;
  readonly path: string;
  readonly query?: Record<string, boolean | number | string | undefined>;
}

function buildUrl(
  path: string,
  query?: Record<string, boolean | number | string | undefined>,
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${AUTH_BASE_URL}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === "") {
        continue;
      }

      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

function isRecordBody(
  body: ApiRequestOptions["body"],
): body is Record<string, unknown> {
  return typeof body === "object" && body !== null && !(body instanceof FormData);
}

async function requestJson<TData>({
  authenticated = true,
  body,
  headers,
  method = "GET",
  path,
  query,
  ...rest
}: ApiRequestOptions): Promise<TData> {
  const finalHeaders = new Headers(headers);

  if (authenticated) {
    const cookie = authClient.getCookie();
    if (cookie) {
      finalHeaders.set("cookie", cookie);
    }
  }

  let resolvedBody: BodyInit | FormData | undefined;
  if (body instanceof FormData) {
    resolvedBody = body;
  } else if (isRecordBody(body)) {
    finalHeaders.set("Content-Type", "application/json");
    resolvedBody = JSON.stringify(body);
  } else {
    resolvedBody = body;
  }

  const response = await fetch(buildUrl(path, query), {
    ...rest,
    body: resolvedBody,
    headers: finalHeaders,
    method,
  });

  const payload = (await response
    .json()
    .catch(() => null)) as ApiErrorEnvelope | ApiSuccessEnvelope<TData> | null;

  if (!response.ok) {
    throw new ApiError({
      code: payload && "error" in payload ? payload.error?.code : undefined,
      details: payload && "error" in payload ? payload.error?.details : undefined,
      message:
        payload && "error" in payload
          ? payload.error?.message ?? "Erro inesperado na API."
          : "Erro inesperado na API.",
      status: response.status,
    });
  }

  if (payload && "data" in payload) {
    return payload.data;
  }

  return payload as TData;
}

export { requestJson };
export type { ApiRequestOptions };
