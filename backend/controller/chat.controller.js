import { parseWhatsAppChat } from '../parser/whatsAppParser.js'

export const uploadChat = async (req, res) => {
  try {
    const file = req.file
    const user = req.user

    if (!file) {
      return res
      .status(400)
      .json({ message: "File required" })
    }

    if (
      user?.plan === 'free' &&
      Number(user.trialUploadsUsed ?? 0) >= Number(user.trialUploadsLimit ?? 3)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Free upload limit reached. Upgrade to continue uploading chats.',
      })
    }

    const text = file.buffer.toString('utf-8')

    const messages = parseWhatsAppChat(text, 'Your Name')

    if (user?.plan === 'free') {
      user.trialUploadsUsed = Number(user.trialUploadsUsed ?? 0) + 1
      await user.save()
    }

    res.json({
      success: true,
      fileName: file.originalname,
      messages,
      user: user
        ? {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            avatarUrl: user.avatarUrl,
            authProvider: user.authProvider,
            plan: user.plan,
            isVerified: user.isVerified,
            lastLoginAt: user.lastLoginAt,
            trialUploadsUsed: user.trialUploadsUsed,
            trialUploadsLimit: user.trialUploadsLimit,
            isTrialActive: user.isTrialActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          }
        : null,
    })
  } catch (error) {
    res.status(500).json({
      message: "Parsing failed"
    })
  }
}



