import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("=== TEST WEBHOOK RECEIVED ===");
    console.log("Headers:", Object.fromEntries(request.headers.entries()));
    
    const payload = await request.json();
    console.log("Payload:", JSON.stringify(payload, null, 2));
    
    return NextResponse.json({ 
      message: "Webhook received successfully",
      timestamp: new Date().toISOString(),
      payload 
    });
  } catch (error) {
    console.error("Test webhook error:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Test webhook endpoint is active" });
}