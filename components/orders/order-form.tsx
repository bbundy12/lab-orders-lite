"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/date";
import { calcTotal, calcEta, formatMoney } from "@/lib/calculations";
import { usePatients } from "@/hooks/use-patients";
import { useLabTests } from "@/hooks/use-tests";
import { useCreateOrder } from "@/hooks/use-orders";

export function OrderForm() {
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const router = useRouter();

  const { data: patients = [] } = usePatients();
  const { data: tests = [] } = useLabTests(true); // activeOnly = true
  const createOrderMutation = useCreateOrder();

  const handleTestToggle = (testId: string) => {
    const newSelected = new Set(selectedTests);
    if (newSelected.has(testId)) {
      newSelected.delete(testId);
    } else {
      newSelected.add(testId);
    }
    setSelectedTests(newSelected);
  };

  const selectedTestsData = tests.filter((test) => selectedTests.has(test.id));
  const orderItems = selectedTestsData.map((test) => ({
    labTestId: test.id,
    unitPriceCents: test.priceCents,
    turnaroundDaysAtOrder: test.turnaroundDays,
  }));

  const totalCents = orderItems.length > 0 ? calcTotal(orderItems) : 0;
  const estimatedReadyAt = orderItems.length > 0 ? calcEta(new Date(), orderItems) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatientId) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }

    if (selectedTests.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one test",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate(
      { patientId: selectedPatientId, items: orderItems },
      {
        onSuccess: (data) => {
          toast({
            title: "Success",
            description: "Order created successfully",
          });
          router.push(`/orders/${data.id}`);
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

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
                    {patient.fullName}
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
                      <label
                        htmlFor={test.id}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {test.code} - {test.name}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {formatMoney(test.priceCents)} • {test.turnaroundDays} days
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
                <span className="font-semibold">{formatMoney(totalCents)}</span>
              </div>
              {estimatedReadyAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Ready:</span>
                  <span className="font-semibold">{formatDate(estimatedReadyAt)}</span>
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={createOrderMutation.isPending}
            className="w-full rounded-xl"
          >
            {createOrderMutation.isPending ? "Creating..." : "Create Order"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
