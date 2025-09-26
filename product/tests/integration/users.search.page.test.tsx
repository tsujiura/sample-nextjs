import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import Providers, { createTestQueryClient } from "@/app/providers";
import UsersSearchPageClient from "@/app/users/search/search-client";
import { reloadEnv } from "@/config/env";
import { startMockServer, stopMockServer } from "@/mocks/msw/node";
import { server } from "@/mocks/msw/server";

const skillOptions = [
  { value: "frontend", label: "フロントエンド" },
  { value: "backend", label: "バックエンド" },
  { value: "design", label: "デザイン" },
  { value: "management", label: "マネジメント" },
  { value: "qa", label: "QA" },
];

const departmentOptions = [
  { value: "sales", label: "営業" },
  { value: "development", label: "開発" },
  { value: "design", label: "デザイン" },
  { value: "hr", label: "人事" },
];

type CapturedRequest = {
  url: URL;
};

const capturedRequests: CapturedRequest[] = [];
let unsubscribeFromEvents: (() => void) | undefined;

describe("Users search page", () => {
  beforeAll(() => {
    startMockServer();
    const subscription = server.events.on("request:match", ({ request }) => {
      capturedRequests.push({ url: new URL(request.url) });
    });

    if (typeof subscription === "function") {
      unsubscribeFromEvents = subscription;
      return;
    }

    if (isUnsubscribable(subscription)) {
      unsubscribeFromEvents = () => subscription.unsubscribe();
    }
  });

  afterEach(() => {
    capturedRequests.length = 0;
    server.resetHandlers();
  });

  afterAll(() => {
    unsubscribeFromEvents?.();
    stopMockServer();
  });

  function renderPage() {
  const queryClient = createTestQueryClient();

  return render(
    <Providers queryClient={queryClient}>
      <UsersSearchPageClient
        skillOptions={skillOptions}
        departmentOptions={departmentOptions}
      />
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

  const skillInput = screen.getByLabelText("スキル");
  await user.click(skillInput);
  const skillOption = await screen.findByRole("option", { name: "フロントエンド" });
  await user.click(skillOption);

  const departmentSelect = screen.getByLabelText("部署");
  await user.click(departmentSelect);
  await user.click(await screen.findByRole("option", { name: "開発" }));
  await user.click(await screen.findByRole("option", { name: "デザイン" }));
  await user.keyboard("{Escape}");

  const joinedAfterInput = screen.getByLabelText("入社日 (以降)");
  fireEvent.change(joinedAfterInput, { target: { value: "2022-01-01" } });

  await user.click(screen.getByLabelText("参加日が新しい順"));

  await user.click(screen.getByLabelText("リモート勤務"));
  await user.click(screen.getByLabelText("メンター経験"));

  await user.click(screen.getByRole("button", { name: "検索" }));

  await waitFor(() => {
    expect(capturedRequests.length).toBeGreaterThan(0);
  });

  const lastRequest = capturedRequests.at(-1);

  expect(lastRequest?.url.pathname).toBe("/api/users");
  expect(lastRequest?.url.searchParams.get("q")).toBe("1");
  expect(lastRequest?.url.searchParams.getAll("skills")).toEqual(["frontend"]);
  expect(lastRequest?.url.searchParams.getAll("departments")).toEqual(["development", "design"]);
  expect(lastRequest?.url.searchParams.get("joinedAfter")).toBe("2022-01-01");
  expect(lastRequest?.url.searchParams.get("sort")).toBe("joined-desc");
  expect(lastRequest?.url.searchParams.getAll("features")).toEqual([
    "remote",
    "mentor",
  ]);

  expect(await screen.findByRole("cell", { name: "山田太郎" })).toBeTruthy();
  expect(window.location.search).toContain("q=1");
  expect(window.location.search).toContain("skills=frontend");
  expect(window.location.search).toContain("departments=development");
  expect(window.location.search).toContain("departments=design");
  });
});

function isUnsubscribable(value: unknown): value is { unsubscribe: () => void } {
  return (
    typeof value === "object" &&
    value !== null &&
    "unsubscribe" in value &&
    typeof (value as { unsubscribe: unknown }).unsubscribe === "function"
  );
}
