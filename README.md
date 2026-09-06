---
title: LG U+ 오피스넷 견적서 생성기
emoji: 📄
colorFrom: pink
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# LG U+ 오피스넷 견적서 생성기

LG U+ 오피스넷 상품 견적서를 자동으로 생성하는 웹 애플리케이션입니다.

## 기능

- 오피스넷 상품 선택 (속도, IP 유형, 약정 기간)
- 결합 할인 자동 적용 (2개/3개 결합)
- 통신장비 임대료 추가
- 일회성 비용 (설치비, 공사비 등) 추가
- PDF 견적서 다운로드
- Excel 견적서 다운로드
- 견적서 저장 및 불러오기

## 기술 스택

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Python FastAPI + ReportLab (PDF) + openpyxl (Excel)

## 로컬 실행

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# Frontend
cd frontend
npm install
npm run dev
```

http://localhost:3000 에서 확인
