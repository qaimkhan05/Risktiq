import { NextResponse } from "next/server";

import { getApiUser } from "@/lib/auth/api-user";
import { uploadTradeScreenshot } from "@/lib/storage/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getApiUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const uploadUrl = await uploadTradeScreenshot(file);

    return NextResponse.json({
      url: uploadUrl
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload screenshot." },
      { status: 400 }
    );
  }
}
