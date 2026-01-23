// components/layout/TopNav.tsx
"use client";

import { Bell, Search, User, Settings, Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopNavProps {
  toggleSidebar: () => void;
}

const TopNav = ({ toggleSidebar }: TopNavProps) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to login page
        router.replace("/login");
        // Refresh to clear any cached auth state
        router.refresh();
      } else {
        console.error("Logout failed:", result.message);
        // Still redirect to login even if API fails
        router.replace("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect to login on error
      router.replace("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="sticky top-0 z-40 border-b bg-white">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden text-lg font-semibold text-gray-900 md:block">
            AlumniTracer
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search alumni, events, or resources..."
              className="pl-9"
            />
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -right-1 -top-1 h-5 w-5 p-0">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                <div className="p-3 hover:bg-gray-50">
                  <p className="text-sm font-medium">New event posted</p>
                  <p className="text-xs text-gray-500">
                    Alumni meetup on Friday
                  </p>
                </div>
                <div className="p-3 hover:bg-gray-50">
                  <p className="text-sm font-medium">Job opportunity</p>
                  <p className="text-xs text-gray-500">
                    Software Engineer position at Tech Corp
                  </p>
                </div>
                <div className="p-3 hover:bg-gray-50">
                  <p className="text-sm font-medium">Survey response</p>
                  <p className="text-xs text-gray-500">
                    New alumni survey completed
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-blue-600">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 px-2"
                disabled={isLoggingOut}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.jpg" />
                  <AvatarFallback className="bg-gray-200 text-gray-700">
                    AU
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">Admin User</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                {isLoggingOut ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
