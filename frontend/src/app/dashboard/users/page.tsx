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
import { Trash2 } from "lucide-react";
import { CreateUserSheet } from "./components/create-user-sheet";
import { EditUserSheet } from "./components/edit-user-sheet";

export default function UsersPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get("/api/users");
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete(`/api/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete user");
    },
  });

  if (isLoading) return <div className="p-8 text-zinc-500">Loading users...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load users.</div>;

  return (
    <div className="p-8 bg-gray-50 dark:bg-zinc-950 min-h-screen">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-zinc-500 hover:text-blue-600 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">System Users</h1>
            <p className="text-zinc-500 text-sm">Manage user access, roles, and hierarchy.</p>
          </div>
          {role === "Admin" && (
            <CreateUserSheet />
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-gray-200 dark:border-zinc-800">
        <Table>
          <TableCaption>A comprehensive list of all registered users in the system.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Manager Assigned</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((u: any) => (
              <TableRow key={u._id}>
                <TableCell className="font-medium text-xs font-mono text-zinc-500">
                  {u._id.substring(u._id.length - 8).toUpperCase()}
                </TableCell>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    u.role === 'Admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                    u.role === 'Manager' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                    u.role === 'Engineer' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {u.role}
                  </span>
                </TableCell>
                <TableCell>
                  {u.managerId?.name ? <span className="text-sm">{u.managerId.name}</span> : <span className="text-zinc-400 text-sm italic">-</span>}
                </TableCell>
                <TableCell className="text-right space-x-2 whitespace-nowrap">
                  {role === "Admin" && u.role !== "Admin" && (
                    <>
                      <EditUserSheet user={u} />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => {
                        if(confirm("Are you sure you want to delete this user?")) {
                          deleteMutation.mutate(u._id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {users?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                  No users found in the system.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
