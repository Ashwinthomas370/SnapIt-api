const express = require("express");
const multer = require("multer");
const path = require("path");
const Tesseract = require("tesseract.js");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const originalFileName = file.originalname;
    const uploadPath = path.join(__dirname, "uploads", originalFileName);

    if (fs.existsSync(uploadPath)) {
      const fileExt = path.extname(originalFileName);
      const fileNameWithoutExt = path.basename(originalFileName, fileExt);

      let num = 1;
      let newFileName = `${fileNameWithoutExt}-${num}${fileExt}`;
      let newPath = path.join(__dirname, "uploads", newFileName);

      while (fs.existsSync(newPath)) {
        num += 1;
        newFileName = `${fileNameWithoutExt}-${num}${fileExt}`;
        newPath = path.join(__dirname, "uploads", newFileName);
      }

      cb(null, newFileName);
    } else {
      cb(null, originalFileName);
    }
  },
});

const upload = multer({ storage });

app.listen(PORT, () => {
  console.log(`Server started successfully at port: ${PORT}`);
});

app.post("/api/uploads", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  async function uploadFile(req, res) {
    try {
      const imagePath = path.join(__dirname, "uploads", req.file.filename);

      const {
        data: { text },
      } = await Tesseract.recognize(imagePath, "eng", {
        logger: (m) => console.log(m),
      });

      res.json({ text });
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ error: "Error processing image" });
    }
  }

  uploadFile(req, res);
});
