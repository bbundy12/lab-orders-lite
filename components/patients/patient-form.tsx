"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { PatientInput } from "@/lib/validation/patient"

export function PatientForm() {
  const [formData, setFormData] = useState<PatientInput>({
    name: "",
    dateOfBirth: "",
    phone: "",
    email: "",
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const createPatient = useMutation({
    mutationFn: async (data: PatientInput) => {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create patient")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
      toast({
        title: "Success",
        description: "Patient created successfully",
      })
      setFormData({ name: "", dateOfBirth: "", phone: "", email: "" })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createPatient.mutate(formData)
  }

  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader>
        <CardTitle>Add New Patient</CardTitle>
        <CardDescription>Enter patient information to create a new record</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              required
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="555-0123"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="patient@example.com"
              className="rounded-xl"
            />
          </div>

          <Button type="submit" disabled={createPatient.isPending} className="w-full rounded-xl">
            {createPatient.isPending ? "Creating..." : "Create Patient"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
