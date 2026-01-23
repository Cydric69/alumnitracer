// components/layout/Footer.tsx
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const quickLinks = [
    { label: "Alumni Directory", href: "/directory" },
    { label: "Events Calendar", href: "/events" },
    { label: "Job Board", href: "/jobs" },
    { label: "Mentorship", href: "/mentorship" },
    { label: "Resources", href: "/resources" },
  ];

  const supportLinks = [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "FAQs", href: "/faqs" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  ];

  return (
    <footer className="mt-auto border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-lg font-bold text-white">AT</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">AlumniTracer</h3>
                <p className="text-sm text-gray-600">
                  Connecting alumni worldwide
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Bridging the gap between alumni and their alma mater. Stay
              connected, grow together.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md p-2 text-gray-600 hover:bg-white hover:text-blue-600"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Support
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Stay Updated
            </h4>
            <p className="text-sm text-gray-600">
              Subscribe to our newsletter for the latest updates and
              opportunities.
            </p>
            <form className="space-y-3">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-white"
              />
              <Button type="submit" className="w-full">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 grid gap-6 border-t pt-8 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-gray-600">contact@alumnitracer.edu</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Address</p>
              <p className="text-sm text-gray-600">
                123 University Ave, Campus City
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} AlumniTracer. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Designed to connect and empower alumni communities worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
