import { Briefcase, Star, Store, Users } from "lucide-react";
import StatCard, { type StatCardProps } from "@/Shared/components/metrics/cards/StatCard";
import SegmentDonut, { type DonutSegment } from "@/Shared/components/metrics/donuts/SegmentDonut";
import PerformancePanel, { type PerformancePoint } from "../Panels/PerformancePanel";
import TopBusinessesPanel, { type TopBusiness } from "../Panels/TopBusinessesPanel";
import RecentActivityPanel, { type ActivityItem } from "../Panels/RecentActivityPanel";
import ModuleStatusPanel, { type ModuleStatusItem } from "../Panels/ModuleStatusPanel";

import { router } from "@inertiajs/react";
import BaseMap from "@/Shared/components/maps/BaseMap";
import MarkersLayer, { type MapMarker } from "@/Shared/components/maps/MarkersLayer";
import AreasLayer, { type MapArea } from "@/Shared/components/maps/AreasLayer";

const ICONS = { users: Users, store: Store, briefcase: Briefcase, star: Star } as const;

export interface GeneralData {
  stats: (Omit<StatCardProps, "icon"> & { icon: keyof typeof ICONS })[];
  performance: PerformancePoint[];
  top: TopBusiness[];
  modules: ModuleStatusItem[];
  activity: ActivityItem[];
  markers: MapMarker[];
  areas: MapArea[];
  segments: DonutSegment[];
}

interface GeneralTabProps {
  data: GeneralData;
  /** Slug del barrio, para armar la ruta de cada negocio. */
  territory: string;
}

export default function GeneralTab({ data, territory }: GeneralTabProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((s) => (
          <StatCard key={s.label} {...s} icon={ICONS[s.icon]} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <PerformancePanel points={data.performance} className="xl:col-span-2" />
        <TopBusinessesPanel items={data.top} territory={territory} />
        <RecentActivityPanel items={data.activity} className="xl:row-span-2" />
        <ModuleStatusPanel items={data.modules} className="xl:col-span-2" />
        <SegmentDonut segments={data.segments} />
      </div>

      <div className="min-h-[360px]">
        <BaseMap className="h-full min-h-[360px]">
          <AreasLayer areas={data.areas} />
          <MarkersLayer
            markers={data.markers}
            fit={data.areas.length === 0}
            onMarkerClick={(m) =>
              router.visit(route("businesses.show", { territory, business: m.id }))
            }
          />
        </BaseMap>
      </div>
    </div>
  );
}
