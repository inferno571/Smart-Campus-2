import { Layout } from "../components/layout"
import { SafetyAlerts } from "./components/safety-alerts"
import { AlertControls } from "./components/alert-controls"
import { AlertHistory } from "./components/alert-history"

export default function SafetyPage() {
  return (
    <Layout title="Safety Alerts System" backLink="/" backLabel="Home">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Campus Safety Alerts</h2>
          <p className="text-muted-foreground">Real-time safety alerts and emergency notifications powered by Fluvio</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <SafetyAlerts />
          <AlertControls />
        </div>

        <AlertHistory />
      </div>
    </Layout>
  )
}
