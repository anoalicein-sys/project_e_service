import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  Server, 
  ClipboardList, 
  Ticket, 
  FileText, 
  Wrench, 
  PackageSearch, 
  PlusCircle 
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { name, role } = session.user;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-950 p-8 text-gray-900 dark:text-zinc-50">
      <header className="flex justify-between items-center pb-6 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Welcome back, {name} ({role})
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <Button variant="outline" type="submit">Sign Out</Button>
        </form>
      </header>

      <main className="mt-8 flex-1">
        {role === "Admin" && <AdminView />}
        {role === "Manager" && <ManagerView />}
        {role === "Engineer" && <EngineerView />}
        {role === "Customer" && <CustomerView />}
      </main>
    </div>
  );
}

// Reusable Card Component for consistent styling
function DashboardCard({ href, title, description, icon: Icon }: any) {
  return (
    <Link href={href} className="group block h-full">
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 transition-all duration-200 hover:border-blue-500 hover:shadow-md hover:-translate-y-1 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-3 text-blue-600 dark:text-blue-400">
          <Icon className="w-6 h-6" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h2>
        </div>
        <p className="text-zinc-500 text-sm mt-auto">{description}</p>
      </div>
    </Link>
  );
}

function AdminView() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard 
        href="/dashboard/users" 
        title="System Users" 
        description="Manage user directories, access rights, and assign roles." 
        icon={Users} 
      />
      <DashboardCard 
        href="/dashboard/machines" 
        title="Installed Machines" 
        description="Full directory of active hardware and serial registers." 
        icon={Server} 
      />
      <DashboardCard 
        href="/dashboard/audit" 
        title="Audit Logs" 
        description="Immutable records of system actions and permission alterations." 
        icon={ClipboardList} 
      />
    </div>
  );
}

function ManagerView() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <DashboardCard 
        href="/dashboard/tickets" 
        title="Service Tickets" 
        description="Review customer requests and assign field engineers." 
        icon={Ticket} 
      />
      <DashboardCard 
        href="/dashboard/reports" 
        title="Report Reviews" 
        description="Audit and approve service logs submitted by engineers." 
        icon={FileText} 
      />
      <DashboardCard 
        href="/dashboard/machines" 
        title="Machine Registry" 
        description="View all registered customer machines and their current status." 
        icon={Server} 
      />
    </div>
  );
}

function EngineerView() {
  return (
    <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
      <DashboardCard 
        href="/dashboard/assignments" 
        title="My Assignments" 
        description="Access open job sheets and compile maintenance reports." 
        icon={Wrench} 
      />
      <DashboardCard 
        href="/dashboard/reports" 
        title="My Service Reports" 
        description="View your drafted and submitted service reports." 
        icon={FileText} 
      />
    </div>
  );
}

function CustomerView() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <DashboardCard 
        href="/dashboard/machines" 
        title="My Inventory" 
        description="Monitor registered hardware assets and operational logs." 
        icon={PackageSearch} 
      />
      <DashboardCard 
        href="/dashboard/requests/new" 
        title="File a Request" 
        description="Log operational anomalies and request dispatch support." 
        icon={PlusCircle} 
      />
    </div>
  );
}
