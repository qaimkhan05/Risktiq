"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function GoalForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    targetValue: "10",
    currentValue: "0",
    status: "ACTIVE",
    dueDate: ""
  });
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <form
      className="grid gap-5 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        setStatus("");

        const response = await fetch("/api/goals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        });

        const result = (await response.json()) as { error?: string; message?: string };
        setSaving(false);
        setStatus(result.error || result.message || "Goal saved.");

        if (response.ok) {
          setForm({
            title: "",
            description: "",
            targetValue: "10",
            currentValue: "0",
            status: "ACTIVE",
            dueDate: ""
          });
          router.refresh();
        }
      }}
    >
      <Field label="Goal Title">
        <Input
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          placeholder="Reach 80% rule adherence"
          required
        />
      </Field>
      <Field label="Target Value">
        <Input
          type="number"
          step="0.01"
          value={form.targetValue}
          onChange={(event) => setForm({ ...form, targetValue: event.target.value })}
          required
        />
      </Field>
      <Field label="Current Value">
        <Input
          type="number"
          step="0.01"
          value={form.currentValue}
          onChange={(event) => setForm({ ...form, currentValue: event.target.value })}
        />
      </Field>
      <Field label="Status">
        <Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="MISSED">Missed</option>
        </Select>
      </Field>
      <Field label="Due Date">
        <Input
          type="date"
          value={form.dueDate}
          onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
        />
      </Field>
      <Field label="Description" className="md:col-span-2">
        <Textarea
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          placeholder="Describe the habit, goal, or target you want to achieve."
        />
      </Field>
      <div className="md:col-span-2 flex flex-col gap-3">
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
        <Button type="submit" className="w-full md:w-fit" disabled={saving}>
          {saving ? "Saving goal..." : "Save goal"}
        </Button>
      </div>
    </form>
  );
}
