export interface AdsData {
  impressions: number;
  clicks: number;
  ctr: string;
  spend: number;
  campaigns: { id: number; name: string; status: string; impressions: number; clicks: number }[];
}

export default function AdsTab({ data }: { data?: AdsData }) {
  if (!data) return null;

  const stats = [
    { label: "Impresiones", value: data.impressions.toLocaleString() },
    { label: "Clics", value: data.clicks.toLocaleString() },
    { label: "CTR", value: data.ctr },
    { label: "Inversión", value: data.spend.toFixed(2) },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-navy-800 bg-navy-900 p-4">
            <p className="text-xs text-navy-400">{s.label}</p>
            <p className="mt-1 text-xl font-semibold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-navy-800 bg-navy-900 p-4">
        <h3 className="mb-4 text-sm font-medium text-navy-200">Campañas</h3>
        <ul className="space-y-2">
          {data.campaigns.map((c) => (
            <li key={c.id} className="flex items-center justify-between text-xs">
              <span className="text-navy-200">{c.name}</span>
              <span className="text-navy-400">
                {c.status} · {c.impressions.toLocaleString()} imp · {c.clicks.toLocaleString()} clics
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}