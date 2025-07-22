import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, closeLoginModal } from "../features/auth/authSlice";
import imageIcon from "../assets/undraw_happy-music_na4p.svg";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

const LoginModal = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoginModalOpen, status, error } = useSelector(
    (state) => state.auth
  );

  const handleClose = () => {
    dispatch(closeLoginModal());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      dispatch(loginUser({ username, password }))
        .unwrap()
        .then(() => {
          handleClose();
          navigate("/remote");
        })
        .catch((err) => console.error("Failed to login:", err));
    }
  };
  return (
    <Dialog
      open={isLoginModalOpen}
      onClose={handleClose}
      slotProps={{
        sx: {
          bgcolor: "background.default",
          width: "100%",
          maxWidth: "420px",
          borderRadius: 4,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", pt: 4 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: "bold" }}>
          Log In
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: 3,
              bgcolor: "#ffcf9e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
              p: 1.5,
            }}
          >
            <Box
              component="img"
              src={imageIcon}
              alt="Music Illustration"
              sx={{ width: "100%", height: "auto" }}
            />
          </Box>

          {/* Form */}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {status === "failed" && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error === "Failed to fetch"
                  ? "Cannot connect to server."
                  : error || "Invalid credentials."}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, height: 56 }}
              disabled={status === "loading"}
            >
              {status === "loading" ? <CircularProgress size={24} /> : "Log In"}
            </Button>
            <Box sx={{ textAlign: "center" }}>
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
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
