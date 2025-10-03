import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { UserCircle, Beaker, ClipboardCheck, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:min-h-[600px]">
            {/* Left: Clean text content with soft gradient background */}
            <div className="relative z-10 px-6 py-20 lg:py-32 lg:w-1/2 lg:pr-12">
              <div className="space-y-8 max-w-xl">
                <div className="space-y-6">
                  <h1 className="text-6xl lg:text-7xl font-bold text-slate-900 leading-tight tracking-tight">
                    Lab Orders Lite
                  </h1>
                  <p className="text-xl text-slate-600 leading-relaxed font-light">
                    Easily manage lab tests and orders with automatic cost and turnaround tracking.
                  </p>
                </div>

                <div className="pt-2">
                  <Link href="/orders/new">
                    <Button
                      size="lg"
                      className="rounded-2xl text-lg px-10 py-7 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
                    >
                      Create Your First Order
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Modern lab image */}
            <div className="lg:w-1/2 lg:absolute lg:right-0 lg:top-0 lg:bottom-0">
              <div className="h-full min-h-[400px] lg:min-h-[600px] bg-white flex items-center justify-center lg:justify-end">
                <Image
                  src="/medical-professional-with-clipboard-and-lab-equipm.jpg"
                  alt="Modern lab environment"
                  width={1600}
                  height={900}
                  className="w-full h-full object-contain object-center lg:object-right"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Key Features</h2>
            <p className="text-lg text-slate-600">
              Everything you need to manage lab orders efficiently
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-0 bg-white">
              <CardHeader className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <UserCircle className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Patient Management</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Easily manage patient profiles and contact details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/patients">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-2 hover:bg-slate-50 bg-transparent"
                  >
                    Manage Patients
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-0 bg-white">
              <CardHeader className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center">
                  <Beaker className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Lab Test Catalog</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Keep track of all available lab tests with pricing and turnaround times.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/tests">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-2 hover:bg-slate-50 bg-transparent"
                  >
                    View Tests
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-0 bg-white">
              <CardHeader className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center">
                  <ClipboardCheck className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Order Management</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Create orders with automatic cost calculation and estimated completion dates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/orders">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-2 hover:bg-slate-50 bg-transparent"
                  >
                    View Orders
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600">A simple process for managing lab orders</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="relative pt-8">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-semibold z-10">
                1
              </div>
              <div className="border-2 border-slate-200 rounded-2xl p-6 pt-10 bg-white h-full">
                <h3 className="font-bold text-xl mb-3 text-slate-900 text-center">Add Patients</h3>
                <p className="text-slate-600 leading-relaxed text-center">
                  Register patient information with contact details and medical history.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative pt-8">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-semibold z-10">
                2
              </div>
              <div className="border-2 border-slate-200 rounded-2xl p-6 pt-10 bg-white h-full">
                <h3 className="font-bold text-xl mb-3 text-slate-900 text-center">Setup Tests</h3>
                <p className="text-slate-600 leading-relaxed text-center">
                  Configure lab tests with pricing and turnaround time for accurate estimates.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative pt-8">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-semibold z-10">
                3
              </div>
              <div className="border-2 border-slate-200 rounded-2xl p-6 pt-10 bg-white h-full">
                <h3 className="font-bold text-xl mb-3 text-slate-900 text-center">Create Orders</h3>
                <p className="text-slate-600 leading-relaxed text-center">
                  Select patient and tests; totals and estimated dates calculated automatically.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative pt-8">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-semibold z-10">
                4
              </div>
              <div className="border-2 border-slate-200 rounded-2xl p-6 pt-10 bg-white h-full">
                <h3 className="font-bold text-xl mb-3 text-slate-900 text-center">Track Status</h3>
                <p className="text-slate-600 leading-relaxed text-center">
                  Monitor order progress from submission to completion with real-time updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-50 py-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-600">© 2025 Lab Orders Lite — Built for clinic efficiency.</p>
        </div>
      </footer>
    </main>
  );
}
