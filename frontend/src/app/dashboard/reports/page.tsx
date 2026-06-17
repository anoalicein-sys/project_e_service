"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { toast } from "sonner";
import { Download, CheckCircle } from "lucide-react";
import { FeedbackSheet } from "./components/feedback-sheet";

export default function ReportsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const queryClient = useQueryClient();

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ["reports", session?.user?.id],
    queryFn: async () => {
      const response = await api.get("/api/service-reports");
      return response.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await api.patch(`/api/service-reports/${reportId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Report approved successfully");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to approve report");
    },
  });

  const downloadPdf = async (reportId: string, reportNo: string) => {
    try {
      const response = await api.get(`/api/service-reports/${reportId}/pdf`, {
        responseType: 'blob' // Important for handling binary data securely
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ServiceReport_${reportNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("Failed to download PDF. Ensure the backend puppeteer engine is running.");
    }
  };

  if (isLoading) return <div className="p-8 text-zinc-500">Loading reports...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load reports.</div>;

  return (
    <div className="p-8 bg-gray-50 dark:bg-zinc-950 min-h-screen">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-zinc-500 hover:text-blue-600 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Service Reports</h1>
            <p className="text-zinc-500 text-sm">Review, approve, and download completed service logs.</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-gray-200 dark:border-zinc-800">
        <Table>
          <TableCaption>A list of all drafted and approved service reports.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Report No</TableHead>
              <TableHead>Machine</TableHead>
              <TableHead>Engineer</TableHead>
              <TableHead>Action Taken</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports?.map((report: any) => (
              <TableRow key={report._id}>
                <TableCell className="font-medium text-xs font-mono text-zinc-500">
                  {report.reportNo}
                </TableCell>
                <TableCell>
                  {report.machineId?.model} <span className="text-xs text-zinc-400">({report.machineId?.serialNo})</span>
                </TableCell>
                <TableCell>{report.engineerId?.name}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={report.actionTaken}>
                  {report.actionTaken}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.approvalStatus === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {report.approvalStatus}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {(role === "Admin" || role === "Manager") && report.approvalStatus === "Draft" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => approveMutation.mutate(report._id)}
                      disabled={approveMutation.isPending}
                      className="border-green-200 text-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  )}
                  {report.approvalStatus === "Approved" && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => downloadPdf(report._id, report.reportNo)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  )}
                  {role === "Customer" && report.approvalStatus === "Approved" && (
                    <FeedbackSheet reportId={report._id} />
                  )}
                </TableCell>
              </TableRow>
            ))}
            {reports?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                  No service reports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
