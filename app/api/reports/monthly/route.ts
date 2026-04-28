import { NextResponse } from "next/server";

import { getApiUser } from "@/lib/auth/api-user";
import { buildMonthlyReportExport } from "@/lib/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getApiUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const format = url.searchParams.get("format");
    const report = await buildMonthlyReportExport(user.id);

    if (format === "excel") {
      return new NextResponse(Uint8Array.from(report.excel), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="monthly-report.xlsx"',
          "Cache-Control": "no-store"
        }
      });
    }

    if (format === "word") {
      return new NextResponse(Uint8Array.from(report.word), {
        headers: {
          "Content-Type": "application/msword; charset=utf-8",
          "Content-Disposition": 'attachment; filename="monthly-report.doc"',
          "Cache-Control": "no-store"
        }
      });
    }

    return new NextResponse(Uint8Array.from(report.pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="monthly-report.pdf"',
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to export monthly report." },
      { status: 500 }
    );
  }
}
