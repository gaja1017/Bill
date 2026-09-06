from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from models import QuoteRequest
from pdf_generator import generate_quote_pdf
from excel_generator import generate_quote_excel
from pricing_data import get_price, PRICING
from datetime import datetime
import io
import json
import os

app = FastAPI(
    title="LG U+ 오피스넷 견적서 생성 API",
    description="오피스넷 상품 견적서를 PDF/Excel로 생성하는 API",
    version="1.0.0",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# 견적서 저장 디렉토리
QUOTES_DIR = os.path.join(os.path.dirname(__file__), "saved_quotes")
os.makedirs(QUOTES_DIR, exist_ok=True)


def prepare_quote_dict(quote_data: QuoteRequest) -> dict:
    """QuoteRequest를 dict로 변환"""
    quote_dict = quote_data.model_dump()
    quote_dict["products"] = [p.model_dump() for p in quote_data.products]
    quote_dict["equipments"] = [eq.model_dump() for eq in quote_data.equipments]
    quote_dict["one_time_charges"] = [ch.model_dump() for ch in quote_data.one_time_charges]
    return quote_dict


@app.get("/")
async def root():
    return {"message": "LG U+ 오피스넷 견적서 생성 API", "status": "running"}


@app.get("/pricing")
async def get_pricing():
    """가격 데이터 조회"""
    return PRICING


@app.post("/generate-quote")
async def generate_quote(quote_data: QuoteRequest):
    """견적서 PDF 생성"""
    try:
        quote_dict = prepare_quote_dict(quote_data)
        pdf_buffer = generate_quote_pdf(quote_dict)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"quote_{timestamp}.pdf"

        return StreamingResponse(
            io.BytesIO(pdf_buffer.read()),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
            },
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-excel")
async def generate_excel(quote_data: QuoteRequest):
    """견적서 Excel 생성"""
    try:
        quote_dict = prepare_quote_dict(quote_data)
        excel_buffer = generate_quote_excel(quote_dict)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"quote_{timestamp}.xlsx"

        return StreamingResponse(
            io.BytesIO(excel_buffer.read()),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
            },
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/save-quote")
async def save_quote(quote_data: QuoteRequest):
    """견적서 저장"""
    try:
        quote_dict = prepare_quote_dict(quote_data)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        quote_id = f"{timestamp}_{quote_data.customer_name}"
        filename = f"{quote_id}.json"
        filepath = os.path.join(QUOTES_DIR, filename)

        quote_dict["saved_at"] = datetime.now().isoformat()
        quote_dict["quote_id"] = quote_id

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(quote_dict, f, ensure_ascii=False, indent=2)

        return {"success": True, "quote_id": quote_id, "message": "견적서가 저장되었습니다."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/list-quotes")
async def list_quotes():
    """저장된 견적서 목록 조회"""
    try:
        quotes = []
        for filename in os.listdir(QUOTES_DIR):
            if filename.endswith(".json"):
                filepath = os.path.join(QUOTES_DIR, filename)
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)

                    # 총 월 금액 계산
                    total_monthly = sum(
                        p.get("unit_price", 0) * p.get("line_count", 1)
                        for p in data.get("products", [])
                    )

                    quotes.append({
                        "quote_id": data.get("quote_id", filename.replace(".json", "")),
                        "customer_name": data.get("customer_name", ""),
                        "quote_title": data.get("quote_title", ""),
                        "quote_date": data.get("quote_date", ""),
                        "saved_at": data.get("saved_at", ""),
                        "total_monthly": total_monthly,
                        "product_count": len(data.get("products", [])),
                    })

        quotes.sort(key=lambda x: x.get("saved_at", ""), reverse=True)
        return {"quotes": quotes}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/load-quote/{quote_id}")
async def load_quote(quote_id: str):
    """저장된 견적서 불러오기"""
    try:
        filename = f"{quote_id}.json"
        filepath = os.path.join(QUOTES_DIR, filename)

        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="견적서를 찾을 수 없습니다.")

        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        return data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/delete-quote/{quote_id}")
async def delete_quote(quote_id: str):
    """저장된 견적서 삭제"""
    try:
        filename = f"{quote_id}.json"
        filepath = os.path.join(QUOTES_DIR, filename)

        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="견적서를 찾을 수 없습니다.")

        os.remove(filepath)
        return {"success": True, "message": "견적서가 삭제되었습니다."}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
