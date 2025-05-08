import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import LinkList from "./LinkList";
import AddLinkForm from "./AddLinkForm";
import NavLinks from "./NavLinks";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavLinks username={session.user.name || session.user.email || ""} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Add New Link
                </h2>
                <AddLinkForm />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Your Links
                </h2>
                <LinkList />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
