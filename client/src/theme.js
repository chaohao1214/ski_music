// theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#94e0b2", // Mint green
      contrastText: "#141f18", // Dark green text
    },
    background: {
      default: "#141f18", // Main background
      paper: "rgba(20, 31, 24, 0.95)", // Slightly transparent dark green
    },
    text: {
      primary: "#ffffff",
      secondary: "#c8d6c5",
    },
    custom: {
      inputBg: "#2a4133",
      highlight: "rgba(148, 224, 178, 0.15)",
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: "none",
          padding: "10px 24px",
          "&.MuiButton-containedPrimary": {
            backgroundColor: "#94e0b2",
            color: "#141f18",
            "&:hover": {
              backgroundColor: "#82cfa1",
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(20, 31, 24, 0.95)",
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: "#2a4133",
          borderRadius: 8,
          "& input": {
            color: "#fff",
          },
        },
      },
    },
  },
});

export default theme;
