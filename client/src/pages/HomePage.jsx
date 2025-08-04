import { Typography, Box, Button, Stack } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { openLoginModal } from "../features/auth/authSlice";
import LoginModal from "../components/LoginModal";
import { useNavigate } from "react-router-dom";
import RemotePage from "./RemotePage";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import TuneIcon from "@mui/icons-material/Tune";

const GuestLandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLaunchPlayer = () => {
    navigate("/player");
  };

  const handleOpenController = () => {
    dispatch(openLoginModal());
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      {/* Left side brand area */}
      <Box
        sx={{
          width: "30%",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          px: 6,
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
          Music System
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.8 }}>
          Control and play music seamlessly across devices
        </Typography>
      </Box>

      {/* right side entry */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          px: 6,
        }}
      >
        <Stack spacing={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={<MusicNoteIcon />}
            onClick={handleLaunchPlayer}
            sx={{
              bgcolor: "#334155",
              color: "#f1f5f9",
              borderRadius: "20px",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              textTransform: "none",
              "&:hover": {
                bgcolor: "#475569",
              },
            }}
          >
            Music Player
          </Button>

          <Button
            variant="contained"
            size="large"
            startIcon={<TuneIcon />}
            onClick={handleOpenController}
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              borderRadius: "9999px",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              textTransform: "none",
              "&:hover": {
                bgcolor: "primary.dark",
              },
            }}
          >
            Music Controller
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

const HomePage = () => {
  const { isAuthenticated, status } = useSelector((state) => state.auth);

  if (status === "loading") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Checking authentication...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <LoginModal />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isAuthenticated ? <RemotePage /> : <GuestLandingPage />}
      </Box>
    </Box>
  );
};

export default HomePage;
