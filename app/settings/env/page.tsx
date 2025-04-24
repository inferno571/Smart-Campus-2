import { Layout } from "../../components/layout"
import { EnvVariablesDisplay } from "./components/env-variables-display"

export default function EnvVariablesPage() {
  return (
    <Layout title="Environment Variables" backLink="/settings" backLabel="Settings">
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Environment Variables</h2>
          <p className="text-muted-foreground">View the environment variables used by the Smart Campus Toolkit</p>
        </div>

        <EnvVariablesDisplay />
      </div>
    </Layout>
  )
}
