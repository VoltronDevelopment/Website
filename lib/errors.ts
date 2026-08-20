export class ValidationError extends Error {
  override name = "ValidationError";
}

export function validationError(message: string): never {
  throw new ValidationError(message);
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}
