"use client";

export default function Footer() {
  return (
    <footer className="mt-12 pt-6 border-t-4 border-black text-center text-sm text-gray-600">
      <p className="font-bold">
        CHMSU ALUMNI RELATIONS OFFICE • CONNECTING GRADUATES SINCE 1946
      </p>
      <p className="mt-2">
        Carlos Hilado Memorial State University • Talisay, Negros Occidental,
        Philippines
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-4 md:gap-6">
        <a href="/" className="hover:text-black transition-colors font-medium">
          Back to Home
        </a>
        <a
          href="mailto:alumni@chmsu.edu.ph"
          className="hover:text-black transition-colors font-medium"
        >
          Email: alumni@chmsu.edu.ph
        </a>
      </div>
      <div className="mt-4">
        <p className="text-xs">
          Contact Alumni Office: (034) 495-0000 | Email: alumni@chmsu.edu.ph
        </p>
        <p className="text-xs mt-2">
          © 2026 CHMSU Alumni Information Registry System. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
