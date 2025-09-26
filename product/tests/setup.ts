import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

const subscribers = new Set<() => void>();
let currentUrl = new URL(window.location.href);
let currentSearchParams = new URLSearchParams(window.location.search);

function notifySubscribers() {
  subscribers.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  subscribers.add(listener);

  return () => {
    subscribers.delete(listener);
  };
}

function updateHistory(url: string) {
  const nextUrl = url.startsWith("http") ? new URL(url) : new URL(url, window.location.origin);

  window.history.replaceState({}, "", nextUrl);
  currentUrl = new URL(window.location.href);
  currentSearchParams = new URLSearchParams(window.location.search);
  notifySubscribers();
}

vi.mock("next/navigation", () => {
  return {
    useRouter: () => ({
      push: (url: string) => updateHistory(url),
      replace: (url: string) => updateHistory(url),
      prefetch: vi.fn().mockResolvedValue(undefined),
      refresh: vi.fn(),
    }),
    usePathname: () => React.useSyncExternalStore(subscribe, () => currentUrl.pathname),
    useSearchParams: () =>
      React.useSyncExternalStore(
        subscribe,
        () => currentSearchParams,
      ),
  };
});

afterEach(() => {
  cleanup();
});
