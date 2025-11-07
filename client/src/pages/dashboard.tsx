import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { FilterSidebar } from "@/components/filter-sidebar";
import { TrendCard } from "@/components/trend-card";
import { TopAccounts } from "@/components/top-accounts";
import { StatsOverview } from "@/components/stats-overview";
import { SaudiMap } from "@/components/saudi-map";
import { LiveIndicator } from "@/components/live-indicator";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  TrendCardSkeleton,
  StatsOverviewSkeleton,
  TopAccountsSkeleton,
} from "@/components/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Filters, TrendWithAccounts, Account } from "@shared/schema";

export default function Dashboard() {
  const [filters, setFilters] = useState<Filters>({
    cities: [],
    excludeBots: true,
    timeRange: "24h",
    minEngagement: 0,
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  // Fetch trends data with filters as separate key part
  const { data: trendsData, isLoading: trendsLoading } = useQuery<TrendWithAccounts[]>({
    queryKey: ["/api/trends", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.cities.length > 0) {
        filters.cities.forEach((city) => params.append("cities", city));
      }
      params.set("excludeBots", filters.excludeBots.toString());
      params.set("timeRange", filters.timeRange);
      params.set("minEngagement", filters.minEngagement.toString());
      
      const response = await fetch(`/api/trends?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch trends");
      }
      
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch top accounts
  const { data: topAccounts, isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts/top"],
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === "trends_update") {
          setLastUpdated(new Date(message.data.timestamp));
          
          // Invalidate all trends queries (regardless of filters) to trigger refetch with fresh data
          queryClient.invalidateQueries({ 
            predicate: (query) => 
              Array.isArray(query.queryKey) && query.queryKey[0] === "/api/trends"
          });
          queryClient.invalidateQueries({ queryKey: ["/api/accounts/top"] });
          
          toast({
            title: "تحديث البيانات",
            description: `تم تحديث ${message.data.trends.length} ترند`,
            duration: 3000,
          });
        } else if (message.type === "new_trend") {
          // Invalidate all trends queries to show new trend
          queryClient.invalidateQueries({ 
            predicate: (query) => 
              Array.isArray(query.queryKey) && query.queryKey[0] === "/api/trends"
          });
          
          toast({
            title: "ترند جديد",
            description: `${message.data.trend.hashtag} دخل قائمة الترندات`,
            duration: 5000,
          });
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, [toast]);

  // Calculate stats
  const stats = {
    totalTrends: trendsData?.length || 0,
    totalTweets: trendsData?.reduce((sum, t) => sum + t.tweetCount, 0) || 0,
    totalAccounts: topAccounts?.length || 0,
    avgEngagement:
      trendsData?.length
        ? Math.round(
            trendsData.reduce((sum, t) => sum + t.totalEngagement, 0) /
              trendsData.length
          )
        : 0,
  };

  // Calculate city distribution
  const cityData = trendsData?.reduce((acc, trend) => {
    Object.entries(trend.cityDistribution).forEach(([city, count]) => {
      const existing = acc.find((item) => item.city === city);
      if (existing) {
        existing.count += count;
      } else {
        acc.push({ city, count });
      }
    });
    return acc;
  }, [] as { city: string; count: number }[]) || [];

  const handleCityClick = (city: string) => {
    setFilters((prev) => ({
      ...prev,
      cities: prev.cities.includes(city)
        ? prev.cities.filter((c) => c !== city)
        : [...prev.cities, city],
    }));
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                data-testid="button-sidebar-toggle"
                aria-label={sidebarOpen ? "إغلاق القائمة الجانبية" : "فتح القائمة الجانبية"}
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold" data-testid="text-app-title">
                  محلل الترندات السعودية
                </h1>
                <p className="text-xs text-muted-foreground hidden md:block" data-testid="text-app-subtitle">
                  تحليل الترندات في الوقت الفعلي
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LiveIndicator lastUpdated={lastUpdated} isConnected={isConnected} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <FilterSidebar filters={filters} onFiltersChange={setFilters} />
          </aside>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="absolute right-0 top-0 h-full w-[280px] bg-background border-l p-4 overflow-y-auto">
                <FilterSidebar filters={filters} onFiltersChange={setFilters} />
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {/* Stats Overview */}
            {trendsLoading ? (
              <StatsOverviewSkeleton />
            ) : (
              <StatsOverview {...stats} />
            )}

            {/* Trending Topics Grid */}
            <section>
              <h2 className="text-2xl md:text-3xl font-semibold mb-6" data-testid="heading-active-trends">
                الترندات النشطة الآن
              </h2>
              {trendsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TrendCardSkeleton key={i} />
                  ))}
                </div>
              ) : trendsData && trendsData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-trends">
                  {trendsData.map((trend, index) => (
                    <div
                      key={trend.id}
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                      className="animate-in fade-in slide-in-from-bottom-4"
                    >
                      <TrendCard trend={trend} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground" data-testid="text-no-trends">
                  لا توجد ترندات تطابق الفلاتر المحددة
                </div>
              )}
            </section>

            {/* Top Accounts */}
            <section>
              {accountsLoading ? (
                <TopAccountsSkeleton />
              ) : (
                topAccounts && <TopAccounts accounts={topAccounts} />
              )}
            </section>

            {/* Geographic Distribution */}
            <section>
              <SaudiMap cityData={cityData} onCityClick={handleCityClick} />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
