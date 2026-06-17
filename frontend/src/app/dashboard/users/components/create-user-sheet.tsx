"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { UserPlus, Eye, EyeOff, PlusCircle } from "lucide-react";

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

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["Admin", "Manager", "Engineer", "Customer"]),
  managerId: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

export function CreateUserSheet() {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
  });

  const selectedRole = watch("role");

  const createMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const response = await api.post("/api/users", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["managers"] });
      queryClient.invalidateQueries({ queryKey: ["engineers"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create user");
    },
  });

  const onSubmit = (data: UserFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button className="flex items-center gap-2"><UserPlus className="w-4 h-4" />Create User</Button>} />
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create System User</SheetTitle>
          <SheetDescription>
            Add a new user, assign their role, and map them to a manager if applicable.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input placeholder="John Doe" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input type="email" placeholder="john@example.com" {...register("email")} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Temporary Password</Label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} placeholder="SecurePassword123!" {...register("password")} className="pr-10" />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>System Role</Label>
            <input type="hidden" {...register("role")} />
            <Select onValueChange={(value: any) => setValue("role", value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Engineer">Engineer</SelectItem>
                <SelectItem value="Customer">Customer</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
          </div>

          {selectedRole === "Engineer" && (
            <div className="space-y-2 border-t pt-4 mt-4 border-gray-100">
              <Label>Assign to Manager</Label>
              <input type="hidden" {...register("managerId")} />
              <Select onValueChange={(value: any) => setValue("managerId", value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Manager" />
                </SelectTrigger>
                <SelectContent>
                  {managers?.map((mgr: any) => (
                    <SelectItem key={mgr._id} value={mgr._id}>{mgr.name}</SelectItem>
                  ))}
                  {managers?.length === 0 && <SelectItem value="none" disabled>No managers found</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="pt-6 flex justify-end">
            <Button type="button" variant="outline" className="mr-2" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
              {isSubmitting || createMutation.isPending ? "Creating..." : "Save User"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
