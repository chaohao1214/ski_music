import { useNavigate } from "react-router-dom";
import { Button, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const BackButton = ({ to = "/", label = "Home", sx = {} }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ position: "absolute", top: 2, left: 10 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(to)}
        sx={{
          color: "white",
          borderColor: "white",
          fontSize: { xs: "0.75rem", sm: "0.85rem" },
          padding: { xs: "4px 8px", sm: "6px 12px" },
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderColor: "white",
          },
          ...sx,
        }}
      >
        {label}
      </Button>
    </Box>
  );
};

export default BackButton;
