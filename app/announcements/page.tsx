import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnnouncementsContent from "@/components/AnnouncementsContent";
import { Suspense } from "react";
import Loading from "../loading";

export const metadata = {
  title: "CHMSU Announcements - Latest News & Updates",
  description:
    "Stay updated with the latest news, announcements, and important updates from CHMSU",
};

export default function AnnouncementsPage() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<Loading />}>
          <AnnouncementsContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
