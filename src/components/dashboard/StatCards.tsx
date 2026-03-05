import StatCard from "./StatCard"

interface Props {
  presentToday: number
  totalEmployees: number
  pendingLeaves: number
}

export default function StatCards({
  presentToday,
  totalEmployees,
  pendingLeaves
}: Props) {

  return (
    <div className="grid grid-cols-3 gap-6">

      <StatCard
        title="TOTAL PRESENT TODAY"
        value={`${presentToday}/${totalEmployees}`}
      />

      <StatCard
        title="TOTAL EMPLOYEES"
        value={totalEmployees}
      />

      <StatCard
        title="PENDING LEAVE REQUESTS"
        value={pendingLeaves}
      />

    </div>
  )
}