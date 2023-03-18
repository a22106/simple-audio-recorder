const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, "dist"))); // Serve Vue.js static assets

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // save audio file to the server
    cb(null, path.join(__dirname, "dist/audio"));
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.post("/api/save-audio", upload.single("audio"), (req, res) => {
  res.json({ message: "Audio file saved successfully" });
});

// Catch-all route to serve the Vue.js app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
