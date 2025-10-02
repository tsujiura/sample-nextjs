import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: [
      "Arial",
      "メイリオ",
      "Meiryo",
      "Hiragino Kaku Gothic ProN",
      "ヒラギノ角ゴ ProN W3",
      "sans-serif",
    ].join(","),
  },
});

export default theme;
