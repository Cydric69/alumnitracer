"use client";

import { format } from "date-fns";

const formatDateWithDay = (date: Date): string => {
  return format(date, "MMMM, dd, EEEE, yyyy");
};

export default function Header() {
  return (
    <header className="border-b-4 border-black pb-6 mb-8">
      <div className="text-center mb-6">
        <h1 className="text-7xl md:text-8xl font-['Manufacturing_Consent'] tracking-relaxed text-green-800 mb-2">
          CHMSU Alumni Registry
        </h1>

        {/* Date Display Only - No Navigation */}
        <div className="text-sm uppercase tracking-widest border-t border-b border-black py-3">
          <div className="text-gray-700 text-center">
            <span className="text-xs md:text-sm">
              {formatDateWithDay(new Date())}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
