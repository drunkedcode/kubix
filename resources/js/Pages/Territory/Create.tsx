import { useEffect, useCallback, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Building2, MapPin, PieChart } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import BaseMap from '@/Shared/components/maps/BaseMap';
import DrawLayer from '@/Shared/components/maps/DrawLayer';
import MarkersLayer, { type MapMarker } from '@/Shared/components/maps/MarkersLayer';
import StatCard from '@/Shared/components/metrics/cards/StatCard';
import TerritoryFilterBar, { type TerritorySelection } from '@/Layouts/partials/TerritoryFilterBar';
import TerritoryDetailCard from '@/Shared/ui/TerritoryDetailCard';

interface Option {
  value: string;
  label: string;
  active: boolean;
}

interface CreateProps {
  selection: TerritorySelection;
  countries: Option[];
  states: Option[];
  cities: Option[];
  neighborhoods: Option[];
  cards: { label: string; value: number | string; tone: 'teal' | 'rose' | 'amber' | 'orange' }[];
  markers: MapMarker[];
  focus: { lat: number; lng: number } | null;
  neighborhood: {
    id: number | null;
    osm_id: string;
    name: string;
    operated: boolean;
    polygon: GeoJSON.Polygon | GeoJSON.MultiPolygon | GeoJSON.Point | null;
    lat: number | null;
    lng: number | null;
  } | null;
}

const ICONS = [Building2, MapPin, PieChart];
const DEFAULT_CENTER: [number, number] = [-14.235, -51.9253];

const getCoords = (item: { lat?: number | null; lng?: number | null }) => {
  const lat = Number(item.lat ?? 0);
  const lng = Number(item.lng ?? 0);
  return { lat, lng, isValid: lat !== 0 && lng !== 0 };
};

type PolygonGeometry = GeoJSON.Polygon | GeoJSON.MultiPolygon | null;

export default function Create({
  selection,
  countries,
  states,
  cities,
  neighborhoods,
  cards,
  markers,
  focus,
  neighborhood,
}: CreateProps) {
  const hasRealBoundary =
    neighborhood?.polygon?.type === 'Polygon' || neighborhood?.polygon?.type === 'MultiPolygon';

  const [polygon, setPolygon] = useState<PolygonGeometry>(() =>
    hasRealBoundary ? (neighborhood!.polygon as GeoJSON.Polygon | GeoJSON.MultiPolygon) : null,
  );

  useEffect(() => {
    setPolygon(hasRealBoundary ? (neighborhood!.polygon as GeoJSON.Polygon | GeoJSON.MultiPolygon) : null);
  }, [neighborhood?.osm_id]);

  // NUEVO: Manejar cambios del filtro (desacoplado del componente)
  const handleFilterChange = (nextSelection: TerritorySelection) => {
    const params = Object.fromEntries(
      Object.entries(nextSelection).filter(([, v]) => v)
    );
    router.get(window.location.pathname, params, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    });
  };

  const hasValidGeometry = useCallback((g: PolygonGeometry): boolean => {
    if (!g) return false;
    if (g.type === 'Polygon') return g.coordinates.length > 0 && g.coordinates[0].length > 3;
    if (g.type === 'MultiPolygon') return g.coordinates.length > 0;
    return false;
  }, []);

  const mapMarkers: MapMarker[] = [...markers];
  if (neighborhood && !hasRealBoundary) {
    const { lat, lng, isValid } = getCoords(neighborhood);
    if (isValid) {
      mapMarkers.push({
        id: neighborhood.osm_id,
        title: neighborhood.name,
        subtitle: 'Sin límite — dibujar manualmente',
        lat,
        lng,
        color: '#64748b',
      });
    }
  }

  const depth = selection.neighborhood ? 4 : selection.city ? 3 : selection.state ? 2 : selection.country ? 1 : 0;
  const zoom = [3, 5, 7, 11, 15][depth] ?? 3;

  const center: [number, number] = (() => {
    if (neighborhood) {
      const { lat, lng, isValid } = getCoords(neighborhood);
      if (isValid) return [lat, lng];
    }
    if (focus) return [focus.lat, focus.lng];
    if (mapMarkers.length > 0) {
      const avgLat = mapMarkers.reduce((s, m) => s + getCoords(m).lat, 0) / mapMarkers.length;
      const avgLng = mapMarkers.reduce((s, m) => s + getCoords(m).lng, 0) / mapMarkers.length;
      return [avgLat, avgLng];
    }
    return DEFAULT_CENTER;
  })();

  const isOperated = Boolean(neighborhood?.operated);
  const geometryValid = hasValidGeometry(polygon);
  const canSubmit = Boolean(neighborhood && geometryValid && (!isOperated || neighborhood.id));

  const labelOf = (list: Option[], value?: string | null) =>
    list.find((o) => o.value === value)?.label ?? null;

  const hierarchy = {
    country: labelOf(countries, selection.country),
    state: labelOf(states, selection.state),
    city: labelOf(cities, selection.city),
  };

  const closeCard = () => {
    const { neighborhood: _omit, ...rest } = selection;
    const params = Object.fromEntries(Object.entries(rest).filter(([, v]) => v));
    router.get(window.location.pathname, params, { preserveState: true, preserveScroll: true, replace: true });
  };

  const handleSubmit = () => {
    if (!neighborhood || !hasValidGeometry(polygon)) return;
    const { lat, lng } = getCoords(neighborhood);

    if (isOperated && neighborhood.id) {
      router.patch(`/territories/${neighborhood.id}`, {
        polygon,
      }, {
        preserveScroll: true,
        onSuccess: () => {},
      });
      return;
    }

    router.post('/territories', {
      country: selection.country,
      state: selection.state,
      city: selection.city,
      osm_id: neighborhood.osm_id,
      name: neighborhood.name,
      lat,
      lng,
      polygon,
    }, {
      preserveScroll: true,
      onSuccess: () => {},
    });
  };

  return (
    <AdminLayout title="Nuevo Territorio" subtitle="Explora y define territorios para dar de alta">
      <Head title="Nuevo Territorio" />

      <div className="space-y-4 p-2 sm:p-6">
        {/* ✅ Solo agregamos onSelectionChange */}
        <TerritoryFilterBar
          selection={selection}
          onSelectionChange={handleFilterChange}
          countries={countries}
          states={states}
          cities={cities}
          neighborhoods={neighborhoods}
        />

        <div className="overflow-x-auto">
          <div className="flex min-w-[700px] gap-4">
            {cards.map((c, i) => (
              <StatCard
                key={c.label}
                className="min-w-0 flex-1"
                label={c.label}
                value={c.value}
                tone={c.tone}
                icon={ICONS[i % ICONS.length]}
              />
            ))}
          </div>
        </div>

        <div className="relative">
          <BaseMap key={JSON.stringify(selection)} center={center} zoom={zoom} className="h-[480px]">
            {neighborhood && (
              <DrawLayer
                areas={polygon ? [{ id: neighborhood.osm_id, name: neighborhood.name, geometry: polygon }] : []}
                onAreaChange={(_id, geometry) => setPolygon(geometry)}
                onAreaCreate={(geometry) => setPolygon(geometry)}
              />
            )}
            <MarkersLayer markers={mapMarkers} />
          </BaseMap>

          {neighborhood && (
            <TerritoryDetailCard
              name={neighborhood.name}
              operated={isOperated}
              hierarchy={hierarchy}
              lat={getCoords(neighborhood).isValid ? getCoords(neighborhood).lat : null}
              lng={getCoords(neighborhood).isValid ? getCoords(neighborhood).lng : null}
              polygon={polygon}
              canSubmit={canSubmit}
              disabledReason={canSubmit ? undefined : 'Dibuja el límite en el mapa (lápiz) antes de guardar.'}
              onSubmit={handleSubmit}
              onClose={closeCard}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}