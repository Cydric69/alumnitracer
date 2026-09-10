"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Calendar,
  Bell,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
  Bookmark,
  MapPin,
  GraduationCap,
  BarChart3,
  MessageSquare,
  Building,
  Newspaper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  title: string;
  section?: string;
  items: NavItem[];
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    alumni: true,
    content: true,
    data: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const navSections: NavSection[] = [
    {
      title: "Dashboard",
      items: [
        {
          label: "Overview",
          href: "/dashboard",
          icon: Home,
        },
      ],
    },
    {
      title: "Alumni Management",
      section: "alumni",
      items: [
        {
          label: "Alumni Data",
          href: "/dashboard/alumni",
          icon: Users,
        },
      ],
    },
    {
      title: "Feedback Management",
      items: [
        {
          label: "Feedbacks",
          href: "/dashboard/feedbacks",
          icon: MessageSquare,
        },
      ],
    },
    {
      title: "Content Management",
      items: [
        {
          label: "Events & Announcements",
          href: "/dashboard/events-announcements",
          icon: Newspaper,
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(href);
  };

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, setIsOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on desktop */}
      <aside
        id="dashboard-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-white transition-[transform,visibility] duration-200 ease-in-out lg:translate-x-0 lg:fixed lg:inset-y-0 lg:left-0",
          // `invisible` (visibility:hidden) also pulls the off-canvas links out of
          // the tab order, so keyboard users can't tab into a closed drawer.
          // visibility must be in the transition list: it is discretely animated,
          // so transitioning it holds the drawer visible for the full slide-out
          // instead of blanking it on the first frame.
          isOpen
            ? "translate-x-0"
            : "-translate-x-full invisible lg:visible lg:translate-x-0",
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-14 items-center justify-between border-b px-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
              <GraduationCap aria-hidden="true" className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">
              Admin Panel
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close navigation menu"
            className="h-8 w-8 hover:bg-gray-100 lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4 text-gray-700" />
          </Button>
        </div>

        {/* Sidebar Content - Scrollable with hidden scrollbar */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-hide">
          <nav aria-label="Dashboard" className="space-y-1 px-3">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                {section.section ? (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleSection(section.section!)}
                      aria-expanded={!!expandedSections[section.section]}
                      aria-controls={`nav-section-${section.section}`}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                    >
                      <span>{section.title}</span>
                      {expandedSections[section.section] ? (
                        <ChevronLeft
                          aria-hidden="true"
                          className="h-4 w-4 rotate-90 text-gray-600"
                        />
                      ) : (
                        <ChevronRight
                          aria-hidden="true"
                          className="h-4 w-4 text-gray-600"
                        />
                      )}
                    </button>
                    {/* Always rendered, toggled with `hidden`, so the
                        aria-controls reference above always resolves — a
                        collapsed section is exactly when a screen-reader user
                        follows it. `hidden` keeps it out of the tab order. */}
                    <div
                        id={`nav-section-${section.section}`}
                        hidden={!expandedSections[section.section]}
                        className="ml-4 space-y-1 border-l border-gray-200 pl-3"
                      >
                        {section.items.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            aria-current={isActive(item.href) ? "page" : undefined}
                            className={cn(
                              "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2",
                              isActive(item.href)
                                ? "bg-gray-100 text-gray-900 font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon aria-hidden="true" className="h-4 w-4" />
                              {item.label}
                            </div>
                          </Link>
                        ))}
                      </div>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                      {section.title}
                    </div>
                    {section.items.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2",
                          isActive(item.href)
                            ? "bg-gray-100 text-gray-900 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon aria-hidden="true" className="h-4 w-4" />
                          {item.label}
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
