interface DashboardStatCardProps {
  title: string
  value: string | number
  icon?: string
  color?: string
}

export default function DashboardStatCard({
  title,
  value,
  icon,
  color = "bg-blue-100 text-blue-600"
}: DashboardStatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between">

        <div>
          <p className="text-xs tracking-wide text-gray-500 uppercase">
            {title}
          </p>

          <h3 className="text-2xl font-semibold mt-1 text-gray-900">
            {value}
          </h3>
        </div>

        {icon && (
           <img
          src={icon}
          className="w-8 h-8 m-2"
          alt={title}
          />
        )}

      </div>
    </div>
  )
}