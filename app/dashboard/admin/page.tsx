import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminJournalWorkspace } from "@/lib/admin-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminJournalPage() {
  await requireAdmin();
  const adminWorkspace = await getAdminJournalWorkspace();

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-muted-foreground">Total customers</p>
          <p className="mt-3 text-3xl font-semibold">{adminWorkspace.customerCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Verified customers</p>
          <p className="mt-3 text-3xl font-semibold">{adminWorkspace.verifiedCustomerCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Platform trades</p>
          <p className="mt-3 text-3xl font-semibold">{adminWorkspace.totalTradeCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Platform reflections</p>
          <p className="mt-3 text-3xl font-semibold">{adminWorkspace.totalReflectionCount}</p>
        </Card>
      </div>

      <Card>
        <p className="text-sm text-muted-foreground">Admin journal monitor</p>
        <h2 className="mt-2 text-2xl font-semibold">Customer accounts and recent journal activity</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Every customer account remains private to the owner, but this admin panel gives you a controlled overview of
          user growth, recent journal entries, and engagement across the platform.
        </p>
        <div className="mt-6 grid gap-5">
          {adminWorkspace.customerJournals.length ? (
            adminWorkspace.customerJournals.map((customer) => (
              <div key={customer.id} className="rounded-[24px] border border-border/60 bg-background/60 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold">{customer.profile?.fullName || customer.name || customer.email}</p>
                      <Badge>{customer.emailVerified ? "Verified" : "Pending"}</Badge>
                      {customer.profile?.tradingStyle ? <Badge tone="success">{customer.profile.tradingStyle}</Badge> : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>Joined {formatDistanceToNow(customer.createdAt, { addSuffix: true })}</span>
                      <span>{customer._count.trades} trades</span>
                      <span>{customer._count.reflections} reflections</span>
                      <span>{customer._count.goals} goals</span>
                      <span>{customer.ruleBreaks} rule breaks</span>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[340px]">
                    <div className="rounded-[20px] border border-border/60 bg-card/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Recent PnL</p>
                      <p className={`mt-2 text-xl font-semibold ${customer.recentPnl >= 0 ? "text-success" : "text-danger"}`}>
                        {formatCurrency(customer.recentPnl)}
                      </p>
                    </div>
                    <div className="rounded-[20px] border border-border/60 bg-card/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Last trade</p>
                      <p className="mt-2 text-sm font-semibold">
                        {customer.lastTradeAt ? formatDate(customer.lastTradeAt, "dd MMM yyyy") : "No trades"}
                      </p>
                    </div>
                    <div className="rounded-[20px] border border-border/60 bg-card/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Last reflection</p>
                      <p className="mt-2 text-sm font-semibold">
                        {customer.lastReflection ? formatDate(customer.lastReflection.reflectionDate, "dd MMM yyyy") : "No reflection"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[0.68fr_0.32fr]">
                  <div className="rounded-[22px] border border-border/60 bg-card/75 p-4">
                    <p className="text-sm font-semibold">Recent trade journal</p>
                    <div className="mt-4 grid gap-3">
                      {customer.trades.length ? (
                        customer.trades.map((trade) => (
                          <div key={trade.id} className="rounded-[18px] border border-border/50 bg-background/70 p-4">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="font-semibold">{trade.assetName} - {trade.strategyUsed}</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {formatDate(trade.tradeDate, "dd MMM yyyy - HH:mm")} | {trade.direction} | {trade.outcome}
                                </p>
                              </div>
                              <p className={`text-lg font-semibold ${trade.pnlAmount >= 0 ? "text-success" : "text-danger"}`}>
                                {formatCurrency(trade.pnlAmount)}
                              </p>
                            </div>
                            {trade.tradeNotes ? (
                              <p className="mt-3 text-sm leading-7 text-muted-foreground">{trade.tradeNotes}</p>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">This customer has not logged any trades yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-[22px] border border-border/60 bg-card/75 p-4">
                      <p className="text-sm font-semibold">Strategies</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {customer.profile?.preferredStrategies?.length ? (
                          customer.profile.preferredStrategies.map((strategy) => (
                            <Badge key={`${customer.id}-${strategy}`}>{strategy}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No strategies saved.</p>
                        )}
                      </div>
                    </div>
                    <div className="rounded-[22px] border border-border/60 bg-card/75 p-4">
                      <p className="text-sm font-semibold">Latest reflection</p>
                      {customer.lastReflection ? (
                        <div className="mt-3 space-y-2 text-sm">
                          <p className="text-muted-foreground">{customer.lastReflection.challenges}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge>{customer.lastReflection.disciplineScore} Discipline</Badge>
                            <Badge>{customer.lastReflection.psychologyScore} Psychology</Badge>
                            <Badge>{customer.lastReflection.performanceScore} Performance</Badge>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-muted-foreground">No reflection logged yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No customer accounts found yet.</p>
          )}
        </div>
      </Card>

      <Card>
        <p className="text-sm text-muted-foreground">Platform trade feed</p>
        <h2 className="mt-2 text-2xl font-semibold">Latest customer journal entries</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Asset</th>
                <th className="pb-3 font-medium">Strategy</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Outcome</th>
                <th className="pb-3 font-medium">PnL</th>
              </tr>
            </thead>
            <tbody>
              {adminWorkspace.recentPlatformTrades.length ? (
                adminWorkspace.recentPlatformTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-border/40">
                    <td className="py-4">{trade.user.name || trade.user.email}</td>
                    <td className="py-4">{trade.assetName}</td>
                    <td className="py-4">{trade.strategyUsed}</td>
                    <td className="py-4">{formatDate(trade.tradeDate, "dd MMM yyyy - HH:mm")}</td>
                    <td className="py-4">{trade.outcome}</td>
                    <td className={`py-4 font-semibold ${trade.pnlAmount >= 0 ? "text-success" : "text-danger"}`}>
                      {formatCurrency(trade.pnlAmount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    No platform trades have been recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
