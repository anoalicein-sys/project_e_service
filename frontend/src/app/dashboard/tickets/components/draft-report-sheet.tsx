"use client";

import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { ClipboardList } from "lucide-react";

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

const reportSchema = z.object({
  jobTitle: z.string().min(3, "Job title is required"),
  jobCategory: z.string().min(3, "Category is required"),
  chargesType: z.enum(['Warranty', 'AMC', 'Chargeable', 'FOC']),
  observation: z.string().min(10, "Observation must be at least 10 chars"),
  causeOfFailure: z.string().min(5, "Cause must be detailed"),
  actionTaken: z.string().min(5, "Action taken must be detailed"),
  recommendation: z.string().min(5, "Recommendation is required"),
  hoursWorked: z.number().min(1, "Enter valid hours"),
  plantName: z.string().optional(),
  plantAddress: z.string().optional(),
  attName: z.string().optional(),
  serviceType: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export function DraftReportSheet({ ticketId, machineId }: { ticketId: string, machineId: string }) {
  const [open, setOpen] = useState(false);
  const sigCanvas = useRef<any>(null);
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
  });

  const draftMutation = useMutation({
    mutationFn: async (data: ReportFormValues) => {
      const now = new Date();
      const startTime = new Date(now.getTime() - data.hoursWorked * 60 * 60 * 1000);
      
      const payload = {
        reportNo: `SR-${Math.floor(Math.random() * 1000000)}`,
        machineId,
        requestId: ticketId,
        jobTitle: data.jobTitle,
        jobCategory: data.jobCategory,
        chargesType: data.chargesType,
        observation: data.observation,
        causeOfFailure: data.causeOfFailure,
        actionTaken: data.actionTaken,
        recommendation: data.recommendation,
        plantName: data.plantName || "",
        plantAddress: data.plantAddress || "",
        attName: data.attName || "",
        serviceType: data.serviceType || "On Site",
        engineerSignature: sigCanvas.current?.isEmpty() ? "" : sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png'),
        workTime: [{
          timeFrom: startTime.toISOString(),
          timeUpto: now.toISOString(),
          workTime: data.hoursWorked,
          engineerName: session?.user?.name || "Engineer"
        }]
      };
      const response = await api.post("/api/service-reports", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Service report drafted successfully");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to draft report");
    },
  });

  const onSubmit = (data: ReportFormValues) => {
    draftMutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="sm" className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-950"><ClipboardList className="w-4 h-4 mr-1" />Draft Report</Button>} />
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Draft Service Report</SheetTitle>
          <SheetDescription>
            Document the exact specifications of the service provided.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input placeholder="e.g. Filter Replacement" {...register("jobTitle")} />
              {errors.jobTitle && <p className="text-sm text-red-500">{errors.jobTitle.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input placeholder="e.g. Preventative" {...register("jobCategory")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plant Name</Label>
              <Input placeholder="Customer Plant" {...register("plantName")} />
            </div>
            <div className="space-y-2">
              <Label>Att. Name (Contact)</Label>
              <Input placeholder="Contact Person" {...register("attName")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Plant Address</Label>
            <Input placeholder="Full Address" {...register("plantAddress")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Charges Type</Label>
              <input type="hidden" {...register("chargesType")} />
              <Select onValueChange={(v: any) => setValue("chargesType", v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Warranty">Warranty</SelectItem>
                  <SelectItem value="AMC">AMC</SelectItem>
                  <SelectItem value="Chargeable">Chargeable</SelectItem>
                  <SelectItem value="FOC">FOC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hours Logged</Label>
              <Input type="number" step="0.5" placeholder="Hours" {...register("hoursWorked", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observation</Label>
            <textarea className="flex min-h-[60px] w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm" {...register("observation")} />
            {errors.observation && <p className="text-sm text-red-500">{errors.observation.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Cause of Failure</Label>
            <textarea className="flex min-h-[60px] w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm" {...register("causeOfFailure")} />
          </div>

          <div className="space-y-2">
            <Label>Action Taken</Label>
            <textarea className="flex min-h-[60px] w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm" {...register("actionTaken")} />
          </div>

          <div className="space-y-2">
            <Label>Recommendation</Label>
            <textarea className="flex min-h-[60px] w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm" {...register("recommendation")} />
          </div>

          <div className="space-y-2">
            <Label>Engineer Signature</Label>
            <div className="border border-gray-300 rounded-md bg-white">
              <SignatureCanvas 
                ref={sigCanvas} 
                penColor="black" 
                canvasProps={{width: 500, height: 150, className: 'sigCanvas'}} 
              />
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => sigCanvas.current?.clear()}>Clear Signature</Button>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="button" variant="outline" className="mr-2" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || draftMutation.isPending}>
              {isSubmitting || draftMutation.isPending ? "Submitting..." : "Submit Draft"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
