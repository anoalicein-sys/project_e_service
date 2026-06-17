"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { PlusCircle } from "lucide-react";

const ticketSchema = z.object({
  machineId: z.string().min(1, "Please select a machine"),
  issueDescription: z.string().min(10, "Description must be at least 10 characters"),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export function CreateTicketSheet() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: session } = useSession();

  const { data: machines, isLoading: machinesLoading } = useQuery({
    queryKey: ["machines", session?.user?.id],
    queryFn: async () => {
      const response = await api.get("/api/machines");
      return response.data;
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
  });

  const createMutation = useMutation({
    mutationFn: async (data: TicketFormValues) => {
      const response = await api.post("/api/service-requests", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Service ticket created successfully");
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create ticket");
    },
  });

  const onSubmit = (data: TicketFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button className="flex items-center gap-2"><PlusCircle className="w-4 h-4" />Create Ticket</Button>} />
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>File a Service Request</SheetTitle>
          <SheetDescription>
            Report an issue with your registered hardware. Our dispatch team will review and assign an engineer.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label>Select Machine</Label>
            <input type="hidden" {...register("machineId")} />
            <Select onValueChange={(value: any) => setValue("machineId", value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder={machinesLoading ? "Loading machines..." : "Select a machine"} />
              </SelectTrigger>
              <SelectContent>
                {machines?.map((machine: any) => (
                  <SelectItem key={machine._id} value={machine._id}>
                    {machine.model} ({machine.serialNo}) {session?.user?.role !== 'Customer' && machine.customerId?.name ? `- ${machine.customerId.name}` : ''}
                  </SelectItem>
                ))}
                {machines?.length === 0 && (
                  <SelectItem value="none" disabled>No machines found</SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.machineId && (
              <p className="text-sm text-red-500">{errors.machineId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="issueDescription">Issue Description</Label>
            <textarea
              id="issueDescription"
              className="flex min-h-[120px] w-full rounded-md border border-gray-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Please describe the anomalies or failure codes you are observing..."
              {...register("issueDescription")}
            />
            {errors.issueDescription && (
              <p className="text-sm text-red-500">{errors.issueDescription.message}</p>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="button" variant="outline" className="mr-2" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
              {isSubmitting || createMutation.isPending ? "Submitting..." : "Submit Ticket"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
