export interface Result<T> {
  isSuccess: boolean,
  message: string,
  statusCode: number,
  errors: Array<string>[],
  data: T
}