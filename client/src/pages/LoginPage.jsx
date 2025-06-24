import {
  Card,
  Container,
  Box,
  Typography,
  TextField,
  Alert,
  Button,
  Grid,
  CssBaseline,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { clearError, loginUser } from "../features/authSlice";
const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
    dispatch(clearError());
  }, [isAuthenticated]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      dispatch(loginUser({ username, password }))
        .unwrap()
        .then(() => {
          navigate("/");
        })
        .catch((err) => {
          console.error("Failed to login:", err);
        });
    }
  };
  return (
    <Container component="main" sx={{ height: "100vh" }}>
      <CssBaseline />
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundColor: (t) => t.palette.grey[50],
          backgroundRepeat: "no-repeat",
        }}
      ></Grid>
    </Container>
  );
};

export default LoginPage;
