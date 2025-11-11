import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TrendingUp,
  TrendingDown,
  Hash,
  MessageCircle,
  Heart,
  Repeat2,
  ChevronLeft,
  Smile,
  Frown,
  Minus,
} from "lucide-react";
import type { Trend } from "@shared/schema";

interface TrendCardProps {
  trend: Trend;
  onViewDetails?: (trendId: string) => void;
}

export function TrendCard({ trend, onViewDetails }: TrendCardProps) {
  const isRising = trend.velocity > 0;

  return (
    <Card
      className="hover-elevate transition-all duration-200"
      data-testid={`card-trend-${trend.id}`}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <a
              href={`https://twitter.com/hashtag/${encodeURIComponent(trend.hashtag.replace('#',''))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-1.5 inline-flex items-center text-blue-500 hover:underline"
              dir="ltr"
            >
              {trend.hashtag}
            </a>
            {isRising ? (
              <TrendingUp className="h-4 w-4 text-primary" />
            ) : (
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <CardTitle className="text-sm font-normal text-muted-foreground">
            الترتيب
          </CardTitle>
        </div>
        <div className="text-4xl font-bold text-primary" dir="ltr">
          #{trend.rank}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold" dir="ltr">
              {trend.tweetCount.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">تغريدة</span>
          </div>
          {trend.velocity !== 0 && (
            <div className="flex items-center gap-1 mt-1">
              <span
                className={`text-xs font-mono ${isRising ? "text-primary" : "text-muted-foreground"}`}
                dir="ltr"
              >
                {isRising ? "+" : ""}
                {trend.velocity.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                في الساعة الأخيرة
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t">
          <div className="flex items-center gap-1.5">
            <Repeat2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium" dir="ltr">
              {trend.retweets.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium" dir="ltr">
              {trend.likes.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium" dir="ltr">
              {trend.comments.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Sentiment Analysis Indicator */}
        <div className="space-y-2 pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              تحليل المشاعر
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs">
                    <Smile className="h-3 w-3 text-green-500" />
                    <span dir="ltr">{trend.sentimentPositive}%</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>مشاعر إيجابية</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div
            className="h-2 w-full rounded-full overflow-hidden flex"
            data-testid={`sentiment-bar-${trend.id}`}
          >
            {trend.sentimentPositive > 0 && (
              <div
                className="bg-green-500"
                style={{ width: `${trend.sentimentPositive}%` }}
                title={`إيجابي: ${trend.sentimentPositive}%`}
              />
            )}
            {trend.sentimentNeutral > 0 && (
              <div
                className="bg-gray-400"
                style={{ width: `${trend.sentimentNeutral}%` }}
                title={`محايد: ${trend.sentimentNeutral}%`}
              />
            )}
            {trend.sentimentNegative > 0 && (
              <div
                className="bg-red-500"
                style={{ width: `${trend.sentimentNegative}%` }}
                title={`سلبي: ${trend.sentimentNegative}%`}
              />
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Frown className="h-3 w-3 text-red-500" />
              <span dir="ltr">{trend.sentimentNegative}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Minus className="h-3 w-3 text-gray-400" />
              <span dir="ltr">{trend.sentimentNeutral}%</span>
            </div>
          </div>
        </div>

        {onViewDetails && (
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={() => onViewDetails(trend.id)}
            data-testid={`button-view-trend-${trend.id}`}
          >
            عرض التفاصيل
            <ChevronLeft className="h-4 w-4 flip-rtl" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
