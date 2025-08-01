import { createClient } from "@supabase/supabase-js";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { query } from "../services/postgresService";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const upload = multer({ dest: "temp/" });

export const uploadMiddleware = upload.single("file");

export const uploadSongToSupabase = async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const filename = `${Date.now()}_${file.originalname}`;
  const filePath = path.resolve(file.path);

  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .upload(filename, await fs.readFile(filePath), {
      contentType: "audio/mpeg",
      upsert: false,
    });

  await fs.unlink(filePath);

  if (error) return res.status(500).json({ error: error.message });

  const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${
    process.env.SUPABASE_BUCKET
  }/${encodeURIComponent(filename)}`;

  await query(
    `INSERT INTO songs (title, artist, url, filename) VALUES ($1, $2, $3, $4)`,
    [file.originalname, "Unknown", publicUrl, filename]
  );

  return res.json({ message: "Uploaded", url: publicUrl });
};
