import { useState } from "react";
import { Upload } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/risktiq-ui/button";
import { Field } from "@/components/risktiq-ui/field";
import { Input } from "@/components/risktiq-ui/input";
import { Select } from "@/components/risktiq-ui/select";
import { Textarea } from "@/components/risktiq-ui/textarea";

const emotions = ["calm", "confident", "fearful", "anxious", "fomo", "angry", "disciplined", "revenge"];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function TradeForm({
  strategySuggestions,
  defaultTradeLimit,
}: {
  strategySuggestions: string[];
  defaultTradeLimit?: number;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    tradeDate: new Date().toISOString().slice(0, 10),
    tradeTime: new Date().toTimeString().slice(0, 5),
    assetName: "",
    direction: "BUY",
    quantity: "1",
    entryPrice: "",
    exitPrice: "",
    stopLoss: "",
    takeProfit: "",
    strategyUsed: strategySuggestions[0] || "",
    screenshotUrl: "",
    emotionalBefore: "calm",
    emotionalAfter: "disciplined",
    mistakeMade: "",
    lessonsLearned: "",
    tradeNotes: "",
  });
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const numericEntry = Number(form.entryPrice || 0);
  const numericExit = Number(form.exitPrice || 0);
  const numericQuantity = Number(form.quantity || 0);
  const numericStop = Number(form.stopLoss || 0);
  const numericTarget = Number(form.takeProfit || 0);
  const pnlPreview =
    form.direction === "BUY"
      ? (numericExit - numericEntry) * numericQuantity
      : (numericEntry - numericExit) * numericQuantity;
  const riskPreview = form.direction === "BUY" ? numericEntry - numericStop : numericStop - numericEntry;
  const rewardPreview = form.direction === "BUY" ? numericTarget - numericEntry : numericEntry - numericTarget;
  const rrPreview = riskPreview > 0 ? rewardPreview / riskPreview : 0;

  return (
    <form
      className="grid gap-5 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        setStatus("");
        const response = await fetch("/api/trades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
        const result = (await response.json()) as { error?: string; message?: string };
        setSaving(false);
        setStatus(result.error || result.message || "Trade saved.");
        if (response.ok) {
          setForm({
            ...form,
            assetName: "",
            entryPrice: "",
            exitPrice: "",
            stopLoss: "",
            takeProfit: "",
            screenshotUrl: "",
            mistakeMade: "",
            lessonsLearned: "",
            tradeNotes: "",
          });
          queryClient.invalidateQueries({ queryKey: ["dashboard-workspace"] });
          queryClient.invalidateQueries({ queryKey: ["trades"] });
        }
      }}
    >
      <Field label="Trade Date">
        <Input type="date" value={form.tradeDate} onChange={(e) => setForm({ ...form, tradeDate: e.target.value })} required />
      </Field>
      <Field label="Trade Time">
        <Input type="time" value={form.tradeTime} onChange={(e) => setForm({ ...form, tradeTime: e.target.value })} required />
      </Field>
      <Field label="Asset Name">
        <Input value={form.assetName} onChange={(e) => setForm({ ...form, assetName: e.target.value })} placeholder="BTCUSD, Gold, EURUSD, NASDAQ" required />
      </Field>
      <Field label="Trade Type">
        <Select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })}>
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
        </Select>
      </Field>
      <Field label="Lot Size / Quantity">
        <Input type="number" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
      </Field>
      <Field label="Strategy Used">
        <Input list="strategy-list" value={form.strategyUsed} onChange={(e) => setForm({ ...form, strategyUsed: e.target.value })} placeholder="Strategy name" required />
        <datalist id="strategy-list">
          {strategySuggestions.map((strategy) => (
            <option key={strategy} value={strategy} />
          ))}
        </datalist>
      </Field>
      <Field label="Entry Price">
        <Input type="number" step="0.0001" value={form.entryPrice} onChange={(e) => setForm({ ...form, entryPrice: e.target.value })} required />
      </Field>
      <Field label="Exit Price">
        <Input type="number" step="0.0001" value={form.exitPrice} onChange={(e) => setForm({ ...form, exitPrice: e.target.value })} required />
      </Field>
      <Field label="Stop Loss">
        <Input type="number" step="0.0001" value={form.stopLoss} onChange={(e) => setForm({ ...form, stopLoss: e.target.value })} required />
      </Field>
      <Field label="Take Profit">
        <Input type="number" step="0.0001" value={form.takeProfit} onChange={(e) => setForm({ ...form, takeProfit: e.target.value })} required />
      </Field>
      <Field label="Emotional State Before Trade">
        <Select value={form.emotionalBefore} onChange={(e) => setForm({ ...form, emotionalBefore: e.target.value })}>
          {emotions.map((emotion) => (
            <option key={emotion} value={emotion}>{emotion}</option>
          ))}
        </Select>
      </Field>
      <Field label="Emotional State After Trade">
        <Select value={form.emotionalAfter} onChange={(e) => setForm({ ...form, emotionalAfter: e.target.value })}>
          {emotions.map((emotion) => (
            <option key={emotion} value={emotion}>{emotion}</option>
          ))}
        </Select>
      </Field>
      <Field label="Trade Setup Screenshot Upload" className="md:col-span-2">
        <div className="grid gap-4 rounded-[24px] border border-dashed border-border/70 bg-background/50 p-4">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
            <Upload className="h-4 w-4" />
            <span>{uploading ? "Uploading screenshot..." : "Choose screenshot file"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  setUploading(true);
                  const fileDataUrl = await readFileAsDataUrl(file);
                  const response = await fetch("/api/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ fileDataUrl, fileName: file.name }),
                  });
                  const result = (await response.json()) as { error?: string; url?: string };
                  if (!response.ok || !result.url) {
                    setStatus(result.error || "Screenshot upload failed.");
                    return;
                  }
                  setForm({ ...form, screenshotUrl: result.url });
                } catch (err) {
                  setStatus(err instanceof Error ? err.message : "Screenshot upload failed.");
                } finally {
                  setUploading(false);
                }
              }}
            />
          </label>
          {form.screenshotUrl ? (
            <div className="overflow-hidden rounded-[22px] border border-border/60">
              <img src={form.screenshotUrl} alt="Trade setup screenshot" className="h-52 w-full object-cover" />
            </div>
          ) : null}
        </div>
      </Field>
      <Field label="Mistake Made" className="md:col-span-2">
        <Textarea value={form.mistakeMade} onChange={(e) => setForm({ ...form, mistakeMade: e.target.value })} placeholder="Describe the mistake, if any" />
      </Field>
      <Field label="Lessons Learned" className="md:col-span-2">
        <Textarea value={form.lessonsLearned} onChange={(e) => setForm({ ...form, lessonsLearned: e.target.value })} placeholder="Document what this trade taught you" />
      </Field>
      <Field label="Trade Notes" className="md:col-span-2">
        <Textarea value={form.tradeNotes} onChange={(e) => setForm({ ...form, tradeNotes: e.target.value })} placeholder="Execution notes, context, market conditions" />
      </Field>
      <div className="md:col-span-2 grid gap-4 lg:grid-cols-3">
        <div className="rounded-[24px] border border-border/60 bg-background/70 p-4">
          <p className="text-sm text-muted-foreground">Auto P&amp;L</p>
          <p className={`mt-2 text-2xl font-semibold ${pnlPreview >= 0 ? "text-success" : "text-danger"}`}>{pnlPreview.toFixed(2)}</p>
        </div>
        <div className="rounded-[24px] border border-border/60 bg-background/70 p-4">
          <p className="text-sm text-muted-foreground">Risk Reward Ratio</p>
          <p className="mt-2 text-2xl font-semibold">{rrPreview > 0 ? rrPreview.toFixed(2) : "0.00"}</p>
        </div>
        <div className="rounded-[24px] border border-border/60 bg-background/70 p-4">
          <p className="text-sm text-muted-foreground">Daily Limit Reminder</p>
          <p className="mt-2 text-2xl font-semibold">{defaultTradeLimit ?? 0} trades</p>
        </div>
      </div>
      <div className="md:col-span-2 flex flex-col gap-3">
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
        <Button type="submit" className="w-full md:w-fit" disabled={saving || uploading}>
          {saving ? "Saving trade..." : "Add trade to journal"}
        </Button>
      </div>
    </form>
  );
}
