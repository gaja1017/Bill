# 가격 데이터 (부가세 포함, 단위: 원)
# 3년 약정 기준

PRICING = {
    "단독": {
        "100M": {"유동IP": 30800, "고정IP": 41800},
        "500M": {"유동IP": 44000, "고정IP": 49500},
        "1G": {"유동IP": 49500, "고정IP": 60500},
        "2.5G": {"유동IP": 55000, "고정IP": 60500},
        "5G": {"유동IP": 77000, "고정IP": 77000},
        "10G": {"유동IP": 110000, "고정IP": 115500},
    },
    "2개 결합": {
        "100M": {"유동IP": 27500, "고정IP": 38500},
        "500M": {"유동IP": 38500, "고정IP": 44000},
        "1G": {"유동IP": 44000, "고정IP": 55000},
        "2.5G": {"유동IP": 49500, "고정IP": 55000},
        "5G": {"유동IP": 71500, "고정IP": 71500},
        "10G": {"유동IP": 104500, "고정IP": 110000},
    },
    "3개 결합": {
        "500M": {"유동IP": 37400, "고정IP": 42900},
        "1G": {"유동IP": 40700, "고정IP": 51700},
        "2.5G": {"유동IP": 46200, "고정IP": 51700},
        "5G": {"유동IP": 66000, "고정IP": 66000},
        "10G": {"유동IP": 99000, "고정IP": 104500},
    },
}

# 약정별 할인율 (3년 기준 대비)
CONTRACT_MULTIPLIER = {
    "3년": 1.0,
    "2년": 1.1,
    "1년": 1.2,
    "무약정": 1.3,
}


def get_price(combination_type: str, speed: str, ip_type: str, contract_period: str) -> int:
    """가격 계산 함수"""
    base_price = PRICING.get(combination_type, {}).get(speed, {}).get(ip_type)
    if base_price is None:
        return 0

    multiplier = CONTRACT_MULTIPLIER.get(contract_period, 1.0)
    return int(base_price * multiplier)
