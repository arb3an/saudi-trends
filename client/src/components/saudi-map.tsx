import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { saudiCities } from "@shared/schema";

interface CityData {
  city: string;
  count: number;
}

interface SaudiMapProps {
  cityData: CityData[];
  onCityClick?: (city: string) => void;
}

export function SaudiMap({ cityData, onCityClick }: SaudiMapProps) {
  const maxCount = Math.max(...cityData.map((d) => d.count), 1);

  const sortedCityData = [...cityData].sort((a, b) => b.count - a.count);

  const getCityInfo = (cityName: string) => {
    return saudiCities.find((c) => c.nameEn === cityName);
  };

  const getIntensity = (count: number) => {
    const percentage = (count / maxCount) * 100;
    if (percentage > 75) return "very-high";
    if (percentage > 50) return "high";
    if (percentage > 25) return "medium";
    return "low";
  };

  const intensityColors = {
    "very-high": "bg-primary text-primary-foreground",
    high: "bg-primary/70 text-primary-foreground",
    medium: "bg-primary/40",
    low: "bg-primary/20",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <MapPin className="h-5 w-5 text-primary" />
        <CardTitle className="text-xl font-semibold">
          التوزيع الجغرافي في السعودية
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground border-b pb-4">
            <span>كثافة النشاط:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/20" />
              <span>منخفض</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/40" />
              <span>متوسط</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/70" />
              <span>عالي</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary" />
              <span>عالي جداً</span>
            </div>
          </div>

          {/* City Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" data-testid="map-cities-grid">
            {sortedCityData.map((data) => {
                const cityInfo = getCityInfo(data.city);
                if (!cityInfo) return null;

                const intensity = getIntensity(data.count);

                return (
                  <button
                    key={data.city}
                    onClick={() => onCityClick?.(data.city)}
                    className={`p-4 rounded-md text-right transition-all hover-elevate active-elevate-2 ${intensityColors[intensity]}`}
                    data-testid={`button-map-city-${data.city}`}
                    aria-label={`${cityInfo.name}: ${data.count} حساب نشط`}
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-sm" data-testid={`text-city-name-${data.city}`}>{cityInfo.name}</p>
                      <p className="text-2xl font-bold" dir="ltr" data-testid={`text-city-count-${data.city}`}>
                        {data.count.toLocaleString()}
                      </p>
                      <p className="text-xs opacity-90">حساب نشط</p>
                    </div>
                  </button>
                );
              })}
          </div>

          {cityData.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد بيانات جغرافية لعرضها
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
