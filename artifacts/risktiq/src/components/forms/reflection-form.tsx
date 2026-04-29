import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/risktiq-ui/button";
import { Field } from "@/components/risktiq-ui/field";
import { Input } from "@/components/risktiq-ui/input";
import { Textarea } from "@/components/risktiq-ui/textarea";

export function ReflectionForm() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    reflectionDate: new Date().toISOString().slice(0, 10),
    wins: "",
    challenges: "",
    disciplineScore: "85",
    psychologyScore: "85",
    performanceScore: "85",
    gratitude: "",
    tomorrowFocus: "",
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
        const response = await fetch("/api/reflections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
        const result = (await response.json()) as { error?: string; message?: string };
        setSaving(false);
        setStatus(result.error || result.message || "Reflection saved.");
        if (response.ok) {
          queryClient.invalidateQueries({ queryKey: ["dashboard-workspace"] });
          queryClient.invalidateQueries({ queryKey: ["reflections"] });
        }
      }}
    >
      <Field label="Reflection Date">
        <Input type="date" value={form.reflectionDate} onChange={(e) => setForm({ ...form, reflectionDate: e.target.value })} required />
      </Field>
      <Field label="Discipline Score">
        <Input type="number" min="1" max="100" value={form.disciplineScore} onChange={(e) => setForm({ ...form, disciplineScore: e.target.value })} required />
      </Field>
      <Field label="Psychology Score">
        <Input type="number" min="1" max="100" value={form.psychologyScore} onChange={(e) => setForm({ ...form, psychologyScore: e.target.value })} required />
      </Field>
      <Field label="Performance Score">
        <Input type="number" min="1" max="100" value={form.performanceScore} onChange={(e) => setForm({ ...form, performanceScore: e.target.value })} required />
      </Field>
      <Field label="Wins Today" className="md:col-span-2">
        <Textarea value={form.wins} onChange={(e) => setForm({ ...form, wins: e.target.value })} placeholder="What did you do well today?" required />
      </Field>
      <Field label="Challenges" className="md:col-span-2">
        <Textarea value={form.challenges} onChange={(e) => setForm({ ...form, challenges: e.target.value })} placeholder="What challenged your process?" required />
      </Field>
      <Field label="Gratitude" className="md:col-span-2">
        <Textarea value={form.gratitude} onChange={(e) => setForm({ ...form, gratitude: e.target.value })} placeholder="Optional gratitude note" />
      </Field>
      <Field label="Tomorrow's Focus" className="md:col-span-2">
        <Textarea value={form.tomorrowFocus} onChange={(e) => setForm({ ...form, tomorrowFocus: e.target.value })} placeholder="What will you focus on next session?" />
      </Field>
      <div className="md:col-span-2 flex flex-col gap-3">
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
        <Button type="submit" className="w-full md:w-fit" disabled={saving}>
          {saving ? "Saving reflection..." : "Save daily reflection"}
        </Button>
      </div>
    </form>
  );
}
