import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: ["var(--font-geist-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"].join(","),
  },
});

export default theme;
