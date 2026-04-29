import { ReflectionForm } from "@/components/forms/reflection-form";
import { Badge } from "@/components/risktiq-ui/badge";
import { Card } from "@/components/risktiq-ui/card";
import { DashboardLayout, useWorkspace } from "@/components/dashboard/dashboard-layout";
import { formatDate } from "@/lib/utils";

function ReflectionBody() {
  const { data, isLoading } = useWorkspace();
  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading...</p>;
  const { reflections } = data;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <Card>
        <p className="text-sm text-muted-foreground">Daily reflection system</p>
        <h2 className="mt-2 text-2xl font-semibold">Log end-of-day review</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Capture what worked, what challenged you, and how your discipline and psychology held up.
        </p>
        <div className="mt-6">
          <ReflectionForm />
        </div>
      </Card>

      <Card>
        <p className="text-sm text-muted-foreground">Reflection history</p>
        <h2 className="mt-2 text-2xl font-semibold">Review streak and mindset trends</h2>
        <div className="mt-6 grid gap-4">
          {reflections.length ? (
            reflections.slice(0, 8).map((reflection) => (
              <div key={reflection.id} className="rounded-[24px] border border-border/60 bg-background/60 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">{formatDate(reflection.reflectionDate)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{reflection.tomorrowFocus || "No focus note provided."}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge>{reflection.disciplineScore} Discipline</Badge>
                    <Badge>{reflection.psychologyScore} Psychology</Badge>
                    <Badge>{reflection.performanceScore} Performance</Badge>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Wins</p>
                    <p className="mt-2 text-sm leading-7">{reflection.wins}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Challenges</p>
                    <p className="mt-2 text-sm leading-7">{reflection.challenges}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No reflections yet. Start logging daily reviews to build streak tracking.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function ReflectionPage() {
  return (
    <DashboardLayout>
      <ReflectionBody />
    </DashboardLayout>
  );
}
