"use client";

import {
  ProductItem,
  CombinationType,
  SpeedType,
  IpType,
  ContractPeriod,
  COMBINATION_OPTIONS,
  IP_OPTIONS,
  CONTRACT_OPTIONS,
  AVAILABLE_SPEEDS,
  getPrice,
  formatCurrency,
  createNewProduct,
} from "@/lib/pricing";

interface ProductSelectorProps {
  products: ProductItem[];
  onChange: (products: ProductItem[]) => void;
}

export default function ProductSelector({
  products,
  onChange,
}: ProductSelectorProps) {
  const updateProduct = (
    index: number,
    field: keyof ProductItem,
    value: string | number
  ) => {
    const updated = [...products];
    const product = { ...updated[index], [field]: value };

    // 가격 자동 계산
    if (["combinationType", "speed", "ipType", "contractPeriod"].includes(field)) {
      const combination = field === "combinationType"
        ? (value as CombinationType)
        : product.combinationType;
      const speed = field === "speed" ? (value as SpeedType) : product.speed;
      const ipType = field === "ipType" ? (value as IpType) : product.ipType;
      const contract = field === "contractPeriod"
        ? (value as ContractPeriod)
        : product.contractPeriod;

      // 결합 유형 변경 시 속도가 유효한지 확인
      if (field === "combinationType") {
        const availableSpeeds = AVAILABLE_SPEEDS[combination];
        if (!availableSpeeds.includes(product.speed)) {
          product.speed = availableSpeeds[0];
        }
      }

      product.unitPrice = getPrice(
        field === "combinationType" ? combination : product.combinationType,
        field === "speed" || field === "combinationType" ? product.speed : speed,
        ipType,
        contract
      );
    }

    updated[index] = product;
    onChange(updated);
  };

  const addProduct = () => {
    onChange([...products, createNewProduct()]);
  };

  const removeProduct = (index: number) => {
    if (products.length <= 1) {
      alert("최소 1개의 상품이 필요합니다.");
      return;
    }
    const updated = products.filter((_, i) => i !== index);
    onChange(updated);
  };

  const getTotalMonthly = () => {
    return products.reduce((sum, p) => sum + p.unitPrice * p.lineCount, 0);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">
          <svg
            className="w-5 h-5 text-lg-magenta"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
            />
          </svg>
          상품 선택
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({products.length}개)
          </span>
        </h2>
        <button
          onClick={addProduct}
          className="flex items-center gap-1 text-sm text-lg-magenta hover:text-lg-magenta-dark transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          상품 추가
        </button>
      </div>

      <div className="space-y-4">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="border border-gray-200 rounded-lg p-4 relative"
          >
            {/* 상품 번호 및 삭제 버튼 */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-lg-magenta">
                상품 #{index + 1}
              </span>
              {products.length > 1 && (
                <button
                  onClick={() => removeProduct(index)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* 결합 유형 */}
              <div>
                <label className="label-text">결합 유형</label>
                <select
                  className="select-field text-sm"
                  value={product.combinationType}
                  onChange={(e) =>
                    updateProduct(index, "combinationType", e.target.value)
                  }
                >
                  {COMBINATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* 속도 */}
              <div>
                <label className="label-text">속도</label>
                <select
                  className="select-field text-sm"
                  value={product.speed}
                  onChange={(e) => updateProduct(index, "speed", e.target.value)}
                >
                  {AVAILABLE_SPEEDS[product.combinationType].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* IP 유형 */}
              <div>
                <label className="label-text">IP 유형</label>
                <select
                  className="select-field text-sm"
                  value={product.ipType}
                  onChange={(e) => updateProduct(index, "ipType", e.target.value)}
                >
                  {IP_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* 약정 기간 */}
              <div>
                <label className="label-text">약정 기간</label>
                <select
                  className="select-field text-sm"
                  value={product.contractPeriod}
                  onChange={(e) =>
                    updateProduct(index, "contractPeriod", e.target.value)
                  }
                >
                  {CONTRACT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* 회선 수 */}
              <div>
                <label className="label-text">회선 수</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="input-field text-sm"
                  value={product.lineCount}
                  onChange={(e) =>
                    updateProduct(index, "lineCount", parseInt(e.target.value) || 1)
                  }
                />
              </div>

              {/* 단가 표시 */}
              <div>
                <label className="label-text">회선당 단가</label>
                <div className="input-field bg-gray-50 text-lg-magenta font-medium">
                  {formatCurrency(product.unitPrice)}
                </div>
              </div>
            </div>

            {/* 소계 */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {product.lineCount}회선 × {formatCurrency(product.unitPrice)}
              </span>
              <span className="font-medium text-lg-gray">
                {formatCurrency(product.unitPrice * product.lineCount)}/월
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 전체 합계 */}
      <div className="mt-4 p-4 bg-gradient-to-r from-lg-magenta/10 to-pink-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">전체 상품 월 이용료 (VAT 포함)</span>
          <span className="text-xl font-bold text-lg-magenta">
            {formatCurrency(getTotalMonthly())}
          </span>
        </div>
      </div>
    </div>
  );
}
