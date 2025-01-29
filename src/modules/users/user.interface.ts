export interface EventPayload<T> {
  sourceDeviceId: string;
  lastUpdatedAt: string;
  payload: T;
}
