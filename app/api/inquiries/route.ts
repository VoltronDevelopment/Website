import {withinRequestWindow} from "@/lib/request-window";
import { NextResponse } from "next/server";
import { isValidationError } from "@/lib/errors";
import { storeInquiry, validateInquiry } from "@/lib/inquiries";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Request body must be valid JSON."
      },
      { status: 400 }
    );
  }

  try {
    const payload = validateInquiry(body);
    if (!await withinRequestWindow(request,"inquiry",10)) return NextResponse.json({ok:false,message:"Too many requests. Please try again in a minute."},{status:429,headers:{"Retry-After":"60"}});
    const inquiry = await storeInquiry(payload);

    return NextResponse.json({
      ok: true,
      inquiryId: inquiry.id,
      message: "Thank you. Your inquiry has been received. We will review the details and contact you about the next step."
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
