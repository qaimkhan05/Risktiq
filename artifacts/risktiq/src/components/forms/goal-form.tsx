import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/risktiq-ui/button";
import { Field } from "@/components/risktiq-ui/field";
import { Input } from "@/components/risktiq-ui/input";
import { Select } from "@/components/risktiq-ui/select";
import { Textarea } from "@/components/risktiq-ui/textarea";

export function GoalForm() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    description: "",
    targetValue: "10",
    currentValue: "0",
    status: "ACTIVE",
    dueDate: "",
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
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
        const result = (await response.json()) as { error?: string; message?: string };
        setSaving(false);
        setStatus(result.error || result.message || "Goal saved.");
        if (response.ok) {
          setForm({ title: "", description: "", targetValue: "10", currentValue: "0", status: "ACTIVE", dueDate: "" });
          queryClient.invalidateQueries({ queryKey: ["dashboard-workspace"] });
        }
      }}
    >
      <Field label="Goal Title">
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Reach 80% rule adherence" required />
      </Field>
      <Field label="Target Value">
        <Input type="number" step="0.01" value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: e.target.value })} required />
      </Field>
      <Field label="Current Value">
        <Input type="number" step="0.01" value={form.currentValue} onChange={(e) => setForm({ ...form, currentValue: e.target.value })} />
      </Field>
      <Field label="Status">
        <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="MISSED">Missed</option>
        </Select>
      </Field>
      <Field label="Due Date">
        <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
      </Field>
      <Field label="Description" className="md:col-span-2">
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the habit, goal, or target you want to achieve." />
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
