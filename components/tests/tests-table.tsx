"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface Test {
  id: string
  code: string
  name: string
  priceCents: number
  turnaroundDays: number
  isActive: boolean
}

export function TestsTable() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: tests = [], isLoading } = useQuery<Test[]>({
    queryKey: ["tests"],
    queryFn: async () => {
      const response = await fetch("/api/tests")
      if (!response.ok) throw new Error("Failed to fetch tests")
      return response.json()
    },
  })

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch(`/api/tests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })

      if (!response.ok) throw new Error("Failed to update test")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] })
      toast({
        title: "Success",
        description: "Test status updated",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

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
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-mono font-medium">{test.code}</TableCell>
                    <TableCell>{test.name}</TableCell>
                    <TableCell>{formatPrice(test.priceCents)}</TableCell>
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
                        onClick={() => toggleActive.mutate({ id: test.id, isActive: !test.isActive })}
                        disabled={toggleActive.isPending}
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
  )
}
