"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RegisterMachineSheet } from "./components/register-machine-sheet";

export default function MachinesPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const { data: machines, isLoading, error } = useQuery({
    queryKey: ["machines"],
    queryFn: async () => {
      const response = await api.get("/api/machines");
      return response.data;
    },
  });

  if (isLoading) return <div className="p-8 text-zinc-500">Loading machines...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load machines.</div>;

  return (
    <div className="p-8 bg-gray-50 dark:bg-zinc-950 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Machine Registry</h1>
          <p className="text-zinc-500 text-sm">Manage and view hardware assets.</p>
        </div>
        {(role === "Admin" || role === "Manager") && (
          <RegisterMachineSheet />
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-gray-200 dark:border-zinc-800">
        <Table>
          <TableCaption>A list of registered machines in the system.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Serial No</TableHead>
              <TableHead>Model & Type</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Install Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {machines?.map((machine: any) => (
              <TableRow key={machine._id}>
                <TableCell className="font-medium">{machine.serialNo}</TableCell>
                <TableCell>{machine.model} ({machine.type})</TableCell>
                <TableCell>{machine.customerId?.name || 'N/A'}</TableCell>
                <TableCell>{new Date(machine.installDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    machine.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    machine.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {machine.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">View</Button>
                </TableCell>
              </TableRow>
            ))}
            {machines?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-zinc-500">
                  No machines found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
