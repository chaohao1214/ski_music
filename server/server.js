import express, { json } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || "3001";

app.use(cors());
app.use(express.json());

app.get("/api/playlist", (req, res) => {
  const dummyPlaylist = [
    { id: 1, title: "First Dance (ESM Version)", duration: 185, url: "..." },
    { id: 2, title: "Skating Dream (ESM Version)", duration: 210, url: "..." },
  ];
  res.json(dummyPlaylist);
});

app.listen(PORT, () => {
  console.log(`🚀 Server with ES Modules running on http://localhost:${PORT}`);
});
