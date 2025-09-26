import React from "react";
import { render } from "@testing-library/react";

import Heading from "@/components/atoms/Heading";

describe("Heading", () => {
  it("renders with default props", () => {
    const { getByRole } = render(<Heading>タイトル</Heading>);

    expect(getByRole("heading", { name: "タイトル" })).toBeInTheDocument();
  });
});