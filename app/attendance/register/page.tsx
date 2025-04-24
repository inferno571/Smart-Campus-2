import { Layout } from "../../components/layout"
import { StudentRegistrationForm } from "./components/student-registration-form"

export default function StudentRegistrationPage() {
  return (
    <Layout title="Student Registration" backLink="/attendance" backLabel="Attendance">
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Student Registration</h2>
          <p className="text-muted-foreground">Register students for facial recognition attendance tracking</p>
        </div>

        <StudentRegistrationForm />
      </div>
    </Layout>
  )
}
