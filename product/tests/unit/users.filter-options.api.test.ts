import { afterAll, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { GET as getDepartmentOptions } from "@/app/api/filters/departments/route";
import { GET as getSkillOptions } from "@/app/api/filters/skills/route";
import { stopMockServer } from "@/mocks/msw/node";

describe("users filter option APIs", () => {
  it("returns skill options", async () => {
    const request = new NextRequest("http://localhost/api/filters/skills");
    const response = await getSkillOptions(request);
    const payload = await response.json();

    expect(payload).toEqual({
      items: [
        { value: "frontend", label: "フロントエンド" },
        { value: "backend", label: "バックエンド" },
        { value: "design", label: "デザイン" },
        { value: "management", label: "マネジメント" },
        { value: "qa", label: "QA" },
      ],
    });
  });

  it("returns department options", async () => {
    const request = new NextRequest("http://localhost/api/filters/departments");
    const response = await getDepartmentOptions(request);
    const payload = await response.json();

    expect(payload).toEqual({
      items: [
        { value: "sales", label: "営業" },
        { value: "development", label: "開発" },
        { value: "design", label: "デザイン" },
        { value: "hr", label: "人事" },
      ],
    });
  });
});

afterAll(() => {
  stopMockServer();
});
