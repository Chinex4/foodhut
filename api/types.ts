export type ApiTagError = {
  _tag: string;
  message?: string;
};

export type PaginationMeta = {
  page: number;
  per_page: number;
  total: number;
};

export type Paginated<T> = {
  items: T[];
  meta: PaginationMeta;
};

export type BooleanFromString = "true" | "false";

export type EmptyMessage = Record<string, never> | [];
