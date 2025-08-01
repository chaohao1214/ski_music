import { createClient } from "@supabase/supabase-js";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { query } from "../services/postgresService.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const upload = multer({ dest: "temp/" });

export const uploadMiddleware = upload.array("files", 10);

export const uploadSongToSupabase = async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const results = [];

  for (const file of files) {
    try {
      const filename = `${Date.now()}_${file.originalname}`;
      const filePath = path.resolve(file.path);

      const { error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(filename, await fs.readFile(filePath), {
          contentType: "audio/mpeg",
          upsert: false,
        });

      // delete tmp files
      await fs.unlink(filePath);

      if (error) {
        console.error(`❌ Upload failed: ${filename}`, error.message);
        results.push({ filename, status: "error", error: error.message });
        continue; // skip illeagl files
      }

      const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${
        process.env.SUPABASE_BUCKET
      }/${encodeURIComponent(filename)}`;

      await query(
        `INSERT INTO songs (title, artist, url, filename) VALUES ($1, $2, $3, $4)`,
        [file.originalname, "Unknown", publicUrl, filename]
      );

      results.push({ filename, url: publicUrl, status: "success" });
    } catch (e) {
      console.error(
        `❌ Unexpected error uploading ${file.originalname}:`,
        e.message
      );
      results.push({
        filename: file.originalname,
        status: "error",
        error: e.message,
      });
    }
  }

  return res.json({ message: "Upload completed", results });
};
