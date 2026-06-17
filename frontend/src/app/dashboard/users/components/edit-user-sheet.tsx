"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Edit2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const editSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  managerId: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

export function EditUserSheet({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: managers } = useQuery({
    queryKey: ["managers"],
    queryFn: async () => {
      const response = await api.get("/api/users?role=Manager");
      return response.data;
    },
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      managerId: user.managerId?._id || user.managerId,
    }
  });

  const selectedRole = watch("role");

  useEffect(() => {
    if (open) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
        managerId: user.managerId?._id || user.managerId,
      });
    }
  }, [open, user, reset]);

  const editMutation = useMutation({
    mutationFn: async (data: EditFormValues) => {
      const payload = { ...data };
      if (data.role !== "Engineer") delete payload.managerId;
      const response = await api.patch(`/api/users/${user._id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["managers"] });
      queryClient.invalidateQueries({ queryKey: ["engineers"] });
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update user");
    },
  });

  const onSubmit = (data: EditFormValues) => {
    editMutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="sm" className="mr-2 border-yellow-200 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-900 dark:text-yellow-400 dark:hover:bg-yellow-950"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>} />
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit User Profile</SheetTitle>
          <SheetDescription>Update personal details or role assignment.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>System Role</Label>
            <input type="hidden" {...register("role")} />
            <Select value={selectedRole} onValueChange={(value: any) => setValue("role", value, { shouldValidate: true })}>
              <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Administrator</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Engineer">Field Engineer</SelectItem>
                <SelectItem value="Customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedRole === "Engineer" && (
            <div className="space-y-2 border-t pt-4 mt-4 border-gray-100">
              <Label>Assign to Manager</Label>
              <input type="hidden" {...register("managerId")} />
              <Select defaultValue={user.managerId?._id || user.managerId} onValueChange={(value: any) => setValue("managerId", value, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Select Manager" /></SelectTrigger>
                <SelectContent>
                  {managers?.map((manager: any) => (
                    <SelectItem key={manager._id} value={manager._id}>{manager.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button type="button" variant="outline" className="mr-2" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || editMutation.isPending}>
              {isSubmitting || editMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
