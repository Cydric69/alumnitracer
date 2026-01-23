"use client";

import Link from "next/link";
import {
  GraduationCap,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Cache subscription
      localStorage.setItem("newsletter_subscription", email);
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const quickLinks = [
    { label: "Alumni Directory", href: "/directory" },
    { label: "Events Calendar", href: "/events" },
    { label: "Job Board", href: "/jobs" },
    { label: "News & Updates", href: "/news" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ];

  const socialLinks = [
    { icon: Facebook, label: "Facebook", href: "https://facebook.com/chmsu" },
    { icon: Twitter, label: "Twitter", href: "https://twitter.com/chmsu" },
    {
      icon: Instagram,
      label: "Instagram",
      href: "https://instagram.com/chmsu",
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <GraduationCap className="h-8 w-8 text-blue-400 transition-transform group-hover:rotate-12" />
              <span className="text-xl font-bold">
                Alumni<span className="text-blue-400">Tracer</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connecting Carlos Hilado Memorial State University alumni
              worldwide. Stay connected, grow together, and give back to your
              alma mater.
            </p>

            {/* Newsletter */}
            <div className="pt-4">
              <h4 className="font-semibold mb-3">Stay Updated</h4>
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                  <Button type="submit" size="sm">
                    Join
                  </Button>
                </div>
                {subscribed && (
                  <p className="text-green-400 text-sm animate-in fade-in">
                    Subscribed successfully!
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-gray-400">
              <p className="flex items-center gap-3 hover:text-white transition-colors">
                <Mail className="h-4 w-4 flex-shrink-0" />
                alumni@chmsu.edu.ph
              </p>
              <p className="flex items-center gap-3 hover:text-white transition-colors">
                <Phone className="h-4 w-4 flex-shrink-0" />
                (034) 433-7441
              </p>
              <p className="flex items-start gap-3 hover:text-white transition-colors">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>
                  CHMSU Main Campus
                  <br />
                  Alunan Avenue, Bacolod City
                  <br />
                  Negros Occidental, Philippines
                </span>
              </p>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow CHMSU</h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "bg-gray-800 hover:bg-blue-600 p-3 rounded-full",
                    "transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  )}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            {/* Campus Hours */}
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
              <h4 className="font-semibold mb-2">Office Hours</h4>
              <p className="text-sm text-gray-400">
                Monday - Friday: 8:00 AM - 5:00 PM
                <br />
                Saturday: 8:00 AM - 12:00 NN
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-800" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            © {new Date().getFullYear()} AlumniTracer - CHMSU. All rights
            reserved.
          </p>

          <div className="flex gap-6 text-sm text-gray-400">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link
              href="/sitemap"
              className="hover:text-white transition-colors"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
