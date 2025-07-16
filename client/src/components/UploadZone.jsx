import { Box, CircularProgress, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useDispatch } from "react-redux";
import { useRef } from "react";
import { useState } from "react";
import { apiUpload } from "../utils/apiClient";
import { enqueueSnackbar } from "notistack";
import { fetchSongLibrary } from "../features/music/songLibrarySlice";
const UploadZone = () => {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files) => {
    const mp3Files = Array.from(files).filter((file) =>
      file.type.includes("audio")
    );
    if (mp3Files.length === 0) return;

    const formData = new FormData();
    mp3Files.forEach((file) => formData.append("songs", file));
    setUploading(true);

    apiUpload("/api/songs/upload", formData)
      .then((result) => {
        console.log("✅ Uploaded:", result);
        enqueueSnackbar("Songs uploaded successfully!", { variant: "success" });
        dispatch(fetchSongLibrary());
      })
      .catch((err) => {
        console.error("Upload error:", err);
        enqueueSnackbar("Failed to upload songs", { variant: "error" });
      })
      .finally(() => {
        setUploading(false);
      });
  };
  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };
  return (
    <Box
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current.click()}
      sx={{
        border: "2px dashed #aaa",
        borderRadius: 2,
        textAlign: "center",
        p: 4,
        cursor: "pointer",
        bgcolor: "#fafafa",
      }}
    >
      <CloudUploadIcon sx={{ fontSize: 48, color: "#888" }} />
      <Typography variant="body1" sx={{ mt: 2 }}>
        {" "}
        Drag & Drop MP3 files here or click to select
      </Typography>
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="caption" sx={{ ml: 1 }}>
            Uploading...
          </Typography>
        </Box>
      )}
      <input
        type="file"
        ref={inputRef}
        hidden
        multiple
        accept="audio/*"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </Box>
  );
};

export default UploadZone;
