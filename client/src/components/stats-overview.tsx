import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Hash, Users, Activity } from "lucide-react";

interface StatsOverviewProps {
  totalTrends: number;
  totalTweets: number;
  totalAccounts: number;
  avgEngagement: number;
}

export function StatsOverview({
  totalTrends,
  totalTweets,
  totalAccounts,
  avgEngagement,
}: StatsOverviewProps) {
  const stats = [
    {
      label: "الترندات النشطة",
      value: totalTrends,
      icon: Hash,
      testId: "stat-total-trends",
    },
    {
      label: "إجمالي التغريدات",
      value: totalTweets,
      icon: TrendingUp,
      testId: "stat-total-tweets",
    },
    {
      label: "الحسابات المشاركة",
      value: totalAccounts,
      icon: Users,
      testId: "stat-total-accounts",
    },
    {
      label: "متوسط التفاعل",
      value: avgEngagement,
      icon: Activity,
      testId: "stat-avg-engagement",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="hover-elevate" data-testid={stat.testId}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl md:text-4xl font-bold" dir="ltr">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
