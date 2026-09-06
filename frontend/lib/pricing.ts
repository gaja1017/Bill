// 가격 데이터 (부가세 포함, 단위: 원)
// 3년 약정 기준

export type CombinationType = "단독" | "2개 결합" | "3개 결합";
export type SpeedType = "100M" | "500M" | "1G" | "2.5G" | "5G" | "10G";
export type IpType = "유동IP" | "고정IP";
export type ContractPeriod = "3년" | "2년" | "1년" | "무약정";

export interface PricingData {
  [combination: string]: {
    [speed: string]: {
      [ip: string]: number;
    };
  };
}

export const PRICING: PricingData = {
  단독: {
    "100M": { 유동IP: 30800, 고정IP: 41800 },
    "500M": { 유동IP: 44000, 고정IP: 49500 },
    "1G": { 유동IP: 49500, 고정IP: 60500 },
    "2.5G": { 유동IP: 55000, 고정IP: 60500 },
    "5G": { 유동IP: 77000, 고정IP: 77000 },
    "10G": { 유동IP: 110000, 고정IP: 115500 },
  },
  "2개 결합": {
    "100M": { 유동IP: 27500, 고정IP: 38500 },
    "500M": { 유동IP: 38500, 고정IP: 44000 },
    "1G": { 유동IP: 44000, 고정IP: 55000 },
    "2.5G": { 유동IP: 49500, 고정IP: 55000 },
    "5G": { 유동IP: 71500, 고정IP: 71500 },
    "10G": { 유동IP: 104500, 고정IP: 110000 },
  },
  "3개 결합": {
    "500M": { 유동IP: 37400, 고정IP: 42900 },
    "1G": { 유동IP: 40700, 고정IP: 51700 },
    "2.5G": { 유동IP: 46200, 고정IP: 51700 },
    "5G": { 유동IP: 66000, 고정IP: 66000 },
    "10G": { 유동IP: 99000, 고정IP: 104500 },
  },
};

// 약정별 배수 (3년 기준 대비)
export const CONTRACT_MULTIPLIER: Record<ContractPeriod, number> = {
  "3년": 1.0,
  "2년": 1.1,
  "1년": 1.2,
  무약정: 1.3,
};

// 속도 옵션
export const SPEED_OPTIONS: SpeedType[] = [
  "100M",
  "500M",
  "1G",
  "2.5G",
  "5G",
  "10G",
];

// 결합 유형별 사용 가능한 속도
export const AVAILABLE_SPEEDS: Record<CombinationType, SpeedType[]> = {
  단독: ["100M", "500M", "1G", "2.5G", "5G", "10G"],
  "2개 결합": ["100M", "500M", "1G", "2.5G", "5G", "10G"],
  "3개 결합": ["500M", "1G", "2.5G", "5G", "10G"],
};

export const COMBINATION_OPTIONS: CombinationType[] = [
  "단독",
  "2개 결합",
  "3개 결합",
];

export const IP_OPTIONS: IpType[] = ["유동IP", "고정IP"];

export const CONTRACT_OPTIONS: ContractPeriod[] = ["3년", "2년", "1년", "무약정"];

export function getPrice(
  combination: CombinationType,
  speed: SpeedType,
  ipType: IpType,
  contract: ContractPeriod
): number {
  const basePrice = PRICING[combination]?.[speed]?.[ipType];
  if (!basePrice) return 0;

  const multiplier = CONTRACT_MULTIPLIER[contract];
  return Math.round(basePrice * multiplier);
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

// 개별 상품 항목
export interface ProductItem {
  id: string;
  combinationType: CombinationType;
  speed: SpeedType;
  ipType: IpType;
  contractPeriod: ContractPeriod;
  lineCount: number;
  unitPrice: number;
}

export interface Equipment {
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface OneTimeCharge {
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface QuoteFormData {
  customerName: string;
  quoteTitle: string;
  quoteDate: string;
  managerName: string;
  managerPhone: string;
  managerFax: string;
  managerEmail: string;
  products: ProductItem[];
  equipments: Equipment[];
  oneTimeCharges: OneTimeCharge[];
  notes: string;
}

export function createNewProduct(): ProductItem {
  return {
    id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    combinationType: "단독",
    speed: "100M",
    ipType: "유동IP",
    contractPeriod: "3년",
    lineCount: 1,
    unitPrice: getPrice("단독", "100M", "유동IP", "3년"),
  };
}

export const initialFormData: QuoteFormData = {
  customerName: "",
  quoteTitle: "LG U+ 오피스넷 견적서",
  quoteDate: new Date().toISOString().split("T")[0],
  managerName: "",
  managerPhone: "",
  managerFax: "",
  managerEmail: "",
  products: [createNewProduct()],
  equipments: [
    { name: "광모뎀", unitPrice: 0, quantity: 1 },
    { name: "기가L2스위치", unitPrice: 0, quantity: 1 },
  ],
  oneTimeCharges: [
    { name: "설치비", unitPrice: 0, quantity: 1 },
    { name: "공사비", unitPrice: 0, quantity: 1 },
    { name: "통신렉", unitPrice: 0, quantity: 1 },
  ],
  notes: "",
};
