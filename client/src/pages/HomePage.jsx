import {
  Container,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { openLoginModal } from "../features/auth/authSlice";
import LoginModal from "../components/LoginModal";
import { useNavigate } from "react-router-dom";
import RemotePage from "./RemotePage";

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
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <Typography
        variant="h2"
        component="h1"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        Music System
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 5 }}>
        Please select your view
      </Typography>
      <Box sx={{ display: "flex", gap: 4, mb: 5 }}>
        <Button variant="contained" size="large" onClick={handleLaunchPlayer}>
          Music Player
        </Button>
        <Button variant="contained" size="large" onClick={handleOpenController}>
          Music Controller
        </Button>
      </Box>{" "}
      <Box sx={{ color: "text.secondary", maxWidth: "600px", px: 2 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          The <strong>Music Player</strong> view should be used on the device
          connected to the speakers. It listens for commands and plays music.
        </Typography>
        <Typography variant="body1">
          The <strong>Music Controller</strong> view is used to manage the
          playlist and control playback remotely.
        </Typography>
      </Box>
    </Box>
  );
};

const HomePage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    // This outer Box is the main layout container for the entire page.
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* The LoginModal is always in the DOM, ready to be opened */}
      <LoginModal />

      {/* ANNOTATION: This is the Box that acts as our centering "stage". */}
      <Box
        sx={{
          flexGrow: 1, // It grows to fill all vertical space left by the AppBar.
          display: "flex", // It uses flexbox...
          alignItems: "center", // ...to center its child vertically...
          justifyContent: "center", // ...and horizontally.
        }}
      >
        {/* The content (either guest or authenticated view) is placed here and will be centered. */}
        {isAuthenticated ? <RemotePage /> : <GuestLandingPage />}
      </Box>
    </Box>
  );
};

export default HomePage;
