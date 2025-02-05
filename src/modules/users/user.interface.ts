export interface EventPayload<T> {
  lastUpdatedAt: string | null;
  payload: T;
}
