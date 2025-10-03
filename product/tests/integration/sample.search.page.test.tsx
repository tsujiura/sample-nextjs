import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import Providers, { createTestQueryClient } from "@/app/providers";
import SamplePageClient from "@/app/sample/search/search-client";
import { reloadEnv } from "@/config/env";
import { startMockServer, stopMockServer } from "@/mocks/msw/node";
import { server } from "@/mocks/msw/server";

const tokenOptions = [
  { value: "token-1", label: "コードＡ" },
  { value: "token-2", label: "コードＢ" },
  { value: "token-3", label: "コードＣ" },
  { value: "token-4", label: "コードＤ" },
  { value: "token-5", label: "コードＥ" },
];

const sectionOptions = [
  { value: "unit-1", label: "セクションＡ" },
  { value: "unit-2", label: "セクションＢ" },
  { value: "unit-3", label: "セクションＣ" },
  { value: "unit-4", label: "セクションＤ" },
];

type CapturedRequest = {
  url: URL;
};

const capturedRequests: CapturedRequest[] = [];
let unsubscribeFromEvents: (() => void) | undefined;

describe("Sample search page", () => {
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
      <SamplePageClient
        tokenOptions={tokenOptions}
        sectionOptions={sectionOptions}
      />
    </Providers>,
  );
  }

  it("searches samples and reflects query state", async () => {
  process.env.APP_ENV = "local";
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://example.com";
  process.env.NEXT_PUBLIC_API_MOCK = "true";
  process.env.SERVER_CACHE_TTL_MS = "60000";
  reloadEnv("local");

  window.history.replaceState({}, "", "/sample/search");

  const user = userEvent.setup();

  renderPage();

  const keywordInput = screen.getByLabelText("項目１");

  await user.clear(keywordInput);
  await user.type(keywordInput, "foo");

  await user.click(screen.getByRole("button", { name: "実行" }));

  await waitFor(() => {
    expect(capturedRequests.length).toBeGreaterThan(0);
  });

  const lastRequest = capturedRequests.at(-1);

  expect(lastRequest?.url.pathname).toBe("/api/fizz");
  expect(lastRequest?.url.searchParams.get("q")).toBe("foo");

  expect(await screen.findByRole("cell", { name: "サンプルＡ" })).toBeTruthy();
  expect(window.location.search).toContain("q=foo");
  });

  it("allows searching samples by identifier fragments", async () => {
  process.env.APP_ENV = "local";
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://example.com";
  process.env.NEXT_PUBLIC_API_MOCK = "true";
  process.env.SERVER_CACHE_TTL_MS = "60000";
  reloadEnv("local");

  window.history.replaceState({}, "", "/sample/search");

  const user = userEvent.setup();

  renderPage();

  const keywordInput = screen.getByLabelText("項目１");

  await user.clear(keywordInput);
  await user.type(keywordInput, "1");

  const skillInput = screen.getByLabelText("項目２");
  await user.click(skillInput);
  const skillOption = await screen.findByRole("option", { name: "コードＡ" });
  await user.click(skillOption);

  const departmentSelect = screen.getByLabelText("項目３");
  await user.click(departmentSelect);
  await user.click(await screen.findByRole("option", { name: "セクションＡ" }));
  await user.click(await screen.findByRole("option", { name: "セクションＢ" }));
  await user.keyboard("{Escape}");

  const joinedAfterInput = screen.getByLabelText("項目４");
  fireEvent.change(joinedAfterInput, { target: { value: "2022-01-01" } });

  await user.click(screen.getByLabelText("サンプル１"));

  await user.click(screen.getByLabelText("チェックボックス１"));
  await user.click(screen.getByLabelText("チェックボックス２"));

  await user.click(screen.getByRole("button", { name: "実行" }));

  await waitFor(() => {
    expect(capturedRequests.length).toBeGreaterThan(0);
  });

  const lastRequest = capturedRequests.at(-1);

  expect(lastRequest?.url.pathname).toBe("/api/fizz");
  expect(lastRequest?.url.searchParams.get("q")).toBe("1");
  expect(lastRequest?.url.searchParams.getAll("tokens")).toEqual(["token-1"]);
  expect(lastRequest?.url.searchParams.getAll("sections")).toEqual(["unit-1", "unit-2"]);
  expect(lastRequest?.url.searchParams.get("joinedAfter")).toBe("2022-01-01");
  expect(lastRequest?.url.searchParams.get("sort")).toBe("joined-desc");
  expect(lastRequest?.url.searchParams.getAll("features")).toEqual([
    "flag-1",
    "flag-2",
  ]);

  expect(await screen.findByRole("cell", { name: "サンプルＡ" })).toBeTruthy();
  expect(window.location.search).toContain("q=1");
  expect(window.location.search).toContain("tokens=token-1");
  expect(window.location.search).toContain("sections=unit-1");
  expect(window.location.search).toContain("sections=unit-2");
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
