import express from "express"
import multer from "multer"
import { uploadChat } from "../controller/chat.controller.js"
const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post(
  "/upload",
  upload.single("file"),
  uploadChat
)




export default router