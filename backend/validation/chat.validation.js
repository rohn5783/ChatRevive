export const validateChatUpload = (req, res, next) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      message: "Chat file is required",
    });
  }

  if (
    file.mimetype !== "text/plain" &&
    !file.originalname.toLowerCase().endsWith(".txt")
  ) {
    return res.status(400).json({
      success: false,
      message: "Only .txt chat files are allowed",
    });
  }

  if (!file.buffer || file.buffer.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Uploaded file is empty",
    });
  }

  next();
};
