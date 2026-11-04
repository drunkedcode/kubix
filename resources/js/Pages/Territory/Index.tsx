import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

interface TerritoryItem {
  id: number;
  name: string;
  slug: string;
  type: "country" | "state" | "city" | "neighborhood";
}

interface Props {
  currentLevel: "country" | "state" | "city" | "neighborhood";
  territories: TerritoryItem[];
}

export default function Index({ currentLevel, territories }: Props) {
  // Embudo: el barrio cae en su Agency; cualquier otro nivel, en su Overview
  const handleViewDetails = (item: TerritoryItem) => {
    router.get(
      route(item.type === "neighborhood" ? "agencies.index" : "overview.territory", { territory: item.slug }),
    );
  };

  return (
    <AdminLayout
      title="Gestión de Territorios"
      subtitle={`Visualizando nivel: ${currentLevel.toUpperCase()}`}
    >
      <Head title="Territorios" />

      <div className="space-y-6">
        {/* Grilla de Tarjetas — datos reales de nuestra DB, sin mock.
            Para bajar por el árbol se usa el selector del header. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {territories.length === 0 && (
            <p className="col-span-full text-sm text-slate-400">
              No hay territorios dados de alta en este nivel todavía.
            </p>
          )}

          {territories.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-navy-800 bg-navy-900 p-4 flex flex-col gap-3"
            >
              <div>
                <p className="text-sm text-slate-400">{t.type}</p>
                <p className="text-lg font-semibold text-white">{t.name}</p>
              </div>
              <button
                onClick={() => handleViewDetails(t)}
                className="self-start text-sm text-teal-400 hover:text-teal-300"
              >
                Ver detalles →
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}