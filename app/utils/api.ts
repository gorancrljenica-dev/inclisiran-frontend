/**
 * Base URL for all backend API calls.
 * In production: set NEXT_PUBLIC_API_URL to Render backend URL.
 * In development: falls back to localhost:3000.
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
