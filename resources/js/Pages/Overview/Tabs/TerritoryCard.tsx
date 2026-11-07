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
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-800 text-slate-400">
          <Building2 className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        <h3 className="truncate text-base font-semibold text-white">{data.name}</h3>
        {data.location && (
          <p className="flex items-center gap-1 truncate text-xs text-slate-400">
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
      footer={<p className="text-right text-xs font-medium text-teal-300">Entrar →</p>}
    >
      <div className="space-y-4">
        {data.manager ? (
          <div className="flex items-center gap-3">
            <Avatar name={data.manager.name} avatarUrl={null} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{data.manager.name}</p>
              <p className="truncate text-xs text-slate-400">{data.manager.role}</p>
            </div>
          </div>
        ) : (
          data.type === "neighborhood" && (
            <p className="text-sm text-slate-400">Sin gerente · lo administra Kubix</p>
          )
        )}

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">Negocios</p>
            <p className="text-2xl font-bold text-white">{data.businessCount}</p>
            <p className={`text-xs ${up ? "text-emerald-400" : "text-red-400"}`}>
              {up ? "▲ +" : "▼ "}
              {data.delta} en 8 semanas
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
