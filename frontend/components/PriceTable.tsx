"use client";

import { QuoteFormData, formatCurrency } from "@/lib/pricing";

interface PriceTableProps {
  formData: QuoteFormData;
}

export default function PriceTable({ formData }: PriceTableProps) {
  // 월 비용 계산 (VAT 포함 기준)
  const productsTotal = formData.products.reduce(
    (sum, p) => sum + p.unitPrice * p.lineCount,
    0
  );
  const equipmentTotal = formData.equipments.reduce(
    (sum, eq) => sum + eq.unitPrice * eq.quantity,
    0
  );
  const monthlyTotal = productsTotal + equipmentTotal;

  // 일회성 비용 계산 (VAT 포함 기준)
  const oneTimeTotal = formData.oneTimeCharges.reduce(
    (sum, ch) => sum + ch.unitPrice * ch.quantity,
    0
  );

  return (
    <div className="card">
      <h2 className="section-title">
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
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        견적 미리보기
      </h2>

      {/* 월 납부 금액 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white bg-lg-magenta px-3 py-2 rounded-t-lg">
          월 납부 금액 (VAT 포함)
        </h3>
        <div className="border border-t-0 border-gray-200 rounded-b-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-gray-600">항목</th>
                <th className="px-3 py-2 text-left text-gray-600">세부내역</th>
                <th className="px-3 py-2 text-right text-gray-600">금액</th>
              </tr>
            </thead>
            <tbody>
              {/* 상품 목록 */}
              {formData.products.map((product, idx) => {
                const amount = product.unitPrice * product.lineCount;
                return (
                  <tr key={product.id} className="border-t border-gray-100">
                    <td className="px-3 py-2">오피스넷 #{idx + 1}</td>
                    <td className="px-3 py-2 text-gray-500">
                      {product.speed} / {product.ipType} / {product.combinationType}
                      {product.lineCount > 1 && ` × ${product.lineCount}회선`}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrency(amount)}
                    </td>
                  </tr>
                );
              })}

              {/* 장비 임대료 */}
              {formData.equipments.map((eq, idx) => {
                const amount = eq.unitPrice * eq.quantity;
                return eq.unitPrice > 0 ? (
                  <tr key={idx} className="border-t border-gray-100">
                    <td className="px-3 py-2">통신장비 임대</td>
                    <td className="px-3 py-2 text-gray-500">
                      {eq.name}
                      {eq.quantity > 1 && ` × ${eq.quantity}`}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrency(amount)}
                    </td>
                  </tr>
                ) : null;
              })}

              <tr className="border-t-2 border-gray-200 bg-lg-magenta/5">
                <td className="px-3 py-2 font-bold text-lg-gray" colSpan={2}>
                  합계
                </td>
                <td className="px-3 py-2 text-right font-bold text-lg-magenta">
                  {formatCurrency(monthlyTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 일회성 납부 금액 */}
      {oneTimeTotal > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white bg-lg-magenta px-3 py-2 rounded-t-lg">
            일회성 납부 금액 (VAT 포함)
          </h3>
          <div className="border border-t-0 border-gray-200 rounded-b-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-600">항목</th>
                  <th className="px-3 py-2 text-right text-gray-600">금액</th>
                </tr>
              </thead>
              <tbody>
                {formData.oneTimeCharges.map((ch, idx) => {
                  const amount = ch.unitPrice * ch.quantity;
                  return ch.unitPrice > 0 ? (
                    <tr key={idx} className="border-t border-gray-100">
                      <td className="px-3 py-2">
                        {ch.name}
                        {ch.quantity > 1 && ` × ${ch.quantity}`}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatCurrency(amount)}
                      </td>
                    </tr>
                  ) : null;
                })}
                <tr className="border-t-2 border-gray-200 bg-lg-magenta/5">
                  <td className="px-3 py-2 font-bold text-lg-gray">합계</td>
                  <td className="px-3 py-2 text-right font-bold text-lg-magenta">
                    {formatCurrency(oneTimeTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
