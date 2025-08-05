import multer from "multer";
import path from "path";

// Allowed audio MIME types
export const allowedMimeTypes = [
  "audio/mpeg", // mp3
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/aac",
  "audio/ogg",
];

export const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only audio files are allowed!"), false);
  }
};

// Memory storage (for Supabase)
export const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
});

// Disk storage (for local upload)
export const diskUpload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      cb(null, Date.now() + "_" + file.originalname);
    },
  }),
  fileFilter,
});

export const localUploadMiddleware = diskUpload.array("songs", 10);
