import express from "express"
import multer from "multer"
import { uploadChat } from "../controller/chat.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"
import { validateChatUpload } from "../validation/index.js"
const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post(
  "/upload",
  protectRoute,
  upload.single("file"),
  validateChatUpload,
  uploadChat
)




export default router
