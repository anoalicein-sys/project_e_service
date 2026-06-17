"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const assignSchema = z.object({
  assignedEngineerId: z.string().min(1, "Please select an engineer"),
});

type AssignFormValues = z.infer<typeof assignSchema>;

export function AssignEngineerSheet({ ticketId }: { ticketId: string }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: engineers, isLoading } = useQuery({
    queryKey: ["engineers"],
    queryFn: async () => {
      const response = await api.get("/api/users?role=Engineer");
      return response.data;
    },
    enabled: open, // Only fetch when sheet opens
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AssignFormValues>({
    resolver: zodResolver(assignSchema),
  });

  const assignMutation = useMutation({
    mutationFn: async (data: AssignFormValues) => {
      const response = await api.patch(`/api/service-requests/${ticketId}/assign`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Engineer assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to assign engineer");
    },
  });

  const onSubmit = (data: AssignFormValues) => {
    assignMutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950">Assign</Button>} />
      <SheetContent className="sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle>Assign Field Engineer</SheetTitle>
          <SheetDescription>
            Select an available engineer to dispatch for this service ticket.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label>Select Engineer</Label>
            <input type="hidden" {...register("assignedEngineerId")} />
            <Select onValueChange={(value: any) => setValue("assignedEngineerId", value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading engineers..." : "Select an engineer"} />
              </SelectTrigger>
              <SelectContent>
                {engineers?.map((engineer: any) => (
                  <SelectItem key={engineer._id} value={engineer._id}>
                    {engineer.name} ({engineer.email})
                  </SelectItem>
                ))}
                {engineers?.length === 0 && (
                  <SelectItem value="none" disabled>No engineers found in system</SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.assignedEngineerId && (
              <p className="text-sm text-red-500">{errors.assignedEngineerId.message}</p>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="button" variant="outline" className="mr-2" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || assignMutation.isPending}>
              {isSubmitting || assignMutation.isPending ? "Assigning..." : "Confirm Dispatch"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
