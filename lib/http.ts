import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  errors: ValidationError[];
}

/**
 * Creates a consistent 400 error response for Zod validation failures
 */
export function validationErrorResponse(error: ZodError): NextResponse<ErrorResponse> {
  const errors: ValidationError[] = error.errors.map((e) => ({
    field: e.path.join("."),
    message: e.message,
  }));

  return NextResponse.json({ errors }, { status: 400 });
}

/**
 * Creates a consistent error response for server errors
 */
export function serverErrorResponse(message: string = "Internal server error"): NextResponse {
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Creates a consistent not found response
 */
export function notFoundResponse(message: string = "Resource not found"): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

/**
 * Creates a consistent success response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}
