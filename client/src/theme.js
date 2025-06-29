import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    // Set the theme mode to 'dark'
    mode: "dark",

    // Define the primary color (for buttons, highlights, etc.)
    primary: {
      main: "#94e0b2", // The bright mint green from your design
    },

    // Define background colors
    background: {
      default: "#141f18", // The very dark green/black main background
      paper: "#141f18", // Background for components like Card, Paper
    },

    // Define text colors
    text: {
      primary: "#ffffff", // Main text color (e.g., "Music App" title)
      secondary: "#9bbfaa", // Secondary text color (for links)
    },
  },

  typography: {
    fontFamily: '"Spline Sans", "Noto Sans", sans-serif',
    button: {
      textTransform: "none", // Prevent buttons from being all uppercase
      fontWeight: "bold",
    },
  },

  // Override default styles for specific components
  components: {
    // Style for all buttons
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "9999px", // Creates a fully rounded "pill" shape
          color: "#141f18", // Set button text color to the dark background color
        },
      },
    },
    // Style for all text fields
    MuiTextField: {
      styleOverrides: {
        root: {
          // Target the input element itself
          "& .MuiInputBase-root": {
            backgroundColor: "#2a4133", // The dark green background for text fields
            borderRadius: "12px", // 'rounded-xl' is approximately 12px
          },
          // Remove the default border (fieldset)
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          // Ensure border is still none on hover
          "&:hover .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          // Ensure border is still none when focused
          "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        },
      },
    },
  },
});

export default darkTheme;
