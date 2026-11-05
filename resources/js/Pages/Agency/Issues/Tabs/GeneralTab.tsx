export interface IssuesSummary {
  open: number;
  resolved: number;
  oldest_days: number;
}

export default function GeneralTab({ summary }: { summary: IssuesSummary }) {
  const cards = [
    { label: "Abiertos", value: summary.open },
    { label: "Resueltos", value: summary.resolved },
    { label: "El más viejo sin resolver", value: `${summary.oldest_days} días` },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-fg/10 p-5">
          <p className="text-xs text-fg/60">{card.label}</p>
          <p className="mt-1 text-2xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
