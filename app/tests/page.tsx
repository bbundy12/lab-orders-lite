import { TestForm } from "@/components/tests/test-form"
import { TestsTable } from "@/components/tests/tests-table"

export default function TestsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Lab Tests</h1>
        <p className="text-slate-600 text-lg">Manage your lab test catalog and pricing</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TestForm />
        </div>
        <div className="lg:col-span-2">
          <TestsTable />
        </div>
      </div>
    </div>
  )
}
