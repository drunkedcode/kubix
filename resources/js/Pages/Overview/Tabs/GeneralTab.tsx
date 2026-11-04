import { router } from "@inertiajs/react";
import { Building2, Flame, Star, Contrast } from "lucide-react";
import StatCard, { type StatCardProps } from "@/Shared/components/metrics/cards/StatCard";
import SegmentDonut, { type DonutSegment } from "@/Shared/components/metrics/donuts/SegmentDonut";

import BaseMap from "@/Shared/components/maps/BaseMap";
import MarkersLayer, { type MapMarker } from "@/Shared/components/maps/MarkersLayer";
import AreasLayer, { type MapArea } from "@/Shared/components/maps/AreasLayer";

const ICONS = { building: Building2, flame: Flame, star: Star, contrast: Contrast } as const;

export interface GeneralData {
  stats: (Omit<StatCardProps, "icon"> & { icon: keyof typeof ICONS })[];
  markers: MapMarker[];
  areas: MapArea[];
  segments: DonutSegment[];
}

interface GeneralTabProps {
  data: GeneralData;
}

export default function GeneralTab({ data }: GeneralTabProps) {
  // En el totalizador cada pin es un territorio: al tocarlo se entra a su destino.
  const openMarker = (m: MapMarker) => {
    if (m.href) router.visit(m.href);
  };

  return (
    <div className="space-y-2 p-2 sm:p-6">
      <div className="overflow-x-auto">
        <div className="flex min-w-[900px] gap-4">
          {data.stats.map((s) => (
            <StatCard key={s.label} className="min-w-0 flex-1" {...s} icon={ICONS[s.icon]} />
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-[900px] gap-4">
          <div className="min-h-[360px] min-w-0 flex-[2]">
            <BaseMap className="h-full min-h-[360px]">
              <AreasLayer areas={data.areas} />
              {/* Con áreas manda el área; sin ellas, se encuadran los pines */}
              <MarkersLayer
                markers={data.markers}
                fit={data.areas.length === 0}
                onMarkerClick={openMarker}
              />
            </BaseMap>
          </div>

          <div className="min-w-0 flex-1">
            <SegmentDonut
              segments={data.segments}
              onViewAll={() => console.log("ver todos")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}