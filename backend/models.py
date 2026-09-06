from pydantic import BaseModel
from typing import Optional, List


class Equipment(BaseModel):
    name: str
    unit_price: int
    quantity: int = 1


class OneTimeCharge(BaseModel):
    name: str
    unit_price: int
    quantity: int = 1


class ProductItem(BaseModel):
    """개별 상품 항목"""
    combination_type: str  # "단독", "2개 결합", "3개 결합"
    speed: str  # "100M", "500M", "1G", "2.5G", "5G", "10G"
    ip_type: str  # "유동IP", "고정IP"
    contract_period: str  # "3년", "2년", "1년", "무약정"
    line_count: int = 1  # 회선 수
    unit_price: int = 0  # 회선당 단가


class QuoteRequest(BaseModel):
    # 고객 정보
    customer_name: str
    quote_title: str
    quote_date: str

    # 담당자 정보
    manager_name: str
    manager_phone: str
    manager_fax: Optional[str] = ""
    manager_email: str

    # 상품 목록 (다중 상품 지원)
    products: List[ProductItem] = []

    # 통신장비 임대료 (월)
    equipments: List[Equipment] = []

    # 일회성 비용
    one_time_charges: List[OneTimeCharge] = []

    # 특이사항
    notes: Optional[str] = ""


class QuoteResponse(BaseModel):
    success: bool
    message: str
    pdf_filename: Optional[str] = None
