"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

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

const machineSchema = z.object({
  customerId: z.string().min(24, "Invalid Customer ID").optional(),
  type: z.string().min(2, "Type is required"),
  model: z.string().min(2, "Model is required"),
  serialNo: z.string().min(3, "Serial Number is required"),
  installDate: z.string().min(1, "Install date is required"),
});

type MachineFormValues = z.infer<typeof machineSchema>;

export function RegisterMachineSheet() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await api.get("/api/users?role=Customer");
      return response.data;
    },
    enabled: open && (session?.user?.role === "Admin" || session?.user?.role === "Manager"),
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MachineFormValues>({
    resolver: zodResolver(machineSchema),
  });

  const createMutation = useMutation({
    mutationFn: async (data: MachineFormValues) => {
      // If the user is a customer, the backend extracts customerId from the token.
      // But Admin/Manager must provide a customer ID (we will use a manual input or default to their ID for simplicity right now).
      const payload = {
        ...data,
        customerId: data.customerId || session?.user?.id, 
        installDate: new Date(data.installDate).toISOString(),
      };
      const response = await api.post("/api/machines", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Machine registered successfully");
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      setOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to register machine");
    },
  });

  const onSubmit = (data: MachineFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button>Register New Machine</Button>} />
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Register Machine</SheetTitle>
          <SheetDescription>
            Enter the hardware details below to add a new machine to the registry.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {(session?.user?.role === "Admin" || session?.user?.role === "Manager") && (
            <div className="space-y-2">
              <Label>Select Customer</Label>
              <input type="hidden" {...register("customerId")} />
              <Select onValueChange={(value: any) => setValue("customerId", value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder={customersLoading ? "Loading customers..." : "Select a customer"} />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((customer: any) => (
                    <SelectItem key={customer._id} value={customer._id}>
                      {customer.name} ({customer.email})
                    </SelectItem>
                  ))}
                  {customers?.length === 0 && (
                    <SelectItem value="none" disabled>No customers found</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.customerId && (
                <p className="text-sm text-red-500">{errors.customerId.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="type">Machine Type</Label>
            <Input id="type" placeholder="e.g. Generator" {...register("type")} />
            {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input id="model" placeholder="e.g. RX-5000" {...register("model")} />
            {errors.model && <p className="text-sm text-red-500">{errors.model.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNo">Serial Number</Label>
            <Input id="serialNo" placeholder="e.g. SN-987654321" {...register("serialNo")} />
            {errors.serialNo && (
              <p className="text-sm text-red-500">{errors.serialNo.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="installDate">Install Date</Label>
            <Input id="installDate" type="date" {...register("installDate")} />
            {errors.installDate && (
              <p className="text-sm text-red-500">{errors.installDate.message}</p>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="button" variant="outline" className="mr-2" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
              {isSubmitting || createMutation.isPending ? "Registering..." : "Save Machine"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
