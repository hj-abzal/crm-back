export interface EventPayload<T> {
  sourceUserId: number;
  lastUpdatedAt: string;
  payload: T;
}
