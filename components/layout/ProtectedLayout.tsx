// components/layout/ProtectedLayout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authService } from "@/services/authService";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "super-admin";
}

export default async function ProtectedLayout({
  children,
  requiredRole = "admin",
}: ProtectedLayoutProps) {
  // Get token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/login");
  }

  // Verify token on server
  const user = await authService.getCurrentUser(token);

  if (!user) {
    redirect("/login");
  }

  // Check role if specified
  if (
    requiredRole &&
    user.role !== "super-admin" &&
    user.role !== requiredRole
  ) {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Alumni Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-6">{children}</main>
    </div>
  );
}
