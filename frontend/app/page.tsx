"use client";

import Header from "@/components/Header";
import QuoteForm from "@/components/QuoteForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <QuoteForm />
      </div>
      <footer className="text-center py-6 text-sm text-gray-400">
        LG U+ 오피스넷 견적서 생성기 v1.0
      </footer>
    </main>
  );
}
