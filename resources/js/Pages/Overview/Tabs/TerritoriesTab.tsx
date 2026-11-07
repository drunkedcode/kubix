import TerritoryCard, { type TerritoryCardData } from "./TerritoryCard";

export type TerritoriesData = TerritoryCardData[];

export default function TerritoriesTab({ items }: { items: TerritoriesData }) {
  if (items.length === 0) {
    return <p className="p-6 text-sm text-slate-400">No hay territorios para mostrar.</p>;
  }

  return (
    <div className="grid gap-4 p-2 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
      {items.map((item) => (
        <TerritoryCard key={item.slug} data={item} />
      ))}
    </div>
  );
}
