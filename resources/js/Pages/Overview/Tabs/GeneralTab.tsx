import { router } from "@inertiajs/react";
import { Briefcase, Eye, MapPin, ShoppingCart, Star, Store, Users } from "lucide-react";
import Card from "@/Shared/components/card/Card";
import CardTitle from "@/Shared/components/card/CardTitle";
import StatCard, { type StatCardProps } from "@/Shared/components/metrics/cards/StatCard";
import SegmentDonut, { type DonutSegment } from "@/Shared/components/metrics/donuts/SegmentDonut";
import BaseMap from "@/Shared/components/maps/BaseMap";
import MarkersLayer, { type MapMarker } from "@/Shared/components/maps/MarkersLayer";
import AreasLayer, { type MapArea } from "@/Shared/components/maps/AreasLayer";

const ICONS = { users: Users, store: Store, briefcase: Briefcase, star: Star, eye: Eye, cart: ShoppingCart } as const;

export interface GeneralData {
  stats: (Omit<StatCardProps, "icon"> & { icon: keyof typeof ICONS })[];
  markers: MapMarker[];
  areas: MapArea[];
  segments: DonutSegment[];
}

/**
 * GeneralTab.tsx (Overview)
 * Qué es:  los números sumados del alcance, el mapa de sus territorios y los negocios por categoría.
 */
export default function GeneralTab({ data }: { data: GeneralData }) {
  // En el totalizador cada pin es un territorio: al tocarlo se entra a su destino.
  const openMarker = (m: MapMarker) => {
    if (m.href) router.visit(m.href);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((s) => (
          <StatCard key={s.label} {...s} icon={ICONS[s.icon]} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card header={<CardTitle icon={MapPin} title="Mapa dos Territórios" />}>
          <div className="min-h-[360px]">
            <BaseMap className="h-full min-h-[360px]">
              <AreasLayer areas={data.areas} />
              {/* Con áreas manda el área; sin ellas, se encuadran los pines */}
              <MarkersLayer markers={data.markers} fit={data.areas.length === 0} onMarkerClick={openMarker} />
            </BaseMap>
          </div>
        </Card>

        <SegmentDonut segments={data.segments} />
      </div>
    </div>
  );
}
