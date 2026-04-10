import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ 
      message: "HeronPulse Academic OS API",
      version: "1.0.0",
      status: "operational"
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}