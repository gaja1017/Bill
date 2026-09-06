from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from io import BytesIO
import os

# 한글 폰트 등록
FONT_NAME = "Helvetica"
FONT_NAME_BOLD = "Helvetica-Bold"
FONT_REGISTERED = False

def register_korean_font():
    global FONT_NAME, FONT_NAME_BOLD, FONT_REGISTERED

    if FONT_REGISTERED:
        return True

    font_dir = os.path.join(os.path.dirname(__file__), "fonts")
    font_path = os.path.join(font_dir, "NanumGothic.ttf")
    font_bold_path = os.path.join(font_dir, "NanumGothicBold.ttf")

    try:
        if os.path.exists(font_path):
            pdfmetrics.registerFont(TTFont("NanumGothic", font_path))
            FONT_NAME = "NanumGothic"
            print(f"Registered font: {font_path}")

            if os.path.exists(font_bold_path):
                pdfmetrics.registerFont(TTFont("NanumGothicBold", font_bold_path))
                FONT_NAME_BOLD = "NanumGothicBold"
                print(f"Registered bold font: {font_bold_path}")
            else:
                FONT_NAME_BOLD = "NanumGothic"

            FONT_REGISTERED = True
            return True
    except Exception as e:
        print(f"Font registration error: {e}")

    return False

# 폰트 등록 시도
register_korean_font()

# Colors
LG_MAGENTA = colors.HexColor("#E6007E")
DARK_GRAY = colors.HexColor("#333333")
LIGHT_GRAY = colors.HexColor("#F5F5F5")
MEDIUM_GRAY = colors.HexColor("#808080")
BORDER_GRAY = colors.HexColor("#CCCCCC")
HEADER_BG = colors.HexColor("#F0F0F0")
TOTAL_BG = colors.HexColor("#FFE4E9")
WHITE = colors.white


def format_number(amount: int) -> str:
    if amount == 0:
        return "0"
    return f"{amount:,}"


def generate_quote_pdf(quote_data: dict) -> BytesIO:
    # 폰트 재등록 확인
    register_korean_font()

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
    )

    elements = []
    page_width = A4[0] - 30 * mm

    # === HEADER SECTION ===
    # Logo
    logo_style = ParagraphStyle(
        'Logo',
        fontName=FONT_NAME_BOLD,
        fontSize=20,
        textColor=LG_MAGENTA,
        alignment=TA_CENTER
    )
    logo_content = Paragraph('LG U+', logo_style)

    logo_table = Table([[logo_content]], colWidths=[45*mm], rowHeights=[25*mm])
    logo_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_GRAY),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))

    # QUOTATION title
    quotation_style = ParagraphStyle(
        'Quotation',
        fontName=FONT_NAME,
        fontSize=22,
        textColor=MEDIUM_GRAY,
        alignment=TA_LEFT
    )
    quotation_text = Paragraph('QUOTATION', quotation_style)

    # Customer info
    customer_name = quote_data.get('customer_name', '')
    quote_title = quote_data.get('quote_title', '오피스넷 견적')
    quote_date = quote_data.get('quote_date', '')

    info_style = ParagraphStyle(
        'Info',
        fontName=FONT_NAME,
        fontSize=9,
        textColor=DARK_GRAY,
        leading=14
    )

    customer_title_style = ParagraphStyle(
        'CustomerTitle',
        fontName=FONT_NAME_BOLD,
        fontSize=14,
        textColor=DARK_GRAY
    )

    customer_para = Paragraph(f'{customer_name} 귀하', customer_title_style)

    info_data = [
        [Paragraph(f'견적명    {quote_title}', info_style)],
        [Paragraph(f'견적일    {quote_date}', info_style)],
        [Paragraph(f'참  조    {customer_name}', info_style)],
    ]
    info_table = Table(info_data, colWidths=[70*mm])

    center_data = [
        [quotation_text],
        [Spacer(1, 3*mm)],
        [customer_para],
        [Spacer(1, 2*mm)],
        [info_table],
    ]
    center_section = Table(center_data, colWidths=[72*mm])

    # Manager info box
    manager_name = quote_data.get('manager_name', '')
    manager_phone = quote_data.get('manager_phone', '')
    manager_fax = quote_data.get('manager_fax', '') or ''
    manager_email = quote_data.get('manager_email', '')

    label_style = ParagraphStyle('Label', fontName=FONT_NAME_BOLD, fontSize=8, textColor=DARK_GRAY)
    value_style = ParagraphStyle('Value', fontName=FONT_NAME, fontSize=8, textColor=DARK_GRAY)

    manager_data = [
        [Paragraph('담당자명', label_style), Paragraph(manager_name, value_style)],
        [Paragraph('연락처', label_style), Paragraph(manager_phone, value_style)],
        [Paragraph('Tel', label_style), Paragraph('', value_style)],
        [Paragraph('Fax', label_style), Paragraph(manager_fax, value_style)],
        [Paragraph('E-mail', label_style), Paragraph(manager_email, value_style)],
    ]

    manager_table = Table(manager_data, colWidths=[15*mm, 42*mm])
    manager_table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_GRAY),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
    ]))

    # Main header layout
    header_data = [[logo_table, center_section, manager_table]]
    header_table = Table(header_data, colWidths=[48*mm, 74*mm, 58*mm])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))

    elements.append(header_table)
    elements.append(Spacer(1, 10*mm))

    # === MONTHLY PAYMENT SECTION ===
    section_title_style = ParagraphStyle('SectionTitle', fontName=FONT_NAME_BOLD, fontSize=10, textColor=DARK_GRAY)
    unit_style = ParagraphStyle('Unit', fontName=FONT_NAME, fontSize=8, textColor=MEDIUM_GRAY, alignment=TA_RIGHT)

    # Section header with left magenta border
    section_header_data = [[
        Paragraph('1. 매월 납부 금액', section_title_style),
        Paragraph('(단위 : 원/월, VAT 포함)', unit_style)
    ]]

    section_header = Table(section_header_data, colWidths=[page_width*0.7, page_width*0.3])
    section_header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HEADER_BG),
        ('LINEBEFORE', (0,0), (0,-1), 3, LG_MAGENTA),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (0,-1), 10),
    ]))
    elements.append(section_header)

    # Table styles
    th_style = ParagraphStyle('TH', fontName=FONT_NAME_BOLD, fontSize=9, textColor=DARK_GRAY, alignment=TA_CENTER)
    td_style = ParagraphStyle('TD', fontName=FONT_NAME, fontSize=9, textColor=DARK_GRAY)
    td_right_style = ParagraphStyle('TDRight', fontName=FONT_NAME, fontSize=9, textColor=DARK_GRAY, alignment=TA_RIGHT)
    td_center_style = ParagraphStyle('TDCenter', fontName=FONT_NAME, fontSize=9, textColor=DARK_GRAY, alignment=TA_CENTER)

    # Column widths - matching screenshot proportions
    col_widths = [page_width*0.12, page_width*0.14, page_width*0.30, page_width*0.15, page_width*0.12, page_width*0.17]

    # Monthly table header
    monthly_headers = ['품목', '서비스 종류', '서비스명', '단가', '수량', '금액']
    header_row = [Paragraph(h, th_style) for h in monthly_headers]

    monthly_data = [header_row]
    monthly_total = 0

    products = quote_data.get("products", [])
    equipments = quote_data.get("equipments", [])

    # Filter out equipment with 0 price
    active_equipments = [eq for eq in equipments if eq.get("unit_price", 0) > 0]

    # Products - 서비스 항목 (VAT 포함 금액 그대로 사용)
    num_products = len(products)
    for idx, product in enumerate(products):
        unit_price = product.get("unit_price", 0)  # VAT 포함 금액
        line_count = product.get("line_count", 1)
        speed = product.get("speed", "")
        ip_type = product.get("ip_type", "")
        amount = unit_price * line_count
        monthly_total += amount

        service_name = f"오피스넷 {ip_type} {speed}"

        row = [
            Paragraph('서비스' if idx == 0 else '', td_style),
            Paragraph('오피스넷' if idx == 0 else '', td_style),
            Paragraph(service_name, td_style),
            Paragraph(format_number(unit_price), td_right_style),
            Paragraph(str(line_count), td_center_style),
            Paragraph(format_number(amount), td_right_style),
        ]
        monthly_data.append(row)

    # Equipment rentals - 통신장비 항목 (VAT 포함 금액 그대로 사용)
    num_equipments = len(active_equipments)
    for idx, eq in enumerate(active_equipments):
        eq_name = eq.get("name", "")
        eq_price = eq.get("unit_price", 0)  # VAT 포함 금액
        eq_qty = eq.get("quantity", 1)
        eq_amount = eq_price * eq_qty
        monthly_total += eq_amount

        row = [
            Paragraph('통신장비' if idx == 0 else '', td_style),
            Paragraph('장비임대' if idx == 0 else '', td_style),
            Paragraph(eq_name, td_style),
            Paragraph(format_number(eq_price), td_right_style),
            Paragraph(str(eq_qty), td_center_style),
            Paragraph(format_number(eq_amount), td_right_style),
        ]
        monthly_data.append(row)

    # 합계 row
    total_data_rows = num_products + num_equipments
    monthly_data.append([
        Paragraph('', td_style),
        Paragraph('합계', td_center_style),
        Paragraph('', td_style),
        Paragraph('', td_style),
        Paragraph('', td_style),
        Paragraph(format_number(monthly_total), td_right_style),
    ])

    monthly_table = Table(monthly_data, colWidths=col_widths)

    table_style_commands = [
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_GRAY),
        ('BACKGROUND', (0,0), (-1,0), HEADER_BG),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        # 합계 row 배경색
        ('BACKGROUND', (-1,-1), (-1,-1), TOTAL_BG),
        ('TEXTCOLOR', (-1,-1), (-1,-1), LG_MAGENTA),
    ]

    # Span for products (서비스/오피스넷)
    if num_products > 1:
        table_style_commands.append(('SPAN', (0,1), (0, num_products)))
        table_style_commands.append(('SPAN', (1,1), (1, num_products)))

    # Span for equipment (통신장비/장비임대)
    if num_equipments > 1:
        eq_start_row = 1 + num_products
        eq_end_row = eq_start_row + num_equipments - 1
        table_style_commands.append(('SPAN', (0, eq_start_row), (0, eq_end_row)))
        table_style_commands.append(('SPAN', (1, eq_start_row), (1, eq_end_row)))

    monthly_table.setStyle(TableStyle(table_style_commands))
    elements.append(monthly_table)
    elements.append(Spacer(1, 10*mm))

    # === ONE-TIME PAYMENT SECTION ===
    section_header_data2 = [[
        Paragraph('2. 일회성 납부 금액', section_title_style),
        Paragraph('(단위 : 원, VAT 포함)', unit_style)
    ]]

    section_header2 = Table(section_header_data2, colWidths=[page_width*0.7, page_width*0.3])
    section_header2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HEADER_BG),
        ('LINEBEFORE', (0,0), (0,-1), 3, LG_MAGENTA),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (0,-1), 10),
    ]))
    elements.append(section_header2)

    onetime_headers = ['품목', '서비스 종류', '서비스명', '단가', '수량', '금액']
    onetime_header_row = [Paragraph(h, th_style) for h in onetime_headers]

    onetime_data = [onetime_header_row]
    onetime_total = 0

    one_time_charges = quote_data.get("one_time_charges", [])
    # Filter out charges with 0 price
    active_charges = [ch for ch in one_time_charges if ch.get("unit_price", 0) > 0]

    if active_charges:
        for idx, ch in enumerate(active_charges):
            ch_name = ch.get("name", "")
            display_name = "인터넷 설치비" if ch_name == "설치비" else ch_name
            service_type = "통신장비" if ch_name == "통신렉" else "설치비"

            ch_price = ch.get("unit_price", 0)  # VAT 포함 금액
            ch_qty = ch.get("quantity", 1)
            ch_amount = ch_price * ch_qty
            onetime_total += ch_amount

            row = [
                Paragraph('1회성 비용' if idx == 0 else '', td_style),
                Paragraph(service_type, td_style),
                Paragraph(display_name, td_style),
                Paragraph(format_number(ch_price), td_right_style),
                Paragraph(str(ch_qty), td_center_style),
                Paragraph(format_number(ch_amount), td_right_style),
            ]
            onetime_data.append(row)
    else:
        # No active charges - show empty placeholder
        onetime_data.append([
            Paragraph('1회성 비용', td_style),
            Paragraph('-', td_center_style),
            Paragraph('해당 없음', td_style),
            Paragraph('0', td_right_style),
            Paragraph('-', td_center_style),
            Paragraph('0', td_right_style),
        ])

    # 합계 row
    onetime_data.append([
        Paragraph('', td_style),
        Paragraph('합계', td_center_style),
        Paragraph('', td_style),
        Paragraph('', td_style),
        Paragraph('', td_style),
        Paragraph(format_number(onetime_total), td_right_style),
    ])

    onetime_table = Table(onetime_data, colWidths=col_widths)

    onetime_style_commands = [
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_GRAY),
        ('BACKGROUND', (0,0), (-1,0), HEADER_BG),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        # 합계 row 배경색
        ('BACKGROUND', (-1,-1), (-1,-1), TOTAL_BG),
        ('TEXTCOLOR', (-1,-1), (-1,-1), LG_MAGENTA),
    ]

    if len(active_charges) > 1:
        onetime_style_commands.append(('SPAN', (0,1), (0, len(active_charges))))

    onetime_table.setStyle(TableStyle(onetime_style_commands))
    elements.append(onetime_table)
    elements.append(Spacer(1, 8*mm))

    # === FOOTER ===
    footer_style = ParagraphStyle('Footer', fontName=FONT_NAME, fontSize=8, textColor=DARK_GRAY, leading=12)

    description = '오피스넷 : 중소기업, 프랜차이즈, 자영업자 등 SME 고객을 대상으로 고객 댁내까지 광케이블을 구성하여 100M부터 최대 10G의 속도를 제공하는 기업 인터넷 서비스 입니다.'
    elements.append(Paragraph(description, footer_style))

    description2 = '(유동IP는 단독사용 가능, 고정IP는 유동IP 1개 필수 사용)'
    elements.append(Paragraph(description2, footer_style))
    elements.append(Spacer(1, 4*mm))

    # 특이사항
    note_title_style = ParagraphStyle('NoteTitle', fontName=FONT_NAME_BOLD, fontSize=9, textColor=DARK_GRAY)
    elements.append(Paragraph('특 이 사 항', note_title_style))
    elements.append(Spacer(1, 2*mm))

    notes = quote_data.get("notes", "")
    default_notes = '''※ 견적유효기간: 견적일로부터 1개월 이내
※ 계약기간 : 3년 (신규설치비 면제, 광모뎀 임대료 면제, L2스위치 임대료 할인가 적용, 광모뎀/L2스위치 선택가능)
※ 외곽지, 신규 건설현장 등은 초과 공사비가 별도 발생 하거나, 신규개통이 불가할 수 있습니다.
※ 제반 사항은 LG유플러스 서비스 이용 약관에 따름
※ 상기 금액은 VAT 포함 금액입니다.'''

    if notes:
        default_notes = notes

    for line in default_notes.split('\n'):
        if line.strip():
            elements.append(Paragraph(line.strip(), footer_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer
