interface ApiErrorEnvelope {
  readonly error?: {
    readonly code?: string;
    readonly details?: unknown;
    readonly message?: string;
  };
}

interface ApiSuccessEnvelope<TData> {
  readonly data: TData;
}

export type { ApiErrorEnvelope, ApiSuccessEnvelope };
