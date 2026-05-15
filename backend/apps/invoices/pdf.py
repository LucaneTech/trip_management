from io import BytesIO
from decimal import Decimal
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable


def generate_invoice_pdf(invoice) -> BytesIO:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=1.5 * cm,
        bottomMargin=2 * cm,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    brand_color = colors.HexColor('#0D2144')
    accent_color = colors.HexColor('#0EA5E9')

    title_style = ParagraphStyle('Title', parent=styles['Normal'],
                                 fontSize=22, fontName='Helvetica-Bold',
                                 textColor=brand_color)
    sub_style = ParagraphStyle('Sub', parent=styles['Normal'],
                               fontSize=9, textColor=colors.HexColor('#64748B'))
    label_style = ParagraphStyle('Label', parent=styles['Normal'],
                                 fontSize=9, fontName='Helvetica-Bold',
                                 textColor=colors.HexColor('#374151'))
    value_style = ParagraphStyle('Value', parent=styles['Normal'],
                                 fontSize=9, textColor=colors.HexColor('#111827'))
    right_style = ParagraphStyle('Right', parent=styles['Normal'],
                                 fontSize=9, alignment=TA_RIGHT,
                                 textColor=colors.HexColor('#374151'))
    total_style = ParagraphStyle('Total', parent=styles['Normal'],
                                 fontSize=13, fontName='Helvetica-Bold',
                                 textColor=brand_color, alignment=TA_RIGHT)
    footer_style = ParagraphStyle('Footer', parent=styles['Normal'],
                                  fontSize=8, textColor=colors.HexColor('#9CA3AF'),
                                  alignment=TA_CENTER)

    booking = invoice.booking
    trip = booking.trip
    customer = booking.customer
    customer_name = f'{customer.first_name} {customer.last_name}'.strip() or customer.username

    elements = []

    # ── Header ────────────────────────────────────────────────────────────────
    header_data = [[
        Paragraph('✈ TripManager', title_style),
        Paragraph(
            f'<b>FACTURE</b><br/><font color="#0EA5E9">{invoice.invoice_number}</font>',
            ParagraphStyle('InvNum', parent=styles['Normal'], fontSize=16,
                           fontName='Helvetica-Bold', alignment=TA_RIGHT,
                           textColor=brand_color),
        ),
    ]]
    header_table = Table(header_data, colWidths=[9 * cm, 8 * cm])
    header_table.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
    elements.append(header_table)
    elements.append(Spacer(1, 0.3 * cm))
    elements.append(HRFlowable(width='100%', thickness=2, color=accent_color))
    elements.append(Spacer(1, 0.6 * cm))

    # ── Meta row (date + statut) ───────────────────────────────────────────────
    date_str = invoice.generated_at.strftime('%d/%m/%Y')
    meta_data = [[
        Paragraph(f'Date d\'émission : <b>{date_str}</b>', sub_style),
        Paragraph(f'Statut réservation : <b>{booking.get_status_display()}</b>', right_style),
    ]]
    meta_table = Table(meta_data, colWidths=[9 * cm, 8 * cm])
    elements.append(meta_table)
    elements.append(Spacer(1, 0.8 * cm))

    # ── Client / Company info ─────────────────────────────────────────────────
    info_data = [[
        [
            Paragraph('FACTURÉ À', ParagraphStyle('Sect', parent=styles['Normal'],
                       fontSize=8, fontName='Helvetica-Bold',
                       textColor=colors.HexColor('#9CA3AF'))),
            Spacer(1, 0.15 * cm),
            Paragraph(f'<b>{customer_name}</b>', label_style),
            Paragraph(customer.email, value_style),
            Paragraph(customer.phone or '—', value_style),
        ],
        [
            Paragraph('ÉMIS PAR', ParagraphStyle('Sect', parent=styles['Normal'],
                       fontSize=8, fontName='Helvetica-Bold',
                       textColor=colors.HexColor('#9CA3AF'))),
            Spacer(1, 0.15 * cm),
            Paragraph('<b>TripManager SAS</b>', label_style),
            Paragraph('contact@tripmanager.com', value_style),
            Paragraph('123 Rue du Voyage, Paris 75001', value_style),
        ],
    ]]
    info_table = Table(info_data, colWidths=[8.5 * cm, 8.5 * cm])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#F8FAFC')),
        ('BACKGROUND', (1, 0), (1, 0), colors.HexColor('#F0F9FF')),
        ('BOX', (0, 0), (0, 0), 0.5, colors.HexColor('#E2E8F0')),
        ('BOX', (1, 0), (1, 0), 0.5, colors.HexColor('#BAE6FD')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 1 * cm))

    # ── Line items ────────────────────────────────────────────────────────────
    unit_price = Decimal(str(trip.price))
    seats = booking.seats
    total = unit_price * seats

    items_header = [
        Paragraph('Description', ParagraphStyle('TH', parent=styles['Normal'],
                   fontSize=9, fontName='Helvetica-Bold', textColor=colors.white)),
        Paragraph('Dates', ParagraphStyle('TH', parent=styles['Normal'],
                   fontSize=9, fontName='Helvetica-Bold', textColor=colors.white,
                   alignment=TA_CENTER)),
        Paragraph('Qté', ParagraphStyle('TH', parent=styles['Normal'],
                   fontSize=9, fontName='Helvetica-Bold', textColor=colors.white,
                   alignment=TA_RIGHT)),
        Paragraph('Prix unit.', ParagraphStyle('TH', parent=styles['Normal'],
                   fontSize=9, fontName='Helvetica-Bold', textColor=colors.white,
                   alignment=TA_RIGHT)),
        Paragraph('Total', ParagraphStyle('TH', parent=styles['Normal'],
                   fontSize=9, fontName='Helvetica-Bold', textColor=colors.white,
                   alignment=TA_RIGHT)),
    ]

    start = trip.start_date.strftime('%d/%m/%Y') if hasattr(trip.start_date, 'strftime') else str(trip.start_date)
    end = trip.end_date.strftime('%d/%m/%Y') if hasattr(trip.end_date, 'strftime') else str(trip.end_date)

    items_row = [
        Paragraph(f'<b>{trip.title}</b><br/><font size="8" color="#64748B">{trip.destination}</font>', value_style),
        Paragraph(f'{start}<br/>→ {end}', ParagraphStyle('DateCell', parent=styles['Normal'],
                   fontSize=8, textColor=colors.HexColor('#374151'), alignment=TA_CENTER)),
        Paragraph(str(seats), ParagraphStyle('Num', parent=styles['Normal'],
                   fontSize=9, alignment=TA_RIGHT)),
        Paragraph(f'{unit_price:,.2f} MAD', ParagraphStyle('Num', parent=styles['Normal'],
                   fontSize=9, alignment=TA_RIGHT)),
        Paragraph(f'<b>{total:,.2f} MAD</b>', ParagraphStyle('Num', parent=styles['Normal'],
                   fontSize=9, fontName='Helvetica-Bold', alignment=TA_RIGHT)),
    ]

    items_table = Table(
        [items_header, items_row],
        colWidths=[6.5 * cm, 3.5 * cm, 1.5 * cm, 2.5 * cm, 3 * cm],
    )
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), brand_color),
        ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('PADDING', (0, 0), (-1, -1), 7),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 0.5 * cm))

    # ── Total block ───────────────────────────────────────────────────────────
    total_data = [
        ['', Paragraph('Sous-total', right_style), Paragraph(f'{total:,.2f} MAD', right_style)],
        ['', Paragraph('TVA (0%)', right_style), Paragraph('0,00 MAD', right_style)],
        ['', Paragraph('<b>TOTAL TTC</b>', ParagraphStyle('Tot', parent=styles['Normal'],
                        fontSize=11, fontName='Helvetica-Bold', alignment=TA_RIGHT,
                        textColor=brand_color)),
             Paragraph(f'<b>{total:,.2f} MAD</b>', ParagraphStyle('Tot', parent=styles['Normal'],
                        fontSize=11, fontName='Helvetica-Bold', alignment=TA_RIGHT,
                        textColor=accent_color))],
    ]
    total_table = Table(total_data, colWidths=[9 * cm, 5 * cm, 3 * cm])
    total_table.setStyle(TableStyle([
        ('LINEABOVE', (1, 2), (2, 2), 1, brand_color),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(total_table)
    elements.append(Spacer(1, 1.5 * cm))

    # ── Footer ────────────────────────────────────────────────────────────────
    elements.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#E2E8F0')))
    elements.append(Spacer(1, 0.3 * cm))
    elements.append(Paragraph(
        'TripManager SAS — SIRET 123 456 789 00010 — contact@tripmanager.com — www.tripmanager.com<br/>'
        'Ce document tient lieu de facture conformément à la législation en vigueur.',
        footer_style,
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer
