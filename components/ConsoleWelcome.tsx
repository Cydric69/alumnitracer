// components/ConsoleWelcome.tsx
"use client";

import { useEffect } from "react";

export default function ConsoleWelcome() {
  useEffect(() => {
    // Clear console first for clean display
    console.clear();

    // Main welcome message with ASCII art
    console.log(
      `%c
    ╔══════════════════════════════════════════════════════════════════╗
    ║                                                                  ║
    ║          ██████╗██╗  ██╗███╗   ███╗███████╗██╗   ██╗            ║
    ║         ██╔════╝██║  ██║████╗ ████║██╔════╝██║   ██║             ║
    ║         ██║     ███████║██╔████╔██║███████╗██║   ██║             ║
    ║         ██║     ██╔══██║██║╚██╔╝██║╚════██║██║   ██║             ║
    ║         ╚██████╗██║  ██║██║ ╚═╝ ██║███████║╚██████╔╝             ║
    ║          ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝ ╚═════╝              ║
    ║                                                                  ║
    ║                CHMSU ALUMNI REGISTRY SYSTEM                     ║
    ║                                                                  ║
    ╚══════════════════════════════════════════════════════════════════╝
    `,
      "color: #166534; font-family: monospace; font-size: 12px;",
    );

    // Main welcome message
    console.log(
      "%c Welcome to CHMSU Alumni Registry System ",
      "color: #166534; font-size: 18px; font-weight: bold; font-family: 'Times New Roman', serif; padding: 10px 0;",
    );

    // Description
    console.log(
      "%cOfficial Alumni Information Registry for Carlos Hilado Memorial State University",
      "color: #4b5563; font-size: 14px; font-style: italic;",
    );

    // Developer contact section with icons
    console.group(
      "%c Development Team Contact Information",
      "color: #059669; font-size: 16px; font-weight: bold; background: #f0fdf4; padding: 5px 10px; border-radius: 4px;",
    );

    console.log(
      `%cEmail: %calumni.dev@chmsu.edu.ph`,
      "color: #374151; font-weight: bold;",
      "color: #166534; text-decoration: underline;",
    );

    console.log(
      `%cWebsite: %chttps://www.chmsu.edu.ph/alumni`,
      "color: #374151; font-weight: bold;",
      "color: #166534; text-decoration: underline;",
    );

    console.log(
      `%cAlumni Office: %c(034) 495-0000 local 1001`,
      "color: #374151; font-weight: bold;",
      "color: #166534;",
    );

    console.log(
      `%cLocation: %cTalisay City, Negros Occidental, Philippines`,
      "color: #374151; font-weight: bold;",
      "color: #166534;",
    );

    console.groupEnd();

    // Final thank you message
    console.log(
      `%cThank you for being part of the CHMSU community! Your information helps us build stronger alumni connections.`,
      "color: #166534; font-size: 14px; font-style: italic; margin-top: 10px; padding: 10px; background: #f0fdf4; border-radius: 4px;",
    );
  }, []);

  // This component doesn't render anything visible
  return null;
}
