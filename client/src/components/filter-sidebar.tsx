import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { saudiCities, type Filters } from "@shared/schema";
import { Filter, RotateCcw } from "lucide-react";

interface FilterSidebarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const timeRangeOptions = [
  { value: "1h" as const, label: "آخر ساعة" },
  { value: "6h" as const, label: "آخر 6 ساعات" },
  { value: "12h" as const, label: "آخر 12 ساعة" },
  { value: "24h" as const, label: "آخر 24 ساعة" },
  { value: "7d" as const, label: "آخر 7 أيام" },
];

export function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  const handleCityToggle = (city: string) => {
    const newCities = localFilters.cities.includes(city)
      ? localFilters.cities.filter((c) => c !== city)
      : [...localFilters.cities, city];
    
    const updated = { ...localFilters, cities: newCities };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleBotToggle = (checked: boolean) => {
    const updated = { ...localFilters, excludeBots: checked };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleTimeRangeChange = (range: Filters["timeRange"]) => {
    const updated = { ...localFilters, timeRange: range };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleEngagementChange = (value: number[]) => {
    const updated = { ...localFilters, minEngagement: value[0] };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleReset = () => {
    const defaultFilters: Filters = {
      cities: [],
      excludeBots: true,
      timeRange: "24h",
      minEngagement: 0,
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const groupedCities = {
    central: saudiCities.filter((c) => c.region === "central"),
    western: saudiCities.filter((c) => c.region === "western"),
    eastern: saudiCities.filter((c) => c.region === "eastern"),
    northern: saudiCities.filter((c) => c.region === "northern"),
    southern: saudiCities.filter((c) => c.region === "southern"),
  };

  const regionNames = {
    central: "الوسطى",
    western: "الغربية",
    eastern: "الشرقية",
    northern: "الشمالية",
    southern: "الجنوبية",
  };

  return (
    <Card className="p-6 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">الفلاتر</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          data-testid="button-reset-filters"
        >
          <RotateCcw className="h-4 w-4 ml-1.5" />
          إعادة تعيين
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6">
          {/* Time Range */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">النطاق الزمني</Label>
            <div className="space-y-2">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleTimeRangeChange(option.value)}
                  className={`w-full text-right px-3 py-2 rounded-md text-sm transition-colors hover-elevate ${
                    localFilters.timeRange === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                  data-testid={`button-time-range-${option.value}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bot Detection */}
          <div className="flex items-center justify-between py-3 border-t">
            <Label htmlFor="exclude-bots" className="text-sm font-semibold">
              استبعاد البوتات
            </Label>
            <Switch
              id="exclude-bots"
              checked={localFilters.excludeBots}
              onCheckedChange={handleBotToggle}
              data-testid="switch-exclude-bots"
            />
          </div>

          {/* Engagement Filter */}
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">الحد الأدنى للتفاعل</Label>
              <span className="text-sm font-mono text-muted-foreground" dir="ltr">
                {localFilters.minEngagement.toLocaleString()}
              </span>
            </div>
            <Slider
              value={[localFilters.minEngagement]}
              onValueChange={handleEngagementChange}
              max={10000}
              step={100}
              data-testid="slider-min-engagement"
            />
          </div>

          {/* Cities */}
          <div className="pt-3 border-t">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="cities" className="border-none">
                <AccordionTrigger className="text-sm font-semibold py-2">
                  المدن ({localFilters.cities.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {Object.entries(groupedCities).map(([region, cities]) => (
                      <div key={region} className="space-y-2">
                        <h4 className="text-xs font-medium text-muted-foreground">
                          {regionNames[region as keyof typeof regionNames]}
                        </h4>
                        {cities.map((city) => (
                          <div
                            key={city.nameEn}
                            className="flex items-center gap-2"
                            data-testid={`filter-city-${city.nameEn}`}
                          >
                            <Checkbox
                              id={city.nameEn}
                              checked={localFilters.cities.includes(city.nameEn)}
                              onCheckedChange={() => handleCityToggle(city.nameEn)}
                              data-testid={`checkbox-city-${city.nameEn}`}
                            />
                            <Label
                              htmlFor={city.nameEn}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {city.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}
