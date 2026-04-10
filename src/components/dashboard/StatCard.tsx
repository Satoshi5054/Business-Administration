interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  color?: string;
}

export default function DashboardStatCard({
  title,
  value,
  icon,
  color = "bg-blue-100 text-blue-600",
}: DashboardStatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] tracking-wide text-gray-500 uppercase">
            {title}
          </p>

          <h3 className="text-xl font-semibold mt-0.5 text-gray-900">
            {value}
          </h3>
        </div>

        {icon && <img src={icon} className="w-6 h-6" alt={title} />}
      </div>
    </div>
  );
}
