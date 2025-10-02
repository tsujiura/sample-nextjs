import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const axiosRequestMock = vi.hoisted(() => vi.fn());

vi.mock("@/api-client/axios-instance", () => ({
  axiosInstance: axiosRequestMock,
}));

import UsersSearchPageClient from "@/app/users/search/search-client";

describe("UsersSearchPageClient", () => {
  const skillOptions = [
    { value: "frontend", label: "フロントエンド" },
    { value: "backend", label: "バックエンド" },
  ];

  const departmentOptions = [
    { value: "development", label: "開発" },
    { value: "design", label: "デザイン" },
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
        <UsersSearchPageClient
          skillOptions={skillOptions}
          departmentOptions={departmentOptions}
        />
      </QueryClientProvider>,
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/users/search");
  });

  it("prompts user to enter filters before searching", () => {
    renderComponent();

    expect(screen.getByText("条件を入力して検索してください。")).not.toBeNull();
    expect(axiosRequestMock).not.toHaveBeenCalled();
  });

  it("submits selected filters and requests users", async () => {
    const user = userEvent.setup();
    const mockedResponse = {
      data: {
        users: [
          {
            id: "1",
            name: "山田太郎",
            email: "taro@example.com",
            department: "development",
            employment: "full-time",
            joinedAt: "2023-05-10",
          },
        ],
      },
    };

    axiosRequestMock.mockResolvedValueOnce(mockedResponse);

    renderComponent();

    await user.type(screen.getByLabelText("検索キーワード"), "太郎");

    const skillAutocomplete = screen.getByLabelText("スキル");
    await user.click(skillAutocomplete);
    const skillOption = await screen.findByRole("option", { name: "フロントエンド" });
    await user.click(skillOption);

    await user.click(screen.getByLabelText("部署"));
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
      expect(axiosRequestMock).toHaveBeenCalledTimes(1);
    });

    expect(axiosRequestMock).toHaveBeenCalledWith({
      url: "/api/users",
      method: "GET",
      params: {
        q: "太郎",
        skills: ["frontend"],
        departments: ["development", "design"],
        joinedAfter: "2022-01-01",
        sort: "joined-desc",
        features: ["remote", "mentor"],
      },
    });

    await screen.findByRole("cell", { name: "山田太郎" });

    const search = window.location.search;
    expect(search).toContain("q=%E5%A4%AA%E9%83%8E");
    expect(search).toContain("skills=frontend");
    expect(search).toContain("departments=development");
    expect(search).toContain("departments=design");
    expect(search).toContain("joinedAfter=2022-01-01");
  });
});
