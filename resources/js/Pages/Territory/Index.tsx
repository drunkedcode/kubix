import { Head, Link } from "@inertiajs/react";
import { Building2, Globe, Map as MapIcon, MapPin, Plus } from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import Card from "@/Shared/components/card/Card";

type Level = "country" | "state" | "city" | "neighborhood";

interface TerritoryItem {
  id: number;
  name: string;
  slug: string;
  type: Level;
}

interface Props {
  currentLevel: Level;
  territories: TerritoryItem[];
}

const LEVEL_LABEL: Record<Level, string> = {
  country: "País",
  state: "Estado",
  city: "Cidade",
  neighborhood: "Bairro",
};

const LEVEL_ICON = { country: Globe, state: MapIcon, city: Building2, neighborhood: MapPin } as const;

export default function Index({ currentLevel, territories }: Props) {
  return (
    <AdminLayout title="Gestão de Territórios" subtitle={`Nível: ${LEVEL_LABEL[currentLevel]}`}>
      <Head title="Territórios" />

      <div className="space-y-5">
        <div className="flex justify-end">
          <Link
            href={route("territories.create")}
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" />
            Novo Território
          </Link>
        </div>

        {/* Para bajar por el árbol se usa el selector del header. */}
        {territories.length === 0 ? (
          <p className="text-sm text-muted">Ainda não há territórios cadastrados neste nível.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {territories.map((t) => {
              const Icon = LEVEL_ICON[t.type];

              // Embudo: el barrio cae en su Agência; cualquier otro nivel, en su Overview.
              const href = route(t.type === "neighborhood" ? "agencies.index" : "overview.territory", {
                territory: t.slug,
              });

              return (
                <Card
                  key={t.id}
                  href={href}
                  header={
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-fg">{t.name}</h3>
                        <p className="text-xs text-muted">{LEVEL_LABEL[t.type]}</p>
                      </div>
                    </div>
                  }
                  footer={<p className="text-right text-xs font-medium text-brand-text">Ver detalhes →</p>}
                >
                  <p className="truncate text-xs text-muted">{t.slug}</p>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
