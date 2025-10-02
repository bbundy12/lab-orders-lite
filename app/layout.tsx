import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { QueryProvider } from "@/lib/query-client"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import Link from "next/link"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Lab Orders Lite",
  description: "Clinic lab order management system",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <QueryProvider>
            <div className="min-h-screen bg-slate-50">
              <nav className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                  <div className="flex items-center justify-between">
                    <Link href="/" className="text-xl font-semibold text-slate-900">
                      Lab Orders Lite
                    </Link>
                    <div className="flex gap-6">
                      <Link href="/patients" className="text-slate-600 hover:text-slate-900 transition-colors">
                        Patients
                      </Link>
                      <Link href="/tests" className="text-slate-600 hover:text-slate-900 transition-colors">
                        Tests
                      </Link>
                      <Link href="/orders" className="text-slate-600 hover:text-slate-900 transition-colors">
                        Orders
                      </Link>
                    </div>
                  </div>
                </div>
              </nav>
              <main>{children}</main>
            </div>
            <Toaster />
          </QueryProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
