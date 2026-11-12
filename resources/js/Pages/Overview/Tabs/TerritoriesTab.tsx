import TerritoryCard, { type TerritoryCardData } from "./TerritoryCard";

export type TerritoriesData = TerritoryCardData[];

export default function TerritoriesTab({ items }: { items: TerritoriesData }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">Não há territórios para mostrar.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <TerritoryCard key={item.slug} data={item} />
      ))}
    </div>
  );
}
