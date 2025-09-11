export interface FetchResponse<T> {
  hasError?: boolean;
  errorMessage: string;
  data?: T;
}
