import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventsContent from "@/components/EventsContent";
import { Suspense } from "react";
import Loading from "../loading";

export const metadata = {
  title: "CHMSU Alumni Events - Upcoming Gatherings & Activities",
  description:
    "Browse upcoming CHMSU alumni events, reunions, webinars, and career fairs",
};

export default function EventsPage() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<Loading />}>
          <EventsContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
