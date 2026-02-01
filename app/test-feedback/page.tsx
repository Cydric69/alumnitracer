// app/feedback-test/page.tsx
"use client";

import { useState } from "react";
import FeedbackForm from "@/components/forms/FeedbackForm";
import {
  getFeedbacks,
  deleteFeedback,
  bulkDeleteFeedbacks,
} from "@/app/actions/feedback.actions";

export default function FeedbackTestPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await getFeedbacks();
      setFeedbacks(data);
    } catch (error) {
      console.error("Error loading feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this feedback?")) {
      try {
        await deleteFeedback(id);
        await loadFeedbacks(); // Refresh the list
      } catch (error) {
        console.error("Error deleting feedback:", error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert("Please select feedbacks to delete");
      return;
    }

    if (
      confirm(
        `Are you sure you want to delete ${selectedIds.length} feedback(s)?`,
      )
    ) {
      try {
        await bulkDeleteFeedbacks(selectedIds);
        setSelectedIds([]);
        await loadFeedbacks(); // Refresh the list
      } catch (error) {
        console.error("Error bulk deleting feedbacks:", error);
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === feedbacks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(feedbacks.map((f) => f.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleFormSuccess = () => {
    loadFeedbacks(); // Refresh the list after successful submission
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Feedback Form Test
          </h1>
          <p className="mt-2 text-gray-600">
            Test the feedback form functionality and view submitted feedbacks
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Form */}
          <div>
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  Feedback Form
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Fill out the feedback form below
                </p>
              </div>
              <div className="p-6">
                {showForm ? (
                  <FeedbackForm onSuccess={handleFormSuccess} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Form is hidden</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Show Form
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Controls
              </h3>
              <div className="space-y-4">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  {showForm ? "Hide Form" : "Show Form"}
                </button>
                <button
                  onClick={loadFeedbacks}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Load All Feedbacks"}
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={toggleSelectAll}
                    disabled={feedbacks.length === 0}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
                  >
                    {selectedIds.length === feedbacks.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={selectedIds.length === 0}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
                  >
                    Delete Selected ({selectedIds.length})
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Feedback List */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Submitted Feedbacks
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {feedbacks.length} feedback(s) found
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {loading ? "Loading..." : `${feedbacks.length} items`}
                </span>
              </div>

              <div className="overflow-x-auto">
                {feedbacks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="w-16 h-16 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500">No feedbacks submitted yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Submit a feedback using the form or load existing
                      feedbacks
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {feedbacks.map((feedback) => (
                      <div
                        key={feedback.id}
                        className={`p-4 hover:bg-gray-50 ${selectedIds.includes(feedback.id) ? "bg-blue-50" : ""}`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 pt-1">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(feedback.id)}
                              onChange={() => toggleSelect(feedback.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  {feedback.alumni
                                    ? `${feedback.alumni.firstName} ${feedback.alumni.lastName}`
                                    : feedback.email || "Anonymous"}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(
                                    feedback.createdAt,
                                  ).toLocaleDateString()}{" "}
                                  at{" "}
                                  {new Date(
                                    feedback.createdAt,
                                  ).toLocaleTimeString()}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    (window.location.href = `/feedback-test/view/${feedback.id}`)
                                  }
                                  className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleDelete(feedback.id)}
                                  className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                              <div className="bg-gray-100 p-2 rounded">
                                <span className="font-medium">Job Prep:</span>
                                <span className="ml-1">
                                  {feedback.jobSearchPreparation}/5
                                </span>
                              </div>
                              <div className="bg-gray-100 p-2 rounded">
                                <span className="font-medium">
                                  Career Prep:
                                </span>
                                <span className="ml-1">
                                  {feedback.careerPreparation}/5
                                </span>
                              </div>
                              <div className="bg-gray-100 p-2 rounded">
                                <span className="font-medium">Enroll:</span>
                                <span
                                  className={`ml-1 ${feedback.wouldEnroll === "Yes" ? "text-green-600" : "text-red-600"}`}
                                >
                                  {feedback.wouldEnroll}
                                </span>
                              </div>
                            </div>

                            <div className="mt-3">
                              <p className="text-sm text-gray-600 line-clamp-2">
                                <span className="font-medium">Liked:</span>{" "}
                                {feedback.likeMost}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {feedbacks.length}
              </div>
              <div className="text-sm text-blue-600">Total Feedbacks</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {feedbacks.filter((f) => f.wouldEnroll === "Yes").length}
              </div>
              <div className="text-sm text-green-600">Would Enroll (Yes)</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">
                {feedbacks.length > 0
                  ? Math.round(
                      feedbacks.reduce(
                        (sum, f) => sum + f.jobSearchPreparation,
                        0,
                      ) / feedbacks.length,
                    )
                  : 0}
                <span className="text-sm">/5</span>
              </div>
              <div className="text-sm text-yellow-600">
                Avg. Job Prep Rating
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {selectedIds.length}
              </div>
              <div className="text-sm text-purple-600">Selected Items</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
