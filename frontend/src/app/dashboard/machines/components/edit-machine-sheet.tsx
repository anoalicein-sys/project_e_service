"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

const editMachineSchema = z.object({
  model: z.string().min(2, "Model is required"),
  location: z.string().optional(),
});

type EditMachineFormValues = z.infer<typeof editMachineSchema>;

export function EditMachineSheet({ machine }: { machine: any }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditMachineFormValues>({
    resolver: zodResolver(editMachineSchema),
    defaultValues: {
      model: machine.model,
      location: machine.location || "",
    }
  });

  useEffect(() => {
    if (open) {
      reset({
        model: machine.model,
        location: machine.location || "",
      });
    }
  }, [open, machine, reset]);

  const editMutation = useMutation({
    mutationFn: async (data: EditMachineFormValues) => {
      const response = await api.patch(`/api/machines/${machine._id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Machine updated successfully");
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update machine");
    },
  });

  const onSubmit = (data: EditMachineFormValues) => {
    editMutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="sm" className="mr-2 border-yellow-200 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-900 dark:text-yellow-400 dark:hover:bg-yellow-950"><Edit2 className="w-4 h-4 mr-1" />Edit</Button>} />
      <SheetContent className="sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle>Edit Machine Details</SheetTitle>
          <SheetDescription>Update model or physical location details.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Model</Label>
            <Input {...register("model")} />
            {errors.model && <p className="text-sm text-red-500">{errors.model.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Physical Location</Label>
            <Input placeholder="e.g. Factory Floor B" {...register("location")} />
          </div>

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
