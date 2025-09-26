import React from "react";
import { render, screen } from "@testing-library/react";

import { UsersSearchResultsTable, type UserRow } from "@/components/organisms/users-search";

describe("UsersSearchResultsTable", () => {
  const departmentLookup = (value: string) => (value === "development" ? "開発" : value);
  const employmentLookup = (value: string) => (value === "full-time" ? "正社員" : value);

  it("shows loading state", () => {
    render(
      <UsersSearchResultsTable
        users={[]}
        departmentLabelLookup={departmentLookup}
        employmentLabelLookup={employmentLookup}
        isLoading
        showPrompt={false}
      />,
    );

    expect(screen.getByText("検索中...")).toBeInTheDocument();
  });

  it("renders results", () => {
    const users: UserRow[] = [
      {
        id: "1",
        name: "山田太郎",
        email: "taro@example.com",
        department: "development",
        employment: "full-time",
        joinedAt: "2023-05-10",
      },
    ];

    render(
      <UsersSearchResultsTable
        users={users}
        departmentLabelLookup={departmentLookup}
        employmentLabelLookup={employmentLookup}
        isLoading={false}
        showPrompt={false}
      />,
    );

    expect(screen.getByRole("cell", { name: "山田太郎" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "開発" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "正社員" })).toBeInTheDocument();
  });
});