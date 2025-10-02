"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCreatePatient } from "@/hooks/use-patients";

export function PatientForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    phone: "",
    email: "",
  });

  const { toast } = useToast();
  const createPatientMutation = useCreatePatient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPatientMutation.mutate(formData, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Patient created successfully",
        });
        setFormData({ fullName: "", dob: "", phone: "", email: "" });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader>
        <CardTitle>Add New Patient</CardTitle>
        <CardDescription>Enter patient information to create a new record</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="John Doe"
              required
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
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
              placeholder="(555) 123-4567"
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

          <Button
            type="submit"
            disabled={createPatientMutation.isPending}
            className="w-full rounded-xl"
          >
            {createPatientMutation.isPending ? "Creating..." : "Create Patient"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
