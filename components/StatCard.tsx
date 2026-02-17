interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  color: "green" | "yellow" | "red" | "blue";
}

/**
 * Composant pour afficher une carte de statistique
 */
export default function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    green: "bg-success/10 text-success border-success",
    yellow: "bg-warning/10 text-warning border-warning",
    red: "bg-danger/10 text-danger border-danger",
    blue: "bg-primary/10 text-primary border-primary",
  };

  return (
    <div
      className={`p-6 rounded-lg border-2 ${colorClasses[color]} transition-all hover:shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        {icon && <div className="text-4xl">{icon}</div>}
      </div>
    </div>
  );
}
