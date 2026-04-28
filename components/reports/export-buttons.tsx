"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Files } from "lucide-react";

import { Button } from "@/components/ui/button";

function getDownloadFilename(contentDisposition: string | null, fallback: string) {
  if (!contentDisposition) {
    return fallback;
  }

  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);

  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]);
  }

  const match = contentDisposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] || fallback;
}

export function ExportButtons({ type }: { type: "weekly" | "monthly" }) {
  const [status, setStatus] = useState("");
  const [downloadingFormat, setDownloadingFormat] = useState<"pdf" | "word" | "excel" | null>(null);

  async function handleDownload(format: "pdf" | "word" | "excel") {
    try {
      setDownloadingFormat(format);
      setStatus("");

      const response = await fetch(`/api/reports/${type}?format=${format}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store"
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorPayload?.error || "Unable to download report right now.");
      }

      const blob = await response.blob();
      const fallbackName = `${type}-report.${format === "excel" ? "xlsx" : format === "word" ? "doc" : "pdf"}`;
      const fileName = getDownloadFilename(response.headers.get("content-disposition"), fallbackName);
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);

      setStatus(`${fileName} downloaded successfully.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to download report right now.");
    } finally {
      setDownloadingFormat(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleDownload("pdf")}
          disabled={downloadingFormat !== null}
        >
          <FileText className="h-4 w-4" />
          {downloadingFormat === "pdf" ? "Preparing PDF..." : "Export PDF"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleDownload("word")}
          disabled={downloadingFormat !== null}
        >
          <Files className="h-4 w-4" />
          {downloadingFormat === "word" ? "Preparing Word..." : "Export Word"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleDownload("excel")}
          disabled={downloadingFormat !== null}
        >
          <FileSpreadsheet className="h-4 w-4" />
          {downloadingFormat === "excel" ? "Preparing Excel..." : "Export Excel"}
        </Button>
      </div>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
    </div>
  );
}
