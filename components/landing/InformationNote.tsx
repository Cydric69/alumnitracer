"use client";

export default function InformationNote() {
  return (
    <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-300">
      <h3 className="text-xl font-bold font-['Times_New_Roman'] text-green-800 mb-3">
        Important Information
      </h3>
      <ul className="list-disc pl-5 space-y-2 text-gray-700">
        <li>All information is protected under the Data Privacy Act</li>
        <li>No registration or login required</li>
        <li>Your information will only be used for alumni communications</li>
        <li>You can update your information anytime by submitting again</li>
        <li>For questions, contact: alumni@chmsu.edu.ph</li>
      </ul>
    </div>
  );
}
