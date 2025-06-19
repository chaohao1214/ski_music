import { createTheme } from "@mui/material/styles";

// Create a theme instance.
const theme = createTheme({
  palette: {
    // Defines the color palette
    primary: {
      main: "#1976d2", // A standard blue color, you can change this
    },
    secondary: {
      main: "#dc004e", // A standard pink color
    },
    background: {
      default: "#f4f6f8", // A light grey background for the whole app
      paper: "#ffffff", // The background for components like Card, Paper
    },
  },
  typography: {
    // Defines font styles
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h5: {
      fontWeight: 700, // Make h5 (like our 'Sign In' title) bolder
    },
  },
  shape: {
    // Defines border radius for components
    borderRadius: 8,
  },
  // You can also override component-specific styles here
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // Buttons will not be all uppercase
          boxShadow: "none",
        },
      },
    },
  },
});

export default theme;
