import {
  Typography,
  Box,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { openLoginModal } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import TuneIcon from "@mui/icons-material/Tune";

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleLaunchPlayer = () => {
    navigate("/player");
  };

  const handleOpenController = () => {
    dispatch(openLoginModal());
  };

  return (
    <Box
      sx={{
        flexDirection: isSmallScreen ? "column" : "row",
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
          width: isSmallScreen ? "100%" : "30%",
          bgcolor: theme.palette.background.paper,
          borderRight: isSmallScreen
            ? "none"
            : `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: isSmallScreen ? "center" : "flex-start",
          px: isSmallScreen ? 3 : 6,
          py: isSmallScreen ? 4 : 0,
          textAlign: isSmallScreen ? "center" : "left",
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
          alignItems: isSmallScreen ? "center" : "flex-start",
          px: isSmallScreen ? 3 : 6,
          py: isSmallScreen ? 4 : 0,
        }}
      >
        <Stack spacing={2} sx={{ width: isSmallScreen ? "100%" : "auto" }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<MusicNoteIcon />}
            onClick={handleLaunchPlayer}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              borderRadius: "20px",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              textTransform: "none",
              width: isSmallScreen ? "100%" : "auto",
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
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
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              borderRadius: "20px",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              textTransform: "none",
              width: isSmallScreen ? "100%" : "auto",
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
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

export default HomePage;
