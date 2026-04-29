import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/risktiq-ui/button";
import { Field } from "@/components/risktiq-ui/field";
import { Input } from "@/components/risktiq-ui/input";
import { Select } from "@/components/risktiq-ui/select";

const tradingStyles = ["Scalping", "Intraday", "Swing", "Forex", "Crypto", "Stocks", "Indices", "Options"];

type ProfileValue = {
  fullName: string;
  tradingStyle: string;
  dailyTradeLimit: number;
  weeklyTradeLimit: number;
  monthlyProfitTarget: number;
  monthlyLossLimit: number;
  preferredStrategies: string[];
  riskPerTrade: number;
};

export function ProfileForm({ initialValue }: { initialValue?: Partial<ProfileValue> }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    fullName: initialValue?.fullName || "",
    tradingStyle: initialValue?.tradingStyle || "Intraday",
    dailyTradeLimit: String(initialValue?.dailyTradeLimit ?? 3),
    weeklyTradeLimit: String(initialValue?.weeklyTradeLimit ?? 15),
    monthlyProfitTarget: String(initialValue?.monthlyProfitTarget ?? 5000),
    monthlyLossLimit: String(initialValue?.monthlyLossLimit ?? 2000),
    preferredStrategies: initialValue?.preferredStrategies?.join(", ") || "",
    riskPerTrade: String(initialValue?.riskPerTrade ?? 1),
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="grid gap-5 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setStatus("");
        const response = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
        const result = (await response.json()) as { error?: string; message?: string };
        setLoading(false);
        setStatus(result.error || result.message || "Profile updated.");
        if (response.ok) {
          queryClient.invalidateQueries({ queryKey: ["dashboard-workspace"] });
        }
      }}
    >
      <Field label="Full Name">
        <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Muhammad Ahsan" required />
      </Field>
      <Field label="Trading Style">
        <Select value={form.tradingStyle} onChange={(e) => setForm({ ...form, tradingStyle: e.target.value })}>
          {tradingStyles.map((style) => (
            <option key={style} value={style}>{style}</option>
          ))}
        </Select>
      </Field>
      <Field label="Daily Trade Limit">
        <Input type="number" min="1" value={form.dailyTradeLimit} onChange={(e) => setForm({ ...form, dailyTradeLimit: e.target.value })} required />
      </Field>
      <Field label="Weekly Trade Limit">
        <Input type="number" min="1" value={form.weeklyTradeLimit} onChange={(e) => setForm({ ...form, weeklyTradeLimit: e.target.value })} required />
      </Field>
      <Field label="Monthly Profit Target (USD)">
        <Input type="number" step="0.01" value={form.monthlyProfitTarget} onChange={(e) => setForm({ ...form, monthlyProfitTarget: e.target.value })} required />
      </Field>
      <Field label="Monthly Loss Limit (USD)">
        <Input type="number" step="0.01" value={form.monthlyLossLimit} onChange={(e) => setForm({ ...form, monthlyLossLimit: e.target.value })} required />
      </Field>
      <Field label="Preferred Strategies List" className="md:col-span-2" hint="Comma-separated list">
        <Input value={form.preferredStrategies} onChange={(e) => setForm({ ...form, preferredStrategies: e.target.value })} placeholder="London Breakout, VWAP Reclaim, Range Reversal" />
      </Field>
      <Field label="Risk Per Trade (%)">
        <Input type="number" step="0.1" value={form.riskPerTrade} onChange={(e) => setForm({ ...form, riskPerTrade: e.target.value })} required />
      </Field>
      <div className="md:col-span-2 flex flex-col gap-3">
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
        <Button type="submit" className="w-full md:w-fit" disabled={loading}>
          {loading ? "Saving profile..." : "Save profile settings"}
        </Button>
      </div>
    </form>
  );
}
