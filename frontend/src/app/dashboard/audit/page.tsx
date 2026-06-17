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
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function AuditPage() {
  const { data: session } = useSession();

  // strict client side redirection
  if (session && session.user.role !== "Admin") {
    redirect("/dashboard");
  }

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ["audit"],
    queryFn: async () => {
      const response = await api.get("/api/audit");
      return response.data;
    },
    enabled: session?.user?.role === "Admin",
  });

  if (isLoading) return <div className="p-8 text-zinc-500">Loading audit logs...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load audit logs.</div>;

  return (
    <div className="p-8 bg-gray-50 dark:bg-zinc-950 min-h-screen">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-zinc-500 hover:text-blue-600 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">System Audit Logs</h1>
        <p className="text-zinc-500 text-sm">Immutable records of system actions and data alterations.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-gray-200 dark:border-zinc-800">
        <Table>
          <TableCaption>Last 100 system mutations.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actor (User)</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target Model</TableHead>
              <TableHead>Target ID</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map((log: any) => (
              <TableRow key={log._id}>
                <TableCell className="font-mono text-xs text-zinc-500">
                  {new Date(log.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="font-medium">
                  {log.userId?.name || 'Unknown'} <span className="text-zinc-400 font-normal text-xs">({log.userId?.email || 'N/A'})</span>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-xs font-semibold">
                    {log.action}
                  </span>
                </TableCell>
                <TableCell>{log.targetModel}</TableCell>
                <TableCell className="font-mono text-xs text-zinc-500">
                  {log.targetId}
                </TableCell>
                <TableCell className="font-mono text-xs text-zinc-500">
                  {log.details?.ip || 'N/A'}
                </TableCell>
              </TableRow>
            ))}
            {logs?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                  No audit logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
