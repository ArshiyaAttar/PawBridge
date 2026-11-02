import multer from "multer";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const getImageContentType = (buffer) => {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    )
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new Error("Upload a JPEG, PNG, or WebP photo."));
      return;
    }

    callback(null, true);
  },
});

export const uploadPetPhoto = (req, res, next) => {
  upload.single("photo")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      res.status(status).json({
        success: false,
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "Photo must be 5 MB or smaller."
            : "Only one pet photo can be uploaded.",
      });
      return;
    }

    if (error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    if (req.file) {
      const contentType = getImageContentType(req.file.buffer);
      if (!contentType) {
        res.status(400).json({
          success: false,
          message: "The uploaded file is not a valid JPEG, PNG, or WebP image.",
        });
        return;
      }

      req.file.mimetype = contentType;
    }

    next();
  });
};
