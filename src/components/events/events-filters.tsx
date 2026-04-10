import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { EventFilters } from "@/lib/types.ts";
import { X } from "lucide-react";
import { useState } from "react";

interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  eventCount: number;
}

const eventCategories = ["All Categories", "Hackathon", "Speaker"];

const eventCities = ["All Cities", "Munich", "Online"];

export default function EventFiltersComponent({
  filters,
  onFiltersChange,
  eventCount,
}: EventFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: "All Categories",
      city: "All Cities",
    });
  };

  const hasActiveFilters =
    filters.category !== "All Categories" || filters.city !== "All Cities";

  return (
    <div className="mb-8 p-4 rounded-lg border border-gray-500">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Filters</h3>
          <span className="text-xs text-muted-foreground">
            ({eventCount} events)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
          <span className="text-xs text-muted-foreground">
            {isExpanded ? "▲" : "▼"}
          </span>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-96 mt-4" : "max-h-0"
        }`}
      >
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Label className="text-xs font-medium text-muted-foreground min-w-[60px]">
              Category:
            </Label>
            <div className="flex flex-wrap gap-2">
              {eventCategories.map((category) => (
                <Button
                  key={category}
                  variant={
                    filters.category === category ? "default" : "outline"
                  }
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleFilterChange("category", category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* City Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Label className="text-xs font-medium text-muted-foreground min-w-[60px]">
              City:
            </Label>
            <div className="flex flex-wrap gap-2">
              {eventCities.map((city) => (
                <Button
                  key={city}
                  variant={filters.city === city ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleFilterChange("city", city)}
                >
                  {city}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
