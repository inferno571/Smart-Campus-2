import { Layout } from "../components/layout"
import { EnergyOverview } from "./components/energy-overview"
import { EnergyUsageChart } from "./components/energy-usage-chart"
import { BuildingEnergyTable } from "./components/building-energy-table"
import { AnomalyDetection } from "./components/anomaly-detection"

export default function EnergyPage() {
  return (
    <Layout title="Energy Dashboard" backLink="/" backLabel="Home">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Campus Energy Insights</h2>
          <p className="text-muted-foreground">Monitor and analyze energy consumption with Groq-powered analytics</p>
        </div>

        <EnergyOverview />

        <div className="grid gap-6 md:grid-cols-2">
          <EnergyUsageChart />
          <AnomalyDetection />
        </div>

        <BuildingEnergyTable />
      </div>
    </Layout>
  )
}
