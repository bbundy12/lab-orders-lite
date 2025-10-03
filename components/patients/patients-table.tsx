"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { formatDate } from "@/lib/date";
import { Search, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePatients, type Patient, useUpdatePatient } from "@/hooks/use-patients";
import type { UpdatePatientInput } from "@/lib/validation/patient";
import { PatientEditModal } from "./patient-edit-modal";

export function PatientsTable() {
  const [search, setSearch] = useState("");
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: patients = [], isLoading } = usePatients({ query: search, field: "all" });
  const updatePatientMutation = useUpdatePatient();

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsEditModalOpen(true);
  };

  const handleUpdatePatient = async (updatedPatient: UpdatePatientInput) => {
    if (!updatedPatient?.id) {
      console.error("❌ Cannot update patient without ID", updatedPatient);
      return;
    }

    try {
      await updatePatientMutation.mutateAsync(updatedPatient);

      setIsEditModalOpen(false);
      setEditingPatient(null);
    } catch (error) {
      console.error("❌ Failed to update patient:", error);
    }
  };

  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader className="gap-2">
        <CardTitle>Patients</CardTitle>
        <CardDescription>View and search all registered patients</CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, or birthdate year..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl h-9"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading patients...</div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {search
              ? `No patients found matching "${search}"`
              : "No patients yet. Add your first patient above."}
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.fullName}</TableCell>
                    <TableCell>{formatDate(patient.dob)}</TableCell>
                    <TableCell>{patient.phone || "—"}</TableCell>
                    <TableCell>{patient.email || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(patient.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPatient(patient)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <PatientEditModal
        patient={editingPatient}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onUpdate={handleUpdatePatient}
      />
    </Card>
  );
}
