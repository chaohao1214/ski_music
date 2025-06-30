import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { Container, Typography } from "@mui/material";

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4 }}>
        Welcome, {user.username}
      </Typography>
      <Typography>Your role is: {user.role}</Typography>
      <Button variant="contained" onClick={handleLogout} sx={{ mt: 2 }}>
        Logout
      </Button>
    </Container>
  );
};

export default DashboardPage;
