interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color: "green" | "yellow" | "red" | "blue";
}

/**
 * Composant pour afficher une carte de statistique
 */
export default function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorGradients = {
    green: "from-emerald-400 to-teal-500 shadow-emerald-500/20",
    yellow: "from-amber-400 to-orange-500 shadow-amber-500/20",
    red: "from-rose-400 to-red-500 shadow-rose-500/20",
    blue: "from-sky-400 to-indigo-500 shadow-blue-500/20",
  };

  return (
    <div className="card-premium !p-4 sm:!p-6 group hover:scale-[1.02] active:scale-[0.98]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-tight">{title}</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
            {value}
          </p>
        </div>
        {icon && (
          <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${colorGradients[color]} rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl shadow-clay-btn transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center text-xs">
        <span className="text-slate-400 dark:text-slate-500">Mise à jour en temps réel</span>
      </div>
    </div>
  );
}
