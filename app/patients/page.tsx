import { PatientForm } from "@/components/patients/patient-form"
import { PatientsTable } from "@/components/patients/patients-table"

export default function PatientsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Patient Management</h1>
        <p className="text-slate-600 text-lg">Add and manage patient records</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <PatientForm />
        </div>
        <div className="lg:col-span-2">
          <PatientsTable />
        </div>
      </div>
    </div>
  )
}
