import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const axiosRequestMock = vi.hoisted(() => vi.fn());

vi.mock("@/api-client/axios-instance", () => ({
  axiosInstance: axiosRequestMock,
}));

import SamplePageClient from "@/app/sample/search/search-client";

describe("SamplePageClient", () => {
  const tokenOptions = [
    { value: "token-1", label: "コードＡ" },
    { value: "token-2", label: "コードＢ" },
  ];

  const sectionOptions = [
    { value: "unit-1", label: "セクションＡ" },
    { value: "unit-2", label: "セクションＢ" },
  ];

  function renderComponent() {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <SamplePageClient
          tokenOptions={tokenOptions}
          sectionOptions={sectionOptions}
        />
      </QueryClientProvider>,
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/sample/search");
  });

  it("prompts user to enter filters before searching", () => {
    renderComponent();

    expect(screen.getByText("サンプルメッセージ")).not.toBeNull();
    expect(axiosRequestMock).not.toHaveBeenCalled();
  });

  it("submits selected filters and requests data", async () => {
    const user = userEvent.setup();
    const mockedResponse = {
      data: {
        items: [
          {
            id: "foo-1",
            name: "サンプルＡ",
            email: "foo@example.test",
            segment: "unit-1",
            employment: "type-alpha",
            joinedAt: "2023-05-10",
          },
        ],
      },
    };

    axiosRequestMock.mockResolvedValueOnce(mockedResponse);

    renderComponent();

    await user.type(screen.getByLabelText("項目１"), "太郎");

    const skillAutocomplete = screen.getByLabelText("項目２");
    await user.click(skillAutocomplete);
    const skillOption = await screen.findByRole("option", { name: "コードＡ" });
    await user.click(skillOption);

    await user.click(screen.getByLabelText("項目３"));
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
      expect(axiosRequestMock).toHaveBeenCalledTimes(1);
    });

    expect(axiosRequestMock).toHaveBeenCalledWith({
      url: "/api/fizz",
      method: "GET",
      params: {
        q: "太郎",
        tokens: ["token-1"],
        sections: ["unit-1", "unit-2"],
        joinedAfter: "2022-01-01",
        sort: "joined-desc",
        features: ["flag-1", "flag-2"],
      },
    });

    await screen.findByRole("cell", { name: "サンプルＡ" });

    const search = window.location.search;
    expect(search).toContain("q=%E5%A4%AA%E9%83%8E");
    expect(search).toContain("tokens=token-1");
    expect(search).toContain("sections=unit-1");
    expect(search).toContain("sections=unit-2");
    expect(search).toContain("joinedAfter=2022-01-01");
  });
});
