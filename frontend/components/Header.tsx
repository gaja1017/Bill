"use client";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-lg-magenta">LG U+</span>
            <span className="text-lg font-medium text-lg-gray">오피스넷 견적서</span>
          </div>
          <span className="text-sm text-gray-500">기업 전용 인터넷</span>
        </div>
      </div>
    </header>
  );
}
