import {
  Container,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { logout, openLoginModal } from "../features/auth/authSlice";
import { useEffect, useState } from "react";
import LoginModal from "../components/LoginModal";

import { useNavigate } from "react-router-dom";
import ControlInterface from "../components/ControlInterface";

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
    <Container
      maxWidth="md"
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
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
      <Box sx={{ display: "flex", gap: 4 }}>
        <Button variant="contained" size="large" onClick={handleLaunchPlayer}>
          Player Client
        </Button>
        <Button variant="contained" size="large" onClick={handleOpenController}>
          Control Interface
        </Button>
      </Box>{" "}
      <Box sx={{ mt: 4, color: "text.secondary", maxWidth: "500px" }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          The **Player Client** view should be used on the device connected to
          the speakers. It listens for commands and plays music.
        </Typography>
        <Typography variant="body1">
          The **Control Interface** view is used to manage the playlist and
          control playback remotely.
        </Typography>
      </Box>
    </Container>
  );
};

const HomePage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    // This outer Box is the main layout container for the entire page.
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, textAlign: "center" }}
          >
            Music App
          </Typography>
        </Toolbar>
      </AppBar>

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
        {isAuthenticated ? <ControlInterface /> : <GuestLandingPage />}
      </Box>
    </Box>
  );
};

export default HomePage;
