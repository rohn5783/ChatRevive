import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  persistParsedChatUpload,
  processChatUpload,
} from "@/lib/chatUpload";
import { connectDB } from "@/lib/db";

export async function POST(request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await processChatUpload({
      user,
      fileName: file.name,
      fileContent: buffer,
      persist: persistParsedChatUpload,
    });

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("Chat upload failed:", error);
    return NextResponse.json(
      { success: false, message: "Chat parsing failed", error: error.message },
      { status: 500 }
    );
  }
}
