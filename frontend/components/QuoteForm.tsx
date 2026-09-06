"use client";

import { useState } from "react";
import {
  QuoteFormData,
  initialFormData,
  ProductItem,
  createNewProduct,
} from "@/lib/pricing";
import ProductSelector from "./ProductSelector";
import PriceTable from "./PriceTable";
import SavedQuotesModal from "./SavedQuotesModal";

type DownloadFormat = "pdf" | "xlsx";

// Use relative path - Next.js rewrites will proxy to backend
const API_BASE = "/api";

export default function QuoteForm() {
  const [formData, setFormData] = useState<QuoteFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSavedQuotes, setShowSavedQuotes] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("pdf");

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateProducts = (products: ProductItem[]) => {
    setFormData((prev) => ({ ...prev, products }));
  };

  const updateEquipment = (
    index: number,
    field: "unitPrice" | "quantity",
    value: number
  ) => {
    setFormData((prev) => {
      const equipments = [...prev.equipments];
      equipments[index] = { ...equipments[index], [field]: value };
      return { ...prev, equipments };
    });
  };

  const updateOneTimeCharge = (
    index: number,
    field: "unitPrice" | "quantity",
    value: number
  ) => {
    setFormData((prev) => {
      const oneTimeCharges = [...prev.oneTimeCharges];
      oneTimeCharges[index] = { ...oneTimeCharges[index], [field]: value };
      return { ...prev, oneTimeCharges };
    });
  };

  const buildRequestBody = () => ({
    customer_name: formData.customerName,
    quote_title: formData.quoteTitle,
    quote_date: formData.quoteDate,
    manager_name: formData.managerName,
    manager_phone: formData.managerPhone,
    manager_fax: formData.managerFax,
    manager_email: formData.managerEmail,
    products: formData.products.map((p) => ({
      combination_type: p.combinationType,
      speed: p.speed,
      ip_type: p.ipType,
      contract_period: p.contractPeriod,
      line_count: p.lineCount,
      unit_price: p.unitPrice,
    })),
    equipments: formData.equipments.map((eq) => ({
      name: eq.name,
      unit_price: eq.unitPrice,
      quantity: eq.quantity,
    })),
    one_time_charges: formData.oneTimeCharges.map((ch) => ({
      name: ch.name,
      unit_price: ch.unitPrice,
      quantity: ch.quantity,
    })),
    notes: formData.notes,
  });

  const handleDownload = async (format: DownloadFormat) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const endpoint = format === "pdf" ? "generate-quote" : "generate-excel";
    const extension = format === "pdf" ? "pdf" : "xlsx";
    const mimeType = format === "pdf"
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    try {
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildRequestBody()),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `${format.toUpperCase()} 생성에 실패했습니다.`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `견적서_${formData.customerName}_${formData.quoteDate}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccessMessage(`${format.toUpperCase()} 파일이 다운로드되었습니다.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.customerName) {
      setError("고객명을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${API_BASE}/save-quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildRequestBody()),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "저장에 실패했습니다.");
      }

      setSuccessMessage("견적서가 저장되었습니다.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async (quoteId: string) => {
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/load-quote/${encodeURIComponent(quoteId)}`
      );

      if (!response.ok) {
        throw new Error("견적서를 불러오는데 실패했습니다.");
      }

      const data = await response.json();

      setFormData({
        customerName: data.customer_name || "",
        quoteTitle: data.quote_title || "",
        quoteDate: data.quote_date || new Date().toISOString().split("T")[0],
        managerName: data.manager_name || "",
        managerPhone: data.manager_phone || "",
        managerFax: data.manager_fax || "",
        managerEmail: data.manager_email || "",
        products: (data.products || []).map((p: any) => ({
          id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          combinationType: p.combination_type || "단독",
          speed: p.speed || "100M",
          ipType: p.ip_type || "유동IP",
          contractPeriod: p.contract_period || "3년",
          lineCount: p.line_count || 1,
          unitPrice: p.unit_price || 0,
        })),
        equipments: (data.equipments || []).map((eq: any) => ({
          name: eq.name,
          unitPrice: eq.unit_price,
          quantity: eq.quantity,
        })),
        oneTimeCharges: (data.one_time_charges || []).map((ch: any) => ({
          name: ch.name,
          unitPrice: ch.unit_price,
          quantity: ch.quantity,
        })),
        notes: data.notes || "",
      });

      setSuccessMessage("견적서를 불러왔습니다.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "불러오기 중 오류가 발생했습니다."
      );
    }
  };

  const handleReset = () => {
    if (confirm("입력한 내용을 모두 초기화하시겠습니까?")) {
      setFormData({
        ...initialFormData,
        products: [createNewProduct()],
      });
      setError(null);
      setSuccessMessage(null);
    }
  };

  const isFormValid = formData.customerName && formData.managerName && formData.managerEmail;

  return (
    <div className="space-y-6">
      {/* 상단 버튼 영역 */}
      <div className="flex flex-wrap gap-2 justify-end">
        <button
          onClick={() => setShowSavedQuotes(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
          저장된 견적서
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !formData.customerName}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-white border border-lg-magenta text-lg-magenta rounded-lg hover:bg-lg-magenta/5 transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          {isSaving ? "저장 중..." : "현재 견적 저장"}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          초기화
        </button>
      </div>

      {/* 고객 정보 */}
      <div className="card">
        <h2 className="section-title">
          <svg className="w-5 h-5 text-lg-magenta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          고객 정보
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-text">고객명 *</label>
            <input
              type="text"
              className="input-field"
              placeholder="고객사명을 입력하세요"
              value={formData.customerName}
              onChange={(e) => updateField("customerName", e.target.value)}
            />
          </div>
          <div>
            <label className="label-text">견적명</label>
            <input
              type="text"
              className="input-field"
              value={formData.quoteTitle}
              onChange={(e) => updateField("quoteTitle", e.target.value)}
            />
          </div>
          <div>
            <label className="label-text">견적일</label>
            <input
              type="date"
              className="input-field"
              value={formData.quoteDate}
              onChange={(e) => updateField("quoteDate", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 담당자 정보 */}
      <div className="card">
        <h2 className="section-title">
          <svg className="w-5 h-5 text-lg-magenta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          담당자 정보
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-text">담당자명 *</label>
            <input
              type="text"
              className="input-field"
              placeholder="담당자 이름"
              value={formData.managerName}
              onChange={(e) => updateField("managerName", e.target.value)}
            />
          </div>
          <div>
            <label className="label-text">연락처 *</label>
            <input
              type="tel"
              className="input-field"
              placeholder="010-0000-0000"
              value={formData.managerPhone}
              onChange={(e) => updateField("managerPhone", e.target.value)}
            />
          </div>
          <div>
            <label className="label-text">FAX</label>
            <input
              type="text"
              className="input-field"
              placeholder="02-0000-0000"
              value={formData.managerFax}
              onChange={(e) => updateField("managerFax", e.target.value)}
            />
          </div>
          <div>
            <label className="label-text">이메일 *</label>
            <input
              type="email"
              className="input-field"
              placeholder="email@example.com"
              value={formData.managerEmail}
              onChange={(e) => updateField("managerEmail", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 상품 선택 */}
      <ProductSelector
        products={formData.products}
        onChange={updateProducts}
      />

      {/* 통신장비 임대료 */}
      <div className="card">
        <h2 className="section-title">
          <svg className="w-5 h-5 text-lg-magenta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          통신장비 임대료 (월)
        </h2>
        <p className="text-sm text-gray-500 mb-4">VAT 포함 금액을 입력하세요</p>
        <div className="space-y-3">
          {formData.equipments.map((eq, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="w-28 text-sm font-medium text-gray-700">{eq.name}</span>
              <input
                type="number"
                className="input-field flex-1"
                placeholder="월 단가"
                value={eq.unitPrice || ""}
                onChange={(e) => updateEquipment(idx, "unitPrice", parseInt(e.target.value) || 0)}
              />
              <span className="text-gray-400">×</span>
              <input
                type="number"
                className="input-field w-20"
                min="1"
                value={eq.quantity}
                onChange={(e) => updateEquipment(idx, "quantity", parseInt(e.target.value) || 1)}
              />
              <span className="text-sm text-gray-500">개</span>
            </div>
          ))}
        </div>
      </div>

      {/* 일회성 비용 */}
      <div className="card">
        <h2 className="section-title">
          <svg className="w-5 h-5 text-lg-magenta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          일회성 비용
        </h2>
        <p className="text-sm text-gray-500 mb-4">VAT 포함 금액을 입력하세요</p>
        <div className="space-y-3">
          {formData.oneTimeCharges.map((ch, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="w-28 text-sm font-medium text-gray-700">{ch.name}</span>
              <input
                type="number"
                className="input-field flex-1"
                placeholder="단가"
                value={ch.unitPrice || ""}
                onChange={(e) => updateOneTimeCharge(idx, "unitPrice", parseInt(e.target.value) || 0)}
              />
              <span className="text-gray-400">×</span>
              <input
                type="number"
                className="input-field w-20"
                min="1"
                value={ch.quantity}
                onChange={(e) => updateOneTimeCharge(idx, "quantity", parseInt(e.target.value) || 1)}
              />
              <span className="text-sm text-gray-500">개</span>
            </div>
          ))}
        </div>
      </div>

      {/* 특이사항 */}
      <div className="card">
        <h2 className="section-title">
          <svg className="w-5 h-5 text-lg-magenta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          특이사항
        </h2>
        <textarea
          className="input-field min-h-[100px]"
          placeholder="견적서에 포함할 특이사항을 입력하세요"
          value={formData.notes}
          onChange={(e) => updateField("notes", e.target.value)}
        />
      </div>

      {/* 견적 미리보기 */}
      <PriceTable formData={formData} />

      {/* 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* 다운로드 버튼 영역 */}
      <div className="card">
        <h2 className="section-title">
          <svg className="w-5 h-5 text-lg-magenta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          견적서 다운로드
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleDownload("pdf")}
            disabled={isLoading || !isFormValid}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            {isLoading && downloadFormat === "pdf" ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                생성 중...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF 다운로드
              </>
            )}
          </button>

          <button
            onClick={() => handleDownload("xlsx")}
            disabled={isLoading || !isFormValid}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && downloadFormat === "xlsx" ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                생성 중...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel 다운로드
              </>
            )}
          </button>
        </div>

        {!isFormValid && (
          <p className="text-sm text-gray-500 mt-3 text-center">
            * 고객명, 담당자명, 이메일은 필수 입력 항목입니다.
          </p>
        )}
      </div>

      {/* 저장된 견적서 모달 */}
      <SavedQuotesModal
        isOpen={showSavedQuotes}
        onClose={() => setShowSavedQuotes(false)}
        onLoad={handleLoad}
      />
    </div>
  );
}
