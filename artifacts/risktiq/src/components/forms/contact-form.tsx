import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/risktiq-ui/button";
import { Field } from "@/components/risktiq-ui/field";
import { Input } from "@/components/risktiq-ui/input";
import { Textarea } from "@/components/risktiq-ui/textarea";

export function ContactForm({ supportEmail }: { supportEmail: string }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  return (
    <form
      className="grid gap-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setSending(true);
        setStatus("");
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
        const result = (await response.json()) as { error?: string; message?: string };
        setSending(false);
        setStatus(result.error || result.message || `Message captured. Reach us at ${supportEmail}.`);
        if (response.ok) {
          setForm({ name: "", email: "", subject: "", message: "" });
        }
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Your Name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" required />
        </Field>
        <Field label="Email Address">
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
        </Field>
      </div>
      <Field label="Subject">
        <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" required />
      </Field>
      <Field label="Message" hint="Describe your question, account issue, or partnership request in detail.">
        <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us what you need from the Risktiq team." className="min-h-[180px]" required />
      </Field>
      <div className="flex flex-col gap-3">
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" disabled={sending} className="w-full sm:w-fit">
            <Send className="h-4 w-4" />
            {sending ? "Sending message..." : "Send message"}
          </Button>
          <a href={`mailto:${supportEmail}`} className="text-sm font-medium text-primary transition hover:text-primary/80">
            Or email us directly at {supportEmail}
          </a>
        </div>
      </div>
    </form>
  );
}
