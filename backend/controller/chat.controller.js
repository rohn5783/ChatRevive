import { parseWhatsAppChat } from '../parser/whatsAppParser.js'

export const uploadChat = async (req, res) => {
  try {
    const file = req.file

    if (!file) {
      return res
      .status(400)
      .json({ message: "File required" })
    }

    const text = file.buffer.toString('utf-8')

    const messages = parseWhatsAppChat(text, 'Your Name')

    res.json({
      success: true,
      fileName: file.originalname,
      messages
    })
  } catch (error) {
    res.status(500).json({
      message: "Parsing failed"
    })
  }
}



