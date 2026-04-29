"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ReflectionForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    reflectionDate: new Date().toISOString().slice(0, 10),
    wins: "",
    challenges: "",
    disciplineScore: "85",
    psychologyScore: "85",
    performanceScore: "85",
    gratitude: "",
    tomorrowFocus: ""
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
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        });

        const result = (await response.json()) as { error?: string; message?: string };
        setSaving(false);
        setStatus(result.error || result.message || "Reflection saved.");

        if (response.ok) {
          router.refresh();
        }
      }}
    >
      <Field label="Reflection Date">
        <Input
          type="date"
          value={form.reflectionDate}
          onChange={(event) => setForm({ ...form, reflectionDate: event.target.value })}
          required
        />
      </Field>
      <Field label="Discipline Score">
        <Input
          type="number"
          min="1"
          max="100"
          value={form.disciplineScore}
          onChange={(event) => setForm({ ...form, disciplineScore: event.target.value })}
          required
        />
      </Field>
      <Field label="Psychology Score">
        <Input
          type="number"
          min="1"
          max="100"
          value={form.psychologyScore}
          onChange={(event) => setForm({ ...form, psychologyScore: event.target.value })}
          required
        />
      </Field>
      <Field label="Performance Score">
        <Input
          type="number"
          min="1"
          max="100"
          value={form.performanceScore}
          onChange={(event) => setForm({ ...form, performanceScore: event.target.value })}
          required
        />
      </Field>
      <Field label="Wins Today" className="md:col-span-2">
        <Textarea
          value={form.wins}
          onChange={(event) => setForm({ ...form, wins: event.target.value })}
          placeholder="What did you do well today?"
          required
        />
      </Field>
      <Field label="Challenges" className="md:col-span-2">
        <Textarea
          value={form.challenges}
          onChange={(event) => setForm({ ...form, challenges: event.target.value })}
          placeholder="What challenged your process?"
          required
        />
      </Field>
      <Field label="Gratitude" className="md:col-span-2">
        <Textarea
          value={form.gratitude}
          onChange={(event) => setForm({ ...form, gratitude: event.target.value })}
          placeholder="Optional gratitude note"
        />
      </Field>
      <Field label="Tomorrow's Focus" className="md:col-span-2">
        <Textarea
          value={form.tomorrowFocus}
          onChange={(event) => setForm({ ...form, tomorrowFocus: event.target.value })}
          placeholder="What will you focus on next session?"
        />
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
