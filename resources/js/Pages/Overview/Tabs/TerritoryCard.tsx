import { Building2, MapPin } from "lucide-react";
import { BRAND } from "@/Shared/brand";
import Card from "@/Shared/components/card/Card";
import TrendSparkline from "@/Shared/components/metrics/sparklines/TrendSparkline";
import Avatar from "@/Shared/ui/media/user/Avatar";

export interface TerritoryCardData {
  slug: string;
  type: "country" | "state" | "city" | "neighborhood";
  name: string;
  location: string;
  manager: { id: number; name: string; role: string } | null;
  businessCount: number;
  trend: number[];
  delta: number;
  href: string;
}

/** Contenido de una tarjeta de territorio: el marco lo pone Shared/components/card/Card. */
export default function TerritoryCard({ data }: { data: TerritoryCardData }) {
  const up = data.delta >= 0;

  const header = (
    <div className="flex items-center gap-3">
      {data.type === "neighborhood" ? (
        <img src={BRAND.icon} alt={BRAND.name} className="h-10 w-10 shrink-0 object-contain" />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted">
          <Building2 className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        <h3 className="truncate text-base font-semibold text-fg">{data.name}</h3>
        {data.location && (
          <p className="flex items-center gap-1 truncate text-xs text-muted">
            <MapPin className="h-3 w-3 shrink-0" />
            {data.location}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <Card
      href={data.href}
      header={header}
      footer={<p className="text-right text-xs font-medium text-brand-text">Entrar →</p>}
    >
      <div className="space-y-4">
        {data.manager ? (
          <div className="flex items-center gap-3">
            <Avatar name={data.manager.name} avatarUrl={null} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-fg">{data.manager.name}</p>
              <p className="truncate text-xs text-muted">{data.manager.role}</p>
            </div>
          </div>
        ) : (
          data.type === "neighborhood" && (
            <p className="text-sm text-muted">Sem gerente · administrado pela Kubix</p>
          )
        )}

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted">Negócios</p>
            <p className="text-2xl font-bold text-fg">{data.businessCount}</p>
            <p className={`text-xs ${up ? "text-green-600 dark:text-green-400" : "text-rose-500"}`}>
              {up ? "▲ +" : "▼ "}
              {data.delta} em 8 semanas
            </p>
          </div>
          <div className="w-28">
            <TrendSparkline data={data.trend} color="#2dd4bf" height={44} />
          </div>
        </div>
      </div>
    </Card>
  );
}
