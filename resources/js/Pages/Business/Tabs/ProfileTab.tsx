export interface BusinessProfile {
  id: number;
  name: string;
  slug: string;
  status: "active" | "inactive";
  location: { latitude: number; longitude: number } | null;
  createdAt: string;
}

const STATUS_LABEL: Record<BusinessProfile["status"], string> = {
  active: "Activo",
  inactive: "Inactivo",
};

export default function ProfileTab({ business }: { business: BusinessProfile }) {
  return (
    <div className="rounded-xl border border-navy-800 bg-navy-900 p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-700 text-xl font-bold text-white">
          {business.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{business.name}</h2>
          <p className="text-xs text-navy-400">Alta: {business.createdAt}</p>
        </div>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${
            business.status === "active"
              ? "bg-teal-400/15 text-teal-300"
              : "bg-slate-500/15 text-slate-300"
          }`}
        >
          {STATUS_LABEL[business.status]}
        </span>
      </div>

      {business.location && (
        <div className="mt-6 text-sm text-navy-300">
          <span className="text-navy-500">Ubicación: </span>
          {business.location.latitude.toFixed(6)}, {business.location.longitude.toFixed(6)}
        </div>
      )}
    </div>
  );
}