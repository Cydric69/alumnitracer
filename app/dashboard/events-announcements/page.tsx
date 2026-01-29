"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Bell,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  MapPin,
  Save,
  X,
  AlertCircle,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Newspaper,
} from "lucide-react";
import {
  getEvents,
  getAnnouncements,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventActive,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementActive,
  getYears,
} from "@/app/actions/events-announcements.actions";

interface Event {
  _id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  description: string;
  year: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Announcement {
  _id: string;
  title: string;
  date: string;
  description: string;
  year: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type FormMode = "create" | "edit" | null;
type ContentType = "event" | "announcement";

export default function AdminEventsAnnouncementsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"events" | "announcements">(
    "events",
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [contentType, setContentType] = useState<ContentType>("event");
  const [selectedItem, setSelectedItem] = useState<Event | Announcement | null>(
    null,
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [saving, setSaving] = useState(false);
  const [availableYears, setAvailableYears] = useState<
    { value: string; label: string }[]
  >([]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    location: "",
    description: "",
    year: new Date().getFullYear().toString(),
    expiresAt: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch data and years
  useEffect(() => {
    fetchData();
    fetchYears();
  }, [activeTab, filterStatus, filterYear]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const params = {
        status: filterStatus !== "all" ? filterStatus : undefined,
        year: filterYear !== "all" ? filterYear : undefined,
      };

      if (activeTab === "events") {
        const data = await getEvents(params);
        setEvents(data);
      } else {
        const data = await getAnnouncements(params);
        setAnnouncements(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to fetch data. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchYears = async () => {
    try {
      const years = await getYears(activeTab);
      setAvailableYears([{ value: "all", label: "All Years" }, ...years]);
    } catch (error) {
      console.error("Error fetching years:", error);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.year.trim()) {
      newErrors.year = "Year is required";
    }

    if (
      formData.expiresAt &&
      new Date(formData.expiresAt) <= new Date(formData.date)
    ) {
      newErrors.expiresAt = "Expiration date must be after the date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      // Prepare data
      const dataToSend = {
        title: formData.title,
        date: new Date(formData.date),
        description: formData.description,
        year: formData.year,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null,
        isActive: formData.isActive,
      };

      if (contentType === "event") {
        Object.assign(dataToSend, {
          time: formData.time || "",
          location: formData.location || "",
        });
      }

      if (formMode === "create") {
        if (contentType === "event") {
          await createEvent(dataToSend);
        } else {
          await createAnnouncement(dataToSend);
        }
      } else if (formMode === "edit" && selectedItem) {
        if (contentType === "event") {
          await updateEvent(selectedItem._id, dataToSend);
        } else {
          await updateAnnouncement(selectedItem._id, dataToSend);
        }
      }

      resetForm();
      fetchData();
      fetchYears();
    } catch (error) {
      console.error("Error saving item:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      if (contentType === "event") {
        await deleteEvent(id);
      } else {
        await deleteAnnouncement(id);
      }

      fetchData();
      fetchYears();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete. Please try again.");
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (id: string) => {
    try {
      if (contentType === "event") {
        await toggleEventActive(id);
      } else {
        await toggleAnnouncementActive(id);
      }

      fetchData();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      location: "",
      description: "",
      year: new Date().getFullYear().toString(),
      expiresAt: "",
      isActive: true,
    });
    setErrors({});
    setFormMode(null);
    setSelectedItem(null);
  };

  // Open form for create
  const openCreateForm = (type: ContentType) => {
    setContentType(type);
    setFormMode("create");
    setFormData({
      title: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      location: "",
      description: "",
      year: new Date().getFullYear().toString(),
      expiresAt: "",
      isActive: true,
    });
  };

  // Open form for edit
  const openEditForm = (item: Event | Announcement, type: ContentType) => {
    setContentType(type);
    setFormMode("edit");
    setSelectedItem(item);
    setFormData({
      title: item.title,
      date: new Date(item.date).toISOString().split("T")[0],
      time: "time" in item ? item.time || "" : "",
      location: "location" in item ? item.location || "" : "",
      description: item.description,
      year: item.year,
      expiresAt: item.expiresAt
        ? new Date(item.expiresAt).toISOString().split("T")[0]
        : "",
      isActive: item.isActive,
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format date and time
  const formatDateTime = (dateString: string, time?: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return time ? `${formattedDate} at ${time}` : formattedDate;
  };

  // Check if item is expired
  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  // Type guard to check if item is an Event
  const isEvent = (item: Event | Announcement): item is Event => {
    return "time" in item || "location" in item;
  };

  const currentItems = activeTab === "events" ? events : announcements;
  const filteredItems =
    filterStatus === "all"
      ? currentItems
      : currentItems.filter((item) =>
          filterStatus === "active" ? item.isActive : !item.isActive,
        );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Newspaper className="h-8 w-8 text-green-800" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Manage Events & Announcements
                </h1>
              </div>
              <p className="text-gray-600">
                Create, edit, and manage events and announcements. Items will
                automatically expire based on the expiration date.
              </p>
            </div>

            <button
              onClick={() => {
                fetchData();
                fetchYears();
              }}
              disabled={loading}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Tabs and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-gray-200">
              <div className="flex space-x-1 mb-4 md:mb-0">
                <button
                  onClick={() => setActiveTab("events")}
                  className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === "events"
                      ? "bg-green-800 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Events ({events.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("announcements")}
                  className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === "announcements"
                      ? "bg-green-800 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Announcements ({announcements.length})
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(
                        e.target.value as "all" | "active" | "inactive",
                      )
                    }
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                  >
                    {availableYears.map((year) => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() =>
                    openCreateForm(
                      activeTab === "events" ? "event" : "announcement",
                    )
                  }
                  className="flex items-center gap-2 bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add New
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading {activeTab}...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                    {activeTab === "events" ? (
                      <Calendar className="h-8 w-8 text-gray-400" />
                    ) : (
                      <Bell className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No {activeTab} found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {filterStatus !== "all" || filterYear !== "all"
                      ? "Try changing your filters or create a new item."
                      : `Get started by creating your first ${activeTab.slice(0, -1)}.`}
                  </p>
                  <button
                    onClick={() =>
                      openCreateForm(
                        activeTab === "events" ? "event" : "announcement",
                      )
                    }
                    className="inline-flex items-center gap-2 bg-green-800 hover:bg-green-900 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add New {activeTab === "events" ? "Event" : "Announcement"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => {
                    const expired = isExpired(item.expiresAt);

                    return (
                      <div
                        key={item._id}
                        className={`border rounded-lg overflow-hidden transition-all hover:shadow-lg ${
                          !item.isActive || expired
                            ? "border-gray-300 bg-gray-50 opacity-75"
                            : "border-green-800 hover:border-green-900"
                        }`}
                      >
                        <div className="p-5">
                          {/* Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  !item.isActive || expired
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {expired
                                  ? "EXPIRED"
                                  : item.isActive
                                    ? "ACTIVE"
                                    : "INACTIVE"}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {item.year}
                            </div>
                          </div>

                          {/* Title */}
                          <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                            {item.title}
                          </h4>

                          {/* Details */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-gray-700 text-sm">
                              <Calendar className="h-3 w-3 mr-2 text-gray-500" />
                              <span>
                                {activeTab === "events" &&
                                isEvent(item) &&
                                item.time
                                  ? formatDateTime(item.date, item.time)
                                  : formatDate(item.date)}
                              </span>
                            </div>
                            {activeTab === "events" &&
                              isEvent(item) &&
                              item.location && (
                                <div className="flex items-center text-gray-700 text-sm">
                                  <MapPin className="h-3 w-3 mr-2 text-gray-500" />
                                  <span className="line-clamp-1">
                                    {item.location}
                                  </span>
                                </div>
                              )}
                            {item.expiresAt && (
                              <div className="flex items-center text-gray-700 text-sm">
                                <Clock className="h-3 w-3 mr-2 text-gray-500" />
                                <span>
                                  Expires: {formatDate(item.expiresAt)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {item.description}
                          </p>

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setContentType(
                                    activeTab === "events"
                                      ? "event"
                                      : "announcement",
                                  );
                                  setSelectedItem(item);
                                  handleToggleActive(item._id);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  item.isActive && !expired
                                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                                    : "bg-green-50 text-green-600 hover:bg-green-100"
                                }`}
                                title={
                                  item.isActive ? "Deactivate" : "Activate"
                                }
                              >
                                {item.isActive && !expired ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  openEditForm(
                                    item,
                                    activeTab === "events"
                                      ? "event"
                                      : "announcement",
                                  )
                                }
                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setContentType(
                                    activeTab === "events"
                                      ? "event"
                                      : "announcement",
                                  );
                                  setSelectedItem(item);
                                  handleDelete(item._id);
                                }}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="text-xs text-gray-500">
                              {formatDate(item.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {formMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {formMode === "create" ? "Create New" : "Edit"}{" "}
                      {contentType === "event" ? "Event" : "Announcement"}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {formMode === "create"
                        ? `Add a new ${contentType} to display on the events & announcements page`
                        : "Update the item details"}
                    </p>
                  </div>
                  <button
                    onClick={resetForm}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent ${
                        errors.title ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder={`Enter ${contentType} title`}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        setFormData({
                          ...formData,
                          date: e.target.value,
                          year: date.getFullYear().toString(),
                        });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent ${
                        errors.date ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.date}
                      </p>
                    )}
                  </div>

                  {/* Time (Events only) */}
                  {contentType === "event" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.time}
                        onChange={(e) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                        placeholder="e.g., 2:00 PM - 4:00 PM"
                      />
                    </div>
                  )}

                  {/* Location (Events only) */}
                  {contentType === "event" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                        placeholder="Enter location"
                      />
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent ${
                        errors.description
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder={`Enter ${contentType} description`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Expiration Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiration Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) =>
                        setFormData({ ...formData, expiresAt: e.target.value })
                      }
                      min={formData.date}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent ${
                        errors.expiresAt ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.expiresAt && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.expiresAt}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      This {contentType} will automatically become inactive
                      after this date
                    </p>
                  </div>

                  {/* Active Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, isActive: true })
                        }
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          formData.isActive
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                        }`}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, isActive: false })
                        }
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          !formData.isActive
                            ? "bg-red-100 text-red-800 border border-red-300"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                        }`}
                      >
                        <XCircle className="h-4 w-4" />
                        Inactive
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Active {contentType}s are visible on the public page
                    </p>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent ${
                        errors.year ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., 2024"
                    />
                    {errors.year && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.year}
                      </p>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 bg-green-800 hover:bg-green-900 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {formMode === "create" ? "Create" : "Save Changes"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
