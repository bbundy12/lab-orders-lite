import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";

// Mock fetch globally since we're testing utilities that don't need actual API calls
global.fetch = vi.fn();

// Reset mocks after each test
afterEach(() => {
  vi.resetAllMocks();
});
