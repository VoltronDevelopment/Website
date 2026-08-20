import { NextResponse } from "next/server";
import { isValidationError } from "@/lib/errors";
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
    if (isValidationError(error)) {
      return NextResponse.json(
        {
          ok: false,
          message: error.message
        },
        { status: 400 }
      );
    }

    console.error("[api/inquiries] unexpected error", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Unable to submit inquiry. Please try again shortly."
      },
      { status: 500 }
    );
  }
}
