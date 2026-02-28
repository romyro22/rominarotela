/** Successful API response. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

/** Error API response. */
export interface ApiError {
  success: false;
  error: { code: string; message: string };
}

/** Union API response type. */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
