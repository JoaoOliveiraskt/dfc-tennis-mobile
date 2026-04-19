class ApiError extends Error {
  readonly code?: string;
  readonly details?: unknown;
  readonly status: number;

  constructor(params: {
    readonly code?: string;
    readonly details?: unknown;
    readonly message: string;
    readonly status: number;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.code = params.code;
    this.details = params.details;
    this.status = params.status;
  }
}

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function toApiError(
  error: unknown,
  fallbackMessage = "Não foi possível concluir a requisição.",
): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError({
      message: error.message || fallbackMessage,
      status: 0,
    });
  }

  return new ApiError({
    message: fallbackMessage,
    status: 0,
  });
}

export { ApiError, isApiError, toApiError };
