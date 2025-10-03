"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { patientSchema, type PatientInput } from "@/lib/validation/patient";
import { formatPhoneNumber } from "@/lib/phone-formatter";
import type { Patient } from "@/hooks/use-patients";
import type { UpdatePatientInput } from "@/lib/validation/patient";

interface PatientEditModalProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedPatient: UpdatePatientInput) => Promise<void>;
}

export function PatientEditModal({ patient, open, onOpenChange, onUpdate }: PatientEditModalProps) {
  const [formData, setFormData] = useState<PatientInput>({
    fullName: "",
    dob: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  // Populate form when patient data is available
  useEffect(() => {
    if (patient) {
      setFormData({
        fullName: patient.fullName,
        dob: patient.dob.split("T")[0], // Convert to YYYY-MM-DD format for date input
        phone: patient.phone || "",
        email: patient.email || "",
      });
      setErrors({});
    }
  }, [patient]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });

    // Clear phone error when user starts typing
    if (errors.phone) {
      setErrors({ ...errors, phone: "" });
    }
  };

  const handleFieldChange =
    (field: keyof PatientInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });

      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors({ ...errors, [field]: "" });
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    try {
      // Validate form data
      const validatedData = patientSchema.parse(formData);

      setIsLoading(true);
      if (!patient?.id) {
        throw new Error("Patient ID is missing");
      }

      await onUpdate({
        id: patient.id,
        ...validatedData,
      });

      toast({
        title: "Success",
        description: "Patient updated successfully",
      });

      onOpenChange(false);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        const validationErrors: Record<string, string> = {};
        // @ts-expect-error ZodError shape with errors property
        error.errors?.forEach((err: { path: string[]; message: string }) => {
          validationErrors[err.path[0]] = err.message;
        });
        setErrors(validationErrors);
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to update patient",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
          <DialogDescription>Update patient information below</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="edit-fullName">Full Name *</Label>
            <Input
              id="edit-fullName"
              value={formData.fullName}
              onChange={handleFieldChange("fullName")}
              placeholder="John Doe"
              className={`rounded-xl ${
                errors.fullName ? "border-red-500 focus:border-red-500" : ""
              }`}
            />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-dob">Date of Birth *</Label>
            <Input
              id="edit-dob"
              type="date"
              value={formData.dob}
              onChange={handleFieldChange("dob")}
              className={`rounded-xl ${errors.dob ? "border-red-500 focus:border-red-500" : ""}`}
            />
            {errors.dob && <p className="text-sm text-red-500">{errors.dob}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-phone">Phone Number *</Label>
            <Input
              id="edit-phone"
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="(555) 123-4567"
              maxLength={14}
              className={`rounded-xl ${errors.phone ? "border-red-500 focus:border-red-500" : ""}`}
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-email">Email *</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={handleFieldChange("email")}
              placeholder="patient@example.com"
              className={`rounded-xl ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 rounded-xl">
              {isLoading ? "Updating..." : "Update Patient"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
