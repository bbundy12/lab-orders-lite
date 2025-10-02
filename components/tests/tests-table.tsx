"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLabTests, useUpdateLabTest } from "@/hooks/use-tests";
import { formatMoney } from "@/lib/calculations";

export function TestsTable() {
  const { toast } = useToast();
  const { data: tests = [], isLoading } = useLabTests();
  const updateLabTestMutation = useUpdateLabTest();

  const handleToggleActive = (testId: string, currentStatus: boolean) => {
    updateLabTestMutation.mutate(
      { id: testId, input: { isActive: !currentStatus } },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Test status updated",
          });
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
        <CardTitle>Lab Tests Catalog</CardTitle>
        <CardDescription>Manage available lab tests and pricing</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading tests...</div>
        ) : tests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No tests yet. Add your first test above.</div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Turnaround</TableHead>
                  <TableHead>Status</TableHeader>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-mono font-medium">{test.code}</TableCell>
                    <TableCell>{test.name}</TableCell>
                    <TableCell>{formatMoney(test.priceCents)}</TableCell>
                    <TableCell>{test.turnaroundDays} days</TableCell>
                    <TableCell>
                      <Badge variant={test.isActive ? "default" : "secondary"} className="rounded-lg">
                        {test.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(test.id, test.isActive)}
                        disabled={updateLabTestMutation.isPending}
                        className="rounded-lg"
                      >
                        {test.isActive ? "Deactivate" : "Activate"}
                      </Button>
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