import Link from "next/link";
import { Button, Stack, Typography } from "@mui/material";

export default function Home() {
  return (
    <Stack component="main" spacing={4} sx={{ p: { xs: 3, md: 6 } }}>
      <Typography component="h1" variant="h4">
        サンプルアプリケーション
      </Typography>
      <Typography color="text.secondary">
        TanStack Query と MUI を使った検索デモです。
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button component={Link} href="/sample/search" variant="contained">
          サンプル検索
        </Button>
      </Stack>
    </Stack>
  );
}
