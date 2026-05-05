import { NextResponse } from "next/server";
import { storeInquiry, validateInquiry } from "@/lib/inquiries";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = validateInquiry(body);
    const inquiry = await storeInquiry(payload);

    return NextResponse.json({
      ok: true,
      inquiryId: inquiry.id,
      message: "Inquiry received. Voltron will contact you shortly."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit inquiry.";

    return NextResponse.json(
      {
        ok: false,
        message
      },
      { status: 400 }
    );
  }
}
