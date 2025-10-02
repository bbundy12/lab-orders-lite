"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/date"
import { calcTotal, calcEta } from "@/lib/calculations"

interface Patient {
  id: string
  name: string
}

interface Test {
  id: string
  code: string
  name: string
  priceCents: number
  turnaroundDays: number
  isActive: boolean
}

export function OrderForm() {
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: async () => {
      const response = await fetch("/api/patients")
      if (!response.ok) throw new Error("Failed to fetch patients")
      return response.json()
    },
  })

  const { data: tests = [] } = useQuery<Test[]>({
    queryKey: ["tests", "active"],
    queryFn: async () => {
      const response = await fetch("/api/tests?activeOnly=1")
      if (!response.ok) throw new Error("Failed to fetch tests")
      return response.json()
    },
  })

  const createOrder = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create order")
      }

      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast({
        title: "Success",
        description: "Order created successfully",
      })
      router.push(`/orders/${data.id}`)
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleTestToggle = (testId: string) => {
    const newSelected = new Set(selectedTests)
    if (newSelected.has(testId)) {
      newSelected.delete(testId)
    } else {
      newSelected.add(testId)
    }
    setSelectedTests(newSelected)
  }

  const selectedTestsData = tests.filter((test) => selectedTests.has(test.id))
  const orderItems = selectedTestsData.map((test) => ({
    testId: test.id,
    unitPriceCents: test.priceCents,
    turnaroundDaysAtOrder: test.turnaroundDays,
  }))

  const totalCents = orderItems.length > 0 ? calcTotal(orderItems) : 0
  const estimatedReadyAt = orderItems.length > 0 ? calcEta(new Date(), orderItems) : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPatientId) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive",
      })
      return
    }

    if (selectedTests.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one test",
        variant: "destructive",
      })
      return
    }

    createOrder.mutate({
      patientId: selectedPatientId,
      items: orderItems,
    })
  }

  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader>
        <CardTitle>Create New Order</CardTitle>
        <CardDescription>Select patient and tests to create a lab order</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="patient">Patient</Label>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger id="patient" className="rounded-xl">
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Select Tests</Label>
            <div className="space-y-3 max-h-64 overflow-y-auto rounded-xl border p-4">
              {tests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active tests available</p>
              ) : (
                tests.map((test) => (
                  <div key={test.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={test.id}
                      checked={selectedTests.has(test.id)}
                      onCheckedChange={() => handleTestToggle(test.id)}
                    />
                    <div className="flex-1">
                      <label htmlFor={test.id} className="text-sm font-medium leading-none cursor-pointer">
                        {test.code} - {test.name}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        ${(test.priceCents / 100).toFixed(2)} • {test.turnaroundDays} days
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedTests.size > 0 && (
            <div className="rounded-xl bg-slate-50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Cost:</span>
                <span className="font-semibold">${(totalCents / 100).toFixed(2)}</span>
              </div>
              {estimatedReadyAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Ready:</span>
                  <span className="font-semibold">{formatDate(estimatedReadyAt)}</span>
                </div>
              )}
            </div>
          )}

          <Button type="submit" disabled={createOrder.isPending} className="w-full rounded-xl">
            {createOrder.isPending ? "Creating..." : "Create Order"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
