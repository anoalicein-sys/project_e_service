"use client";

import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { MessageSquare } from "lucide-react";

const feedbackSchema = z.object({
  rating: z.string(),
  comments: z.string().min(5, "Comments must be at least 5 characters"),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export function FeedbackSheet({ reportId }: { reportId: string }) {
  const [open, setOpen] = useState(false);
  const sigCanvas = useRef<any>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
  });

  const feedbackMutation = useMutation({
    mutationFn: async (data: FeedbackFormValues) => {
      const response = await api.post("/api/feedback", {
        ...data,
        rating: Number(data.rating),
        reportId,
        customerSignature: sigCanvas.current?.isEmpty() ? "" : sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png'),
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Thank you! Your feedback has been submitted.");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to submit feedback");
    },
  });

  const onSubmit = (data: FeedbackFormValues) => {
    feedbackMutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-900 dark:text-purple-400 dark:hover:bg-purple-950"><MessageSquare className="w-4 h-4 mr-1" />Feedback</Button>} />
      <SheetContent className="sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle>Service Feedback</SheetTitle>
          <SheetDescription>
            Rate the service provided by our engineer and leave comments.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label>Rating (1-5)</Label>
            <input type="hidden" {...register("rating")} />
            <Select onValueChange={(value: any) => setValue("rating", value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 - Excellent</SelectItem>
                <SelectItem value="4">4 - Good</SelectItem>
                <SelectItem value="3">3 - Average</SelectItem>
                <SelectItem value="2">2 - Poor</SelectItem>
                <SelectItem value="1">1 - Terrible</SelectItem>
              </SelectContent>
            </Select>
            {errors.rating && <p className="text-sm text-red-500">{errors.rating.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <textarea
              id="comments"
              className="flex min-h-[120px] w-full rounded-md border border-gray-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              placeholder="Tell us how the engineer did..."
              {...register("comments")}
            />
            {errors.comments && <p className="text-sm text-red-500">{errors.comments.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Customer Signature</Label>
            <div className="border border-gray-300 rounded-md bg-white">
              <SignatureCanvas 
                ref={sigCanvas} 
                penColor="black" 
                canvasProps={{width: 350, height: 150, className: 'sigCanvas'}} 
              />
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => sigCanvas.current?.clear()}>Clear Signature</Button>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="button" variant="outline" className="mr-2" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || feedbackMutation.isPending}>
              {isSubmitting || feedbackMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
