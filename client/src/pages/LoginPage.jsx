import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, clearError } from "../features/authSlice";

// MUI Components
import {
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Link,
  AppBar,
  Toolbar,
  Container,
} from "@mui/material";
import imageIcon from "../assets/undraw_happy-music_na4p.svg";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate("/");
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      dispatch(loginUser({ username, password }))
        .unwrap()
        .then(() => navigate("/"))
        .catch((err) => console.error("Failed to login:", err));
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, textAlign: "center", fontWeight: "bold" }}
          >
            Music App
          </Typography>
        </Toolbar>
      </AppBar>

      {/* --- Main Content --- */}
      <Container component="main" maxWidth="xs" sx={{ mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: 4,
              bgcolor: "#ffcf9e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 4,
            }}
          >
            <Box
              component="img"
              src={imageIcon}
              sx={{
                width: "100%",
                height: "auto",
              }}
            />
          </Box>

          {/* --- Form --- */}
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              placeholder="Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {status === "failed" && (
              <Alert severity="error" sx={{ mt: 2, bgcolor: "error.dark" }}>
                {error || "Invalid credentials"}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary" // This will now be the mint green color from the theme
              sx={{ mt: 3, mb: 2, height: 56 }}
              disabled={status === "loading"}
            >
              {status === "loading" ? <CircularProgress size={24} /> : "Log In"}
            </Button>

            {/* --- Links --- */}
            <Box sx={{ textAlign: "center" }}>
              <Link
                href="#"
                variant="body2"
                underline="always"
                color="text.secondary"
              >
                Don't have an account? Sign Up
              </Link>
            </Box>
            <Box sx={{ textAlign: "center", mt: 1 }}>
              <Link
                href="#"
                variant="body2"
                underline="always"
                color="text.secondary"
              >
                Forgot Password?
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
