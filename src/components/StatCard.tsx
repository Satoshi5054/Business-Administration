interface StatCardProps {
  title: string
  value: number
  icon?: React.ReactNode
  displayValue?: string
  color?: string
}

export function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-semibold mt-1 text-gray-900">
            {value}
          </h3>
        </div>

        {icon && (
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full ${color}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

