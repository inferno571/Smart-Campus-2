import { Layout } from "../components/layout"
import { SchoolConfigForm } from "./components/school-config-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Server, Key } from "lucide-react"

export default function SettingsPage() {
  return (
    <Layout title="Settings" backLink="/" backLabel="Home">
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 fade-in">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">School Configuration</h2>
            <p className="text-muted-foreground">Customize the Smart Campus Toolkit for your educational institution</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild className="button-hover">
              <Link href="/settings/env" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Environment Variables
              </Link>
            </Button>
            <Button variant="outline" asChild className="button-hover">
              <Link href="/settings/api-keys" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Keys
              </Link>
            </Button>
          </div>
        </div>

        <div className="slide-up">
          <SchoolConfigForm />
        </div>
      </div>
    </Layout>
  )
}
