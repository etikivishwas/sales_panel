const multer = require("multer");

const allowed = new Set(["image/jpeg", "image/png", "application/pdf"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
  fileFilter: (req, file, callback) => {
    if (!allowed.has(file.mimetype)) {
      return callback(new Error("Only PDF, JPG, JPEG and PNG files are allowed."));
    }
    callback(null, true);
  },
});

module.exports = upload;
