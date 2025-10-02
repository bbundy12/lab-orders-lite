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
import { Search } from "lucide-react";
import { usePatients } from "@/hooks/use-patients";

export function PatientsTable() {
  const [search, setSearch] = useState("");
  const { data: patients = [], isLoading } = usePatients(search);

  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader>
        <CardTitle>Patients</CardTitle>
        <CardDescription>View and search all registered patients</CardDescription>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading patients...</div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {search
              ? "No patients found matching your search"
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
