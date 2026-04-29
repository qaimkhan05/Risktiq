import { Link } from "wouter";
import { ArrowRight, Clock3, Headset, Mail, ShieldCheck } from "lucide-react";

import { ContactForm } from "@/components/forms/contact-form";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { MarketingNav } from "@/components/layout/marketing-nav";
import { Badge } from "@/components/risktiq-ui/badge";
import { Button } from "@/components/risktiq-ui/button";
import { Card } from "@/components/risktiq-ui/card";

const contactCards = [
  { title: "Product support", description: "Get help with account access, journaling issues, exports, or dashboard behavior.", icon: Headset },
  { title: "Fast response path", description: "Use the form for structured requests so support can respond with the right context quickly.", icon: Clock3 },
  { title: "Private by design", description: "Your account and journal data stay isolated. Support only reviews what you explicitly report.", icon: ShieldCheck },
];

const supportEmail = "support@risktiq.com";

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <MarketingNav />
      <section className="container-shell py-14 md:py-20">
        <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-6">
            <Badge>Contact Risktiq</Badge>
            <div className="space-y-4">
              <h1 className="font-[var(--font-display)] text-4xl font-semibold leading-tight md:text-6xl">
                Talk to the team behind your trading workspace.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Use the contact form for account help, product questions, deployment support, or partnership inquiries.
                We built this page to feel like the rest of the platform: clear, fast, and professional.
              </p>
            </div>
            <div className="grid gap-4">
              {contactCards.map(({ title, description, icon: Icon }) => (
                <Card key={title} className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{title}</h2>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/12 text-success">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Direct support email</p>
                  <p className="mt-1 text-lg font-semibold">{supportEmail}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                For deployment-specific help, include your project URL, the issue you saw, and the screen where it happened.
              </p>
            </Card>
          </div>

          <Card className="p-6 md:p-8">
            <p className="eyebrow">Send a message</p>
            <h2 className="mt-2 text-3xl font-semibold">We can help with support, setup, and deployment</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              Reach out if you need help with account verification, export issues, screenshots, admin access, or deployment setup.
            </p>
            <div className="mt-8">
              <ContactForm supportEmail={supportEmail} />
            </div>
            <div className="mt-8 rounded-[24px] border border-border/60 bg-background/70 p-5">
              <p className="text-sm text-muted-foreground">Need the platform right now?</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-base font-semibold">Create your private Risktiq account and start journaling.</p>
                <Link href="/register">
                  <Button size="sm">
                    Start with Risktiq
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
