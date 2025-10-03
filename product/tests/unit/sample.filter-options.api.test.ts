import { afterAll, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { GET as getSectionOptions } from "@/app/api/filters/sections/route";
import { GET as getTokenOptions } from "@/app/api/filters/tokens/route";
import { stopMockServer } from "@/mocks/msw/node";

describe("sample filter option APIs", () => {
  it("returns token options", async () => {
    const request = new NextRequest("http://localhost/api/filters/tokens");
    const response = await getTokenOptions(request);
    const payload = await response.json();

    expect(payload).toEqual({
      items: [
        { value: "token-1", label: "コードＡ" },
        { value: "token-2", label: "コードＢ" },
        { value: "token-3", label: "コードＣ" },
        { value: "token-4", label: "コードＤ" },
        { value: "token-5", label: "コードＥ" },
      ],
    });
  });

  it("returns section options", async () => {
    const request = new NextRequest("http://localhost/api/filters/sections");
    const response = await getSectionOptions(request);
    const payload = await response.json();

    expect(payload).toEqual({
      items: [
        { value: "unit-1", label: "セクションＡ" },
        { value: "unit-2", label: "セクションＢ" },
        { value: "unit-3", label: "セクションＣ" },
        { value: "unit-4", label: "セクションＤ" },
      ],
    });
  });
});

afterAll(() => {
  stopMockServer();
});
