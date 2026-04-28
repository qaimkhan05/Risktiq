import PDFDocument from "pdfkit";
import * as XLSX from "xlsx";
import { format } from "date-fns";

import { getUserWorkspace } from "@/lib/dashboard-data";
import { formatCurrency } from "@/lib/utils";

type ReportRow = {
  label: string;
  value: string;
};

function ensureRows(rows: ReportRow[], emptyLabel = "Status", emptyValue = "No data available for this section yet.") {
  return rows.length ? rows : [{ label: emptyLabel, value: emptyValue }];
}

function createPdfBuffer(
  title: string,
  sections: Array<{ heading: string; rows: Array<{ label: string; value: string }> }>
) {
  return new Promise<Buffer>((resolve) => {
    const document = new PDFDocument({ margin: 48 });
    const chunks: Buffer[] = [];

    document.on("data", (chunk) => chunks.push(chunk as Buffer));
    document.on("end", () => resolve(Buffer.concat(chunks)));

    document.fontSize(24).text(title);
    document.moveDown();

    for (const section of sections) {
      document.fontSize(16).text(section.heading);
      document.moveDown(0.5);
      for (const row of section.rows) {
        document.fontSize(11).text(`${row.label}: ${row.value}`);
      }
      document.moveDown();
    }

    document.end();
  });
}

function createExcelBuffer(sheets: Array<{ name: string; rows: Array<Record<string, string | number>> }>) {
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const worksheet = XLSX.utils.json_to_sheet(sheet.rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  }

  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createWordBuffer(
  title: string,
  sections: Array<{ heading: string; rows: Array<{ label: string; value: string }> }>
) {
  const html = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(title)}</title>
      <style>
        body { font-family: Arial, sans-serif; color: #0f172a; padding: 24px; line-height: 1.5; }
        h1 { font-size: 26px; margin-bottom: 24px; }
        h2 { font-size: 18px; margin-top: 24px; margin-bottom: 10px; color: #0f766e; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th, td { border: 1px solid #dbe4f0; padding: 10px; text-align: left; vertical-align: top; }
        th { background: #f3f8ff; width: 28%; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      ${sections
        .map(
          (section) => `
            <section>
              <h2>${escapeHtml(section.heading)}</h2>
              <table>
                <tbody>
                  ${ensureRows(section.rows)
                    .map(
                      (row) => `
                        <tr>
                          <th>${escapeHtml(row.label)}</th>
                          <td>${escapeHtml(row.value)}</td>
                        </tr>
                      `
                    )
                    .join("")}
                </tbody>
              </table>
            </section>
          `
        )
        .join("")}
    </body>
  </html>`;

  return Buffer.from(html, "utf8");
}

export async function buildWeeklyReportExport(userId: string) {
  const { profile, snapshot } = await getUserWorkspace(userId);
  const week = snapshot.weeklyReport;
  const generatedAt = format(new Date(), "dd MMM yyyy HH:mm");
  const sections = [
    {
      heading: "Overview",
      rows: [
        { label: "Trader", value: profile?.fullName || "N/A" },
        { label: "Generated At", value: generatedAt },
        { label: "Total Trades", value: String(week.totalTrades) },
        { label: "Weekly P&L", value: formatCurrency(week.weeklyPnl) },
        { label: "Rule Violations", value: String(week.ruleViolations) },
        { label: "Overtrading Days", value: String(week.overtradingDays) },
        { label: "Emotional Trading Count", value: String(week.emotionalTradingCount) }
      ]
    },
    {
      heading: "Strategy Performance",
      rows: ensureRows(
        week.strategyPerformance.map((strategy) => ({
          label: strategy.strategy,
          value: `${formatCurrency(strategy.profit)} | ${strategy.winRate}% win | ${strategy.totalTrades} trade(s)`
        })),
        "Strategy",
        "No weekly strategy data available yet."
      )
    }
  ] satisfies Array<{ heading: string; rows: ReportRow[] }>;
  const pdf = await createPdfBuffer("Risktiq Weekly Report", sections);

  return {
    pdf,
    word: createWordBuffer("Risktiq Weekly Report", sections),
    excel: createExcelBuffer([
      {
        name: "Weekly Summary",
        rows: [
          {
            Trader: profile?.fullName || "N/A",
            GeneratedAt: generatedAt,
            TotalTrades: week.totalTrades,
            WeeklyPnL: week.weeklyPnl,
            RuleViolations: week.ruleViolations,
            OvertradingDays: week.overtradingDays,
            EmotionalTradingCount: week.emotionalTradingCount
          }
        ]
      },
      {
        name: "Strategies",
        rows:
          week.strategyPerformance.length > 0
            ? week.strategyPerformance.map((strategy) => ({
                Strategy: strategy.strategy,
                Profit: strategy.profit,
                WinRate: strategy.winRate,
                TotalTrades: strategy.totalTrades
              }))
            : [{ Strategy: "No data", Profit: 0, WinRate: 0, TotalTrades: 0 }]
      }
    ])
  };
}

export async function buildMonthlyReportExport(userId: string) {
  const { profile, snapshot } = await getUserWorkspace(userId);
  const month = snapshot.monthlyReport;
  const generatedAt = format(new Date(), "dd MMM yyyy HH:mm");
  const sections = [
    {
      heading: "Overview",
      rows: [
        { label: "Trader", value: profile?.fullName || "N/A" },
        { label: "Generated At", value: generatedAt },
        { label: "Total Trades", value: String(month.totalTrades) },
        { label: "Monthly P&L", value: formatCurrency(month.monthlyPnl) },
        { label: "Discipline Score", value: String(month.disciplineScore) },
        { label: "Best Strategy", value: month.bestStrategy?.strategy || "N/A" },
        { label: "Worst Strategy", value: month.worstStrategy?.strategy || "N/A" }
      ]
    },
    {
      heading: "Top Trades",
      rows: ensureRows(
        month.topTrades.map((trade) => ({
          label: `${trade.assetName} (${trade.strategyUsed})`,
          value: `${formatCurrency(trade.pnlAmount)} | ${format(trade.tradeDate, "dd MMM yyyy")}`
        })),
        "Trades",
        "No monthly winning trades available yet."
      )
    },
    {
      heading: "Biggest Mistakes",
      rows: ensureRows(
        month.biggestMistakes.map((trade) => ({
          label: `${trade.assetName} (${trade.strategyUsed})`,
          value: trade.mistakeMade || "No note"
        })),
        "Mistakes",
        "No monthly mistake notes available yet."
      )
    }
  ] satisfies Array<{ heading: string; rows: ReportRow[] }>;
  const pdf = await createPdfBuffer("Risktiq Monthly Report", sections);

  return {
    pdf,
    word: createWordBuffer("Risktiq Monthly Report", sections),
    excel: createExcelBuffer([
      {
        name: "Monthly Summary",
        rows: [
          {
            Trader: profile?.fullName || "N/A",
            GeneratedAt: generatedAt,
            TotalTrades: month.totalTrades,
            MonthlyPnL: month.monthlyPnl,
            DisciplineScore: month.disciplineScore,
            BestStrategy: month.bestStrategy?.strategy || "N/A",
            WorstStrategy: month.worstStrategy?.strategy || "N/A"
          }
        ]
      },
      {
        name: "Top Trades",
        rows:
          month.topTrades.length > 0
            ? month.topTrades.map((trade) => ({
                Asset: trade.assetName,
                Strategy: trade.strategyUsed,
                PnL: trade.pnlAmount,
                Date: format(trade.tradeDate, "yyyy-MM-dd"),
                EmotionalBefore: trade.emotionalBefore,
                EmotionalAfter: trade.emotionalAfter
              }))
            : [{ Asset: "No data", Strategy: "-", PnL: 0, Date: "-", EmotionalBefore: "-", EmotionalAfter: "-" }]
      },
      {
        name: "Mistakes",
        rows:
          month.biggestMistakes.length > 0
            ? month.biggestMistakes.map((trade) => ({
                Asset: trade.assetName,
                Strategy: trade.strategyUsed,
                Mistake: trade.mistakeMade || "",
                Lesson: trade.lessonsLearned || ""
              }))
            : [{ Asset: "No data", Strategy: "-", Mistake: "-", Lesson: "-" }]
      }
    ])
  };
}
