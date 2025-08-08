import { Box } from "@mui/material";
import { Link } from "react-router-dom";

const SwitchModeLink = ({ isRegisterMode, onToggle }) => {
  const linkText = isRegisterMode
    ? "Already have an account? Log In"
    : "Don't have an account? Register";

  return (
    <Box sx={{ textAlign: "center", mt: 2 }}>
      <Link
        onClick={(e) => {
          e.preventDefault();
          onToggle();
        }}
        variant="body2"
        underline="always"
        color="text.secondary"
      >
        {linkText}
      </Link>
    </Box>
  );
};

export default SwitchModeLink;
