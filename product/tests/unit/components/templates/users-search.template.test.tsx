import React from "react";
import { render, screen } from "@testing-library/react";

import { UsersSearchTemplate } from "@/components/templates/users-search";

describe("UsersSearchTemplate", () => {
  it("renders title, description, filters and results", () => {
    render(
      <UsersSearchTemplate
        title="検索"
        description="説明"
        filters={<div data-testid="filters" />}
        results={<div data-testid="results" />}
      />,
    );

    expect(screen.getByRole("heading", { name: "検索" })).toBeInTheDocument();
    expect(screen.getByText("説明")).toBeInTheDocument();
    expect(screen.getByTestId("filters")).toBeInTheDocument();
    expect(screen.getByTestId("results")).toBeInTheDocument();
  });
});