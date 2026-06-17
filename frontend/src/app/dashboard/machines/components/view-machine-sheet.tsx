"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function ViewMachineSheet({ machine }: { machine: any }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="ghost" size="sm">View</Button>} />
      <SheetContent className="sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>Machine Details</SheetTitle>
          <SheetDescription>
            Detailed specifications and status for {machine.serialNo}.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-zinc-500">Model</p>
              <p className="font-medium">{machine.model}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Type</p>
              <p className="font-medium">{machine.type}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Serial Number</p>
              <p className="font-medium">{machine.serialNo}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Status</p>
              <p className="font-medium">{machine.status}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Customer</p>
              <p className="font-medium">{machine.customerId?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Install Date</p>
              <p className="font-medium">{new Date(machine.installDate).toLocaleDateString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-zinc-500">Location</p>
              <p className="font-medium">{machine.location || 'N/A'}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
