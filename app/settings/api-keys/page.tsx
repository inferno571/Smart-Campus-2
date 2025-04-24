import { Layout } from "../../components/layout"
import { ApiKeysManager } from "./components/api-keys-manager"

export default function ApiKeysPage() {
  return (
    <Layout title="API Keys Management" backLink="/settings" backLabel="Settings">
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">API Keys Management</h2>
          <p className="text-muted-foreground">Securely manage API keys for integrated services</p>
        </div>

        <ApiKeysManager />
      </div>
    </Layout>
  )
}
