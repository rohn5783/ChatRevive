import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    return NextResponse.json(
      {
        success: false,
        message: "Google Sign-In is not configured for demo. Please register or log in using your email and password.",
      },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

