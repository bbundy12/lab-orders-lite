"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCreateLabTest } from "@/hooks/use-tests";

export function TestForm() {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    priceCents: 0,
    turnaroundDays: 1,
    isActive: true,
  });

  const { toast } = useToast();
  const createLabTestMutation = useCreateLabTest();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLabTestMutation.mutate(formData, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Lab test created successfully",
        });
        setFormData({ code: "", name: "", priceCents: 0, turnaroundDays: 1, isActive: true });
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
        <CardTitle>Add New Lab Test</CardTitle>
        <CardDescription>Create a new lab test in the catalog</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code">Test Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="CBC"
              required
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Test Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Complete Blood Count"
              required
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.priceCents / 100}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priceCents: Math.round(Number.parseFloat(e.target.value) * 100),
                })
              }
              placeholder="45.00"
              required
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <>
              <Label htmlFor="turnaround">Turnaround Days</Label>
              <Input
                id="turnaround"
                type="number"
                min="1"
                value={formData.turnaroundDays}
                onChange={(e) =>
                  setFormData({ ...formData, turnaroundDays: Number.parseInt(e.target.value) })
                }
                required
                className="rounded-xl"
              />
            </>
          </div>

          <Button
            type="submit"
            disabled={createLabTestMutation.isPending}
            className="w-full rounded-xl"
          >
            {createLabTestMutation.isPending ? "Creating..." : "Create Test"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
