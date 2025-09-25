import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Providers, { createTestQueryClient } from "@/app/providers";
import UsersSearchPage from "@/app/users/search/page";
import { reloadEnv } from "@/config/env";
import { server } from "@/mocks/msw/server";

type CapturedRequest = {
  url: URL;
};

const capturedRequests: CapturedRequest[] = [];
let unsubscribeFromEvents: (() => void) | undefined;

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  const subscription = server.events.on("request:match", ({ request }) => {
    capturedRequests.push({ url: new URL(request.url) });
  });
  if (typeof subscription === "function") {
    unsubscribeFromEvents = subscription;
  } else if (subscription && typeof subscription === "object" && "unsubscribe" in subscription && typeof subscription.unsubscribe === "function") {
    unsubscribeFromEvents = () => subscription.unsubscribe();
  }
});

afterEach(() => {
  capturedRequests.length = 0;
  server.resetHandlers();
});

afterAll(() => {
  unsubscribeFromEvents?.();
  server.close();
});

function renderPage() {
  const queryClient = createTestQueryClient();

  return render(
    <Providers queryClient={queryClient}>
      <UsersSearchPage />
    </Providers>,
  );
}

it("searches users and reflects query state", async () => {
  process.env.APP_ENV = "local";
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://example.com";
  process.env.NEXT_PUBLIC_API_MOCK = "true";
  process.env.SERVER_CACHE_TTL_MS = "60000";
  reloadEnv("local");

  window.history.replaceState({}, "", "/users/search");

  const user = userEvent.setup();

  renderPage();

  const keywordInput = screen.getByLabelText("検索キーワード");

  await user.clear(keywordInput);
  await user.type(keywordInput, "太郎");

  await user.click(screen.getByRole("button", { name: "検索" }));

  await waitFor(() => {
    expect(capturedRequests.length).toBeGreaterThan(0);
  });

  const lastRequest = capturedRequests.at(-1);

  expect(lastRequest?.url.pathname).toBe("/api/users");
  expect(lastRequest?.url.searchParams.get("q")).toBe("太郎");

  expect(await screen.findByRole("cell", { name: "山田太郎" })).toBeTruthy();
  expect(window.location.search).toContain("q=%E5%A4%AA%E9%83%8E");
});

it("allows searching users by identifier fragments", async () => {
  process.env.APP_ENV = "local";
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://example.com";
  process.env.NEXT_PUBLIC_API_MOCK = "true";
  process.env.SERVER_CACHE_TTL_MS = "60000";
  reloadEnv("local");

  window.history.replaceState({}, "", "/users/search");

  const user = userEvent.setup();

  renderPage();

  const keywordInput = screen.getByLabelText("検索キーワード");

  await user.clear(keywordInput);
  await user.type(keywordInput, "1");

  await user.click(screen.getByRole("button", { name: "検索" }));

  await waitFor(() => {
    expect(capturedRequests.length).toBeGreaterThan(0);
  });

  const lastRequest = capturedRequests.at(-1);

  expect(lastRequest?.url.pathname).toBe("/api/users");
  expect(lastRequest?.url.searchParams.get("q")).toBe("1");

  expect(await screen.findByRole("cell", { name: "山田太郎" })).toBeTruthy();
  expect(window.location.search).toContain("q=1");
});
