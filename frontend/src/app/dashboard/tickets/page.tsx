"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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
import { CreateTicketSheet } from "./components/create-ticket-sheet";
import { AssignEngineerSheet } from "./components/assign-engineer-sheet";
import { DraftReportSheet } from "./components/draft-report-sheet";

export default function TicketsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const { data: tickets, isLoading, error } = useQuery({
    queryKey: ["tickets", session?.user?.id],
    queryFn: async () => {
      const response = await api.get("/api/service-requests");
      return response.data;
    },
  });

  if (isLoading) return <div className="p-8 text-zinc-500">Loading tickets...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load tickets.</div>;

  return (
    <div className="p-8 bg-gray-50 dark:bg-zinc-950 min-h-screen">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-zinc-500 hover:text-blue-600 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Service Tickets</h1>
            <p className="text-zinc-500 text-sm">Manage hardware anomalies and dispatch requests.</p>
          </div>
          {(role === "Admin" || role === "Customer") && (
            <CreateTicketSheet />
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-gray-200 dark:border-zinc-800">
        <Table>
          <TableCaption>A list of active and closed service tickets.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>Machine</TableHead>
              {role !== "Customer" && <TableHead>Customer</TableHead>}
              <TableHead>Issue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Engineer</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets?.map((ticket: any) => (
              <TableRow key={ticket._id}>
                <TableCell className="font-medium text-xs font-mono text-zinc-500">
                  {ticket._id.substring(ticket._id.length - 8).toUpperCase()}
                </TableCell>
                <TableCell>
                  {ticket.machineId?.model} <span className="text-xs text-zinc-400">({ticket.machineId?.serialNo})</span>
                </TableCell>
                {role !== "Customer" && (
                  <TableCell>{ticket.customerId?.name || 'N/A'}</TableCell>
                )}
                <TableCell className="max-w-[200px] truncate" title={ticket.issueDescription}>
                  {ticket.issueDescription}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'Open' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                    ticket.status === 'Assigned' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {ticket.status}
                  </span>
                </TableCell>
                <TableCell>
                  {ticket.assignedEngineerId?.name ? (
                    <span className="text-sm">{ticket.assignedEngineerId.name}</span>
                  ) : (
                    <span className="text-sm text-zinc-400 italic">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {(role === "Admin" || role === "Manager") && ticket.status === "Open" && (
                    <AssignEngineerSheet ticketId={ticket._id} />
                  )}
                  {role === "Engineer" && ticket.status === "Assigned" && (
                    <DraftReportSheet ticketId={ticket._id} machineId={ticket.machineId?._id} />
                  )}
                  <Button variant="ghost" size="sm">Details</Button>
                </TableCell>
              </TableRow>
            ))}
            {tickets?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                  No service tickets found. Everything is operating smoothly.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
