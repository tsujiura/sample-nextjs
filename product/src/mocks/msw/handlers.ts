import { http, HttpResponse } from "msw";

import { ENV } from "@/config/env";

type User = {
  id: string;
  name: string;
  email: string;
};

const USERS_FIXTURE: User[] = [
  {
    id: "1",
    name: "山田太郎",
    email: "taro@example.com",
  },
  {
    id: "2",
    name: "鈴木花子",
    email: "hanako@example.com",
  },
  {
    id: "3",
    name: "佐藤次郎",
    email: "jiro@example.com",
  },
];

const usersEndpoint = new URL("/api/users", ENV.apiBaseUrl).toString();

export const handlers = [
  http.get(usersEndpoint, ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get("q") ?? "";
    const normalizedKeyword = keyword.trim();
    const normalizedKeywordLower = normalizedKeyword.toLowerCase();

    const users = normalizedKeyword
      ? USERS_FIXTURE.filter((user) => {
          const emailLower = user.email.toLowerCase();

          return (
            user.name.includes(normalizedKeyword) ||
            user.id.includes(normalizedKeyword) ||
            emailLower.includes(normalizedKeywordLower)
          );
        })
      : USERS_FIXTURE;

    return HttpResponse.json({ users });
  }),
];
