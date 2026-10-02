import { QueryFailedError } from 'typeorm';

export const UNIQUE_VIOLATION = '23505';
export const CHECK_VIOLATION = '23514';
export const EXCLUSION_VIOLATION = '23P01';

export function getPostgresErrorCode(error: unknown): string | undefined {
  if (error instanceof QueryFailedError) {
    const driverError = error.driverError as { code?: string };
    return driverError.code;
  }
  return undefined;
}