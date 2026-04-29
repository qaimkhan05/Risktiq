import { useEffect, useRef } from "react";
import { useTheme } from "@/components/layout/theme-provider";

export function TickerTapeWidget() {
  const hostRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.innerHTML = "";

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";

    const copyright = document.createElement("div");
    copyright.className = "tradingview-widget-copyright";
    copyright.innerHTML =
      '<a href="https://www.tradingview.com/widget-docs/widgets/tickers/ticker-tape/" rel="noopener nofollow" target="_blank">Market tape</a><span> by TradingView</span>';

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "BINANCE:BTCUSDT", title: "Bitcoin" },
        { proName: "BINANCE:ETHUSDT", title: "Ethereum" },
        { proName: "FOREXCOM:XAUUSD", title: "Gold" },
        { proName: "FX:EURUSD", title: "EUR/USD" },
        { proName: "CAPITALCOM:US100", title: "US 100" },
        { proName: "OANDA:SPX500USD", title: "S&P 500" },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: theme,
      locale: "en",
    });

    widgetContainer.appendChild(widget);
    widgetContainer.appendChild(copyright);
    widgetContainer.appendChild(script);
    host.appendChild(widgetContainer);

    return () => {
      host.innerHTML = "";
    };
  }, [theme]);

  return <div ref={hostRef} className="w-full" />;
}
