import { GoalForm } from "@/components/forms/goal-form";
import { Badge } from "@/components/risktiq-ui/badge";
import { Card } from "@/components/risktiq-ui/card";
import { DashboardLayout, useWorkspace } from "@/components/dashboard/dashboard-layout";
import { formatDate } from "@/lib/utils";

function GoalsBody() {
  const { data, isLoading } = useWorkspace();
  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading...</p>;
  const { goals } = data;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <p className="text-sm text-muted-foreground">Goal tracking</p>
        <h2 className="mt-2 text-2xl font-semibold">Build habits and measurable milestones</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Track process goals, performance objectives, and behavior targets inside your journal workspace.
        </p>
        <div className="mt-6">
          <GoalForm />
        </div>
      </Card>

      <Card>
        <p className="text-sm text-muted-foreground">Habit tracker</p>
        <h2 className="mt-2 text-2xl font-semibold">Active goals and streak support</h2>
        <div className="mt-6 grid gap-4">
          {goals.length ? (
            goals.map((goal) => {
              const progress = goal.targetValue ? Math.min(100, (goal.currentValue / goal.targetValue) * 100) : 0;
              return (
                <div key={goal.id} className="rounded-[24px] border border-border/60 bg-background/60 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-semibold">{goal.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{goal.description || "No description provided."}</p>
                    </div>
                    <Badge>{goal.status}</Badge>
                  </div>
                  <div className="mt-5 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span>Progress: {goal.currentValue} / {goal.targetValue}</span>
                    <span>Due: {goal.dueDate ? formatDate(goal.dueDate) : "Open ended"}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No goals created yet. Add a target to start tracking progress.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function GoalsPage() {
  return (
    <DashboardLayout>
      <GoalsBody />
    </DashboardLayout>
  );
}
