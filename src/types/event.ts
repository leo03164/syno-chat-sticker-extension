export type Result<T, E = string> =
  | { success: true, result: T }
  | { success: false, error: E }
