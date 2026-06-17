import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

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

function AdminView() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow border border-gray-100 dark:border-zinc-850">
        <h2 className="text-lg font-bold">System Users</h2>
        <p className="text-zinc-500 text-sm mt-2">Manage user directories, access rights, and assign roles.</p>
      </div>
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow border border-gray-100 dark:border-zinc-850">
        <h2 className="text-lg font-bold">Installed Machines</h2>
        <p className="text-zinc-500 text-sm mt-2">Full directory of active hardware and serial registers.</p>
      </div>
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow border border-gray-100 dark:border-zinc-850">
        <h2 className="text-lg font-bold">Audit Logs</h2>
        <p className="text-zinc-500 text-sm mt-2">Immutable records of system actions and permission alterations.</p>
      </div>
    </div>
  );
}

function ManagerView() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow border border-gray-100 dark:border-zinc-850">
        <h2 className="text-lg font-bold">Service Tickets</h2>
        <p className="text-zinc-500 text-sm mt-2">Review customer requests and assign field engineers.</p>
      </div>
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow border border-gray-100 dark:border-zinc-850">
        <h2 className="text-lg font-bold">Report Reviews</h2>
        <p className="text-zinc-500 text-sm mt-2">Audit and approve service logs submitted by engineers.</p>
      </div>
    </div>
  );
}

function EngineerView() {
  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow border border-gray-100 dark:border-zinc-850 max-w-2xl">
      <h2 className="text-lg font-bold">My Assignments</h2>
      <p className="text-zinc-500 text-sm mt-2">Access open job sheets and compile maintenance reports.</p>
    </div>
  );
}

function CustomerView() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow border border-gray-100 dark:border-zinc-850">
        <h2 className="text-lg font-bold">My Inventory</h2>
        <p className="text-zinc-500 text-sm mt-2">Monitor registered hardware assets and operational logs.</p>
      </div>
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow border border-gray-100 dark:border-zinc-850">
        <h2 className="text-lg font-bold">File a Request</h2>
        <p className="text-zinc-500 text-sm mt-2">Log operational anomalies and request dispatch support.</p>
      </div>
    </div>
  );
}
