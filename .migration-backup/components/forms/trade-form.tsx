"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const emotions = ["calm", "confident", "fearful", "anxious", "fomo", "angry", "disciplined", "revenge"];

export function TradeForm({
  strategySuggestions,
  defaultTradeLimit
}: {
  strategySuggestions: string[];
  defaultTradeLimit?: number;
}) {
  const router = useRouter();
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
    tradeNotes: ""
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
  const riskPreview =
    form.direction === "BUY" ? numericEntry - numericStop : numericStop - numericEntry;
  const rewardPreview =
    form.direction === "BUY" ? numericTarget - numericEntry : numericEntry - numericTarget;
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
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
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
            tradeNotes: ""
          });
          router.refresh();
        }
      }}
    >
      <Field label="Trade Date">
        <Input
          type="date"
          value={form.tradeDate}
          onChange={(event) => setForm({ ...form, tradeDate: event.target.value })}
          required
        />
      </Field>
      <Field label="Trade Time">
        <Input
          type="time"
          value={form.tradeTime}
          onChange={(event) => setForm({ ...form, tradeTime: event.target.value })}
          required
        />
      </Field>
      <Field label="Asset Name">
        <Input
          value={form.assetName}
          onChange={(event) => setForm({ ...form, assetName: event.target.value })}
          placeholder="BTCUSD, Gold, EURUSD, NASDAQ"
          required
        />
      </Field>
      <Field label="Trade Type">
        <Select value={form.direction} onChange={(event) => setForm({ ...form, direction: event.target.value })}>
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
        </Select>
      </Field>
      <Field label="Lot Size / Quantity">
        <Input
          type="number"
          step="0.01"
          value={form.quantity}
          onChange={(event) => setForm({ ...form, quantity: event.target.value })}
          required
        />
      </Field>
      <Field label="Strategy Used">
        <Input
          list="strategy-list"
          value={form.strategyUsed}
          onChange={(event) => setForm({ ...form, strategyUsed: event.target.value })}
          placeholder="Strategy name"
          required
        />
        <datalist id="strategy-list">
          {strategySuggestions.map((strategy) => (
            <option key={strategy} value={strategy} />
          ))}
        </datalist>
      </Field>
      <Field label="Entry Price">
        <Input
          type="number"
          step="0.0001"
          value={form.entryPrice}
          onChange={(event) => setForm({ ...form, entryPrice: event.target.value })}
          required
        />
      </Field>
      <Field label="Exit Price">
        <Input
          type="number"
          step="0.0001"
          value={form.exitPrice}
          onChange={(event) => setForm({ ...form, exitPrice: event.target.value })}
          required
        />
      </Field>
      <Field label="Stop Loss">
        <Input
          type="number"
          step="0.0001"
          value={form.stopLoss}
          onChange={(event) => setForm({ ...form, stopLoss: event.target.value })}
          required
        />
      </Field>
      <Field label="Take Profit">
        <Input
          type="number"
          step="0.0001"
          value={form.takeProfit}
          onChange={(event) => setForm({ ...form, takeProfit: event.target.value })}
          required
        />
      </Field>
      <Field label="Emotional State Before Trade">
        <Select
          value={form.emotionalBefore}
          onChange={(event) => setForm({ ...form, emotionalBefore: event.target.value })}
        >
          {emotions.map((emotion) => (
            <option key={emotion} value={emotion}>
              {emotion}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Emotional State After Trade">
        <Select
          value={form.emotionalAfter}
          onChange={(event) => setForm({ ...form, emotionalAfter: event.target.value })}
        >
          {emotions.map((emotion) => (
            <option key={emotion} value={emotion}>
              {emotion}
            </option>
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
                if (!file) {
                  return;
                }

                const payload = new FormData();
                payload.append("file", file);
                setUploading(true);

                const response = await fetch("/api/upload", {
                  method: "POST",
                  body: payload
                });

                const result = (await response.json()) as { error?: string; url?: string };
                setUploading(false);

                if (!response.ok || !result.url) {
                  setStatus(result.error || "Screenshot upload failed.");
                  return;
                }

                setForm({ ...form, screenshotUrl: result.url });
              }}
            />
          </label>
          {form.screenshotUrl ? (
            <div className="overflow-hidden rounded-[22px] border border-border/60">
              <Image
                src={form.screenshotUrl}
                alt="Trade setup screenshot"
                width={1200}
                height={700}
                unoptimized
                className="h-52 w-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </Field>
      <Field label="Mistake Made" className="md:col-span-2">
        <Textarea
          value={form.mistakeMade}
          onChange={(event) => setForm({ ...form, mistakeMade: event.target.value })}
          placeholder="Describe the mistake, if any"
        />
      </Field>
      <Field label="Lessons Learned" className="md:col-span-2">
        <Textarea
          value={form.lessonsLearned}
          onChange={(event) => setForm({ ...form, lessonsLearned: event.target.value })}
          placeholder="Document what this trade taught you"
        />
      </Field>
      <Field label="Trade Notes" className="md:col-span-2">
        <Textarea
          value={form.tradeNotes}
          onChange={(event) => setForm({ ...form, tradeNotes: event.target.value })}
          placeholder="Execution notes, context, market conditions"
        />
      </Field>
      <div className="md:col-span-2 grid gap-4 lg:grid-cols-3">
        <div className="rounded-[24px] border border-border/60 bg-background/70 p-4">
          <p className="text-sm text-muted-foreground">Auto P&amp;L</p>
          <p className={`mt-2 text-2xl font-semibold ${pnlPreview >= 0 ? "text-success" : "text-danger"}`}>
            {pnlPreview.toFixed(2)}
          </p>
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
