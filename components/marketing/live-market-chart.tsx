"use client";

import { useEffect, useRef, useState } from "react";

import { useTheme } from "@/components/layout/theme-provider";
import { cn } from "@/lib/utils";

const chartOptions = [
  { label: "BTCUSD", symbol: "BINANCE:BTCUSDT", note: "Crypto momentum" },
  { label: "Gold", symbol: "OANDA:XAUUSD", note: "Safe-haven flow" },
  { label: "EURUSD", symbol: "FX:EURUSD", note: "FX trend" },
  { label: "NAS100", symbol: "CAPITALCOM:US100", note: "Index pulse" }
];

export function LiveMarketChart() {
  const hostRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [activeSymbol, setActiveSymbol] = useState(chartOptions[0]);

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return;
    }

    host.innerHTML = "";

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    widget.style.height = "calc(100% - 32px)";
    widget.style.width = "100%";

    const copyright = document.createElement("div");
    copyright.className = "tradingview-widget-copyright";
    copyright.innerHTML =
      '<a href="https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/" rel="noopener nofollow" target="_blank">Live market chart</a><span> by TradingView</span>';

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: activeSymbol.symbol,
      interval: "15",
      timezone: "Etc/UTC",
      theme,
      style: "1",
      locale: "en",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      withdateranges: true,
      allow_symbol_change: false,
      calendar: false,
      support_host: "https://www.tradingview.com"
    });

    widgetContainer.appendChild(widget);
    widgetContainer.appendChild(copyright);
    widgetContainer.appendChild(script);
    host.appendChild(widgetContainer);

    return () => {
      host.innerHTML = "";
    };
  }, [activeSymbol, theme]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {chartOptions.map((option) => (
          <button
            key={option.symbol}
            type="button"
            onClick={() => setActiveSymbol(option)}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition",
              activeSymbol.symbol === option.symbol
                ? "border-foreground bg-foreground text-background"
                : "border-border/70 bg-background/70 text-muted-foreground hover:border-primary/35 hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between gap-4 rounded-[22px] border border-border/60 bg-background/70 px-4 py-3 text-sm">
        <div>
          <p className="font-semibold">{activeSymbol.label}</p>
          <p className="mt-1 text-muted-foreground">{activeSymbol.note}</p>
        </div>
        <div className="rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-success">
          Live
        </div>
      </div>
      <div className="h-[420px] overflow-hidden rounded-[24px] border border-border/60 bg-background/80">
        <div ref={hostRef} className="h-full w-full" />
      </div>
    </div>
  );
}
