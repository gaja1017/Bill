"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/pricing";

// Use relative path - Next.js rewrites will proxy to backend
const API_BASE = "/api";

interface SavedQuote {
  quote_id: string;
  customer_name: string;
  quote_title: string;
  quote_date: string;
  saved_at: string;
  total_monthly: number;
  product_count: number;
}

interface SavedQuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (quoteId: string) => void;
}

export default function SavedQuotesModal({
  isOpen,
  onClose,
  onLoad,
}: SavedQuotesModalProps) {
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchQuotes();
    }
  }, [isOpen]);

  const fetchQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/list-quotes`);
      if (!response.ok) throw new Error("목록을 불러오는데 실패했습니다.");
      const data = await response.json();
      setQuotes(data.quotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quoteId: string) => {
    if (!confirm("이 견적서를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(
        `${API_BASE}/delete-quote/${encodeURIComponent(quoteId)}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("삭제에 실패했습니다.");
      fetchQuotes();
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다.");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-lg-gray">저장된 견적서</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">불러오는 중...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">저장된 견적서가 없습니다.</div>
          ) : (
            <div className="space-y-3">
              {quotes.map((quote) => (
                <div
                  key={quote.quote_id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-lg-magenta/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg-gray">
                        {quote.customer_name || "미지정"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {quote.quote_title}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          상품 {quote.product_count}개
                        </span>
                        <span className="text-xs bg-lg-magenta/10 text-lg-magenta px-2 py-1 rounded font-medium">
                          {formatCurrency(quote.total_monthly)}/월
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        저장: {formatDate(quote.saved_at)}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          onLoad(quote.quote_id);
                          onClose();
                        }}
                        className="text-sm bg-lg-magenta text-white px-3 py-1.5 rounded-lg hover:bg-lg-magenta-dark transition-colors"
                      >
                        불러오기
                      </button>
                      <button
                        onClick={() => handleDelete(quote.quote_id)}
                        className="text-sm text-red-500 hover:text-red-700 px-2 py-1.5 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
