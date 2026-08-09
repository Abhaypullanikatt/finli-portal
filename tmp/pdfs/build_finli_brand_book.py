from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.utils import ImageReader


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "pdf" / "finli-brand-book.pdf"
LOGO = ROOT / "assets" / "branding" / "finli-logo.png"
LOGO_LIGHT = ROOT / "tmp" / "pdfs" / "finli-logo-light.png"
FONT_DIR = ROOT / "apps" / "mobile" / "assets" / "fonts"

PAGE_W, PAGE_H = landscape(A4)
M = 18 * mm

FOREST = HexColor("#173F32")
FOREST_DEEP = HexColor("#0C2923")
LIME = HexColor("#C9F36A")
CANVAS = HexColor("#F3F2EE")
SURFACE = HexColor("#FBFAF7")
SKY = HexColor("#C9EDFB")
PEACH = HexColor("#F2C8AC")
INK = HexColor("#11110F")
MUTED = HexColor("#6F706A")
BLUE_INK = HexColor("#153E48")
LINE = HexColor("#D7D9D1")
WHITE = colors.white


def register_fonts():
    regular = FONT_DIR / "InterDisplay-SemiBold.ttf"
    semibold = FONT_DIR / "InterDisplay-SemiBold.ttf"
    bold = FONT_DIR / "InterDisplay-Bold.ttf"
    extra = FONT_DIR / "InterDisplay-ExtraBold.ttf"
    for name, path in [
        ("FinliLight", regular),
        ("FinliSemi", semibold),
        ("FinliBold", bold),
        ("FinliExtra", extra),
    ]:
        if path.exists():
            pdfmetrics.registerFont(TTFont(name, str(path)))
    for family in ("Finli", "FinliLight", "FinliSemi", "FinliBold", "FinliExtra"):
        registerFontFamily(family, normal="FinliLight", bold="FinliBold", italic="FinliLight", boldItalic="FinliExtra")


register_fonts()
FONT = "FinliLight"
FONT_SEMI = "FinliSemi"
FONT_BOLD = "FinliBold"
FONT_EXTRA = "FinliExtra"


def para(c, text, x, y_top, w, style, h=None):
    p = Paragraph(text, style)
    _, ph = p.wrap(w, h or PAGE_H)
    p.drawOn(c, x, y_top - ph)
    return ph


def style(name, size, color=INK, leading=None, font=FONT, align=TA_LEFT, space_after=0):
    return ParagraphStyle(
        name,
        fontName=font,
        fontSize=size,
        leading=leading or size * 1.25,
        textColor=color,
        alignment=align,
        spaceAfter=space_after,
    )


HERO = style("hero", 38, FOREST_DEEP, 37, FONT_LIGHT if False else FONT, TA_LEFT)
DECK = style("deck", 13, BLUE_INK, 19, FONT_SEMI)
BODY = style("body", 10.5, MUTED, 15, FONT)
BODY_DARK = style("bodydark", 10.5, HexColor("#DDE8D9"), 15, FONT)
SMALL = style("small", 7.5, MUTED, 10, FONT)
LABEL = style("label", 7, FOREST, 9, FONT_BOLD)
SECTION = style("section", 26, FOREST, 29, FONT_SEMI)
CARD_TITLE = style("cardtitle", 13, FOREST, 16, FONT_SEMI)
CARD_BODY = style("cardbody", 9, MUTED, 13, FONT)


def page_bg(c, fill=CANVAS):
    c.setFillColor(fill)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)


def page_number(c, n, label="FINLI BRAND BOOK"):
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.line(M, 12 * mm, PAGE_W - M, 12 * mm)
    c.setFont(FONT_BOLD, 6.5)
    c.setFillColor(MUTED)
    c.drawString(M, 7 * mm, label)
    c.drawRightString(PAGE_W - M, 7 * mm, f"{n:02d}")


def pill(c, text, x, y, fill=LIME, text_color=FOREST, width=None):
    c.setFont(FONT_BOLD, 7.5)
    width = width or (c.stringWidth(text, FONT_BOLD, 7.5) + 16)
    c.setFillColor(fill)
    c.roundRect(x, y, width, 18, 9, fill=1, stroke=0)
    c.setFillColor(text_color)
    c.drawCentredString(x + width / 2, y + 6, text)
    return width


def logo(c, x, y, w, h=None, image_path=LOGO):
    if not image_path.exists():
        return
    img = ImageReader(str(image_path))
    iw, ih = img.getSize()
    h = h or w * ih / iw
    c.drawImage(img, x, y, width=w, height=h, preserveAspectRatio=True, mask="auto")


def swatch(c, x, y, w, h, color, label, value, text_color=INK):
    c.setFillColor(color)
    c.roundRect(x, y, w, h, 12, fill=1, stroke=0)
    c.setFillColor(text_color if text_color else (WHITE if color == FOREST else INK))
    c.setFont(FONT_SEMI, 9)
    c.drawString(x + 12, y + h - 19, label)
    c.setFont(FONT_BOLD, 8)
    c.drawString(x + 12, y + 11, value)


def card(c, x, y, w, h, fill=SURFACE, stroke=LINE, radius=14):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(0.6)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)


def title_block(c, eyebrow, title, body, page, dark=False):
    ink = WHITE if dark else FOREST
    muted = HexColor("#DDE8D9") if dark else MUTED
    c.setFont(FONT_BOLD, 7)
    c.setFillColor(LIME if dark else FOREST)
    c.drawString(M, PAGE_H - 25 * mm, eyebrow.upper())
    para(c, title, M, PAGE_H - 35 * mm, 520, style("t", 29, ink, 32, FONT_SEMI))
    para(c, body, M, PAGE_H - 75 * mm, 480, style("b", 10.5, muted, 15, FONT))
    page_number(c, page)


def draw_cover(c):
    page_bg(c, FOREST_DEEP)
    c.setFillColor(FOREST)
    c.circle(PAGE_W - 64 * mm, PAGE_H - 32 * mm, 72 * mm, fill=1, stroke=0)
    c.setFillColor(LIME)
    c.circle(PAGE_W - 34 * mm, 30 * mm, 28 * mm, fill=1, stroke=0)
    logo(c, M, PAGE_H - 69 * mm, 265, 177, LOGO_LIGHT)
    c.setFont(FONT_BOLD, 8)
    c.setFillColor(LIME)
    c.drawString(M, 75 * mm, "FINLI / BRAND BOOK")
    para(c, "A calm, clear system for better money decisions.", M, 67 * mm, 430, style("cover", 28, WHITE, 31, FONT_SEMI))
    para(c, "Logo, colour, type, product UI, voice and usage guidelines", M, 37 * mm, 390, style("cover2", 11, HexColor("#DDE8D9"), 15, FONT))
    c.setFont(FONT_BOLD, 7)
    c.setFillColor(HexColor("#9BB7A1"))
    c.drawString(M, 14 * mm, "VERSION 1.0  /  AUGUST 2026")


def draw_platform(c):
    page_bg(c)
    title_block(c, "01 / Brand platform", "Money clarity without the money jargon.", "Finli turns everyday money signals into a clear, explainable next step. It is calm, useful and never built around pressure.", 2)
    cols = [(M, 205, "Promise", "Make the next money decision easier to understand."),
            (M + 225, 205, "Personality", "Calm, capable, human, optimistic and transparent."),
            (M + 450, 175, "Principle", "Explain first. Let the user decide."),]
    y = 90
    for x, w, head, body in cols:
        card(c, x, y, w, 112, fill=SURFACE)
        c.setFillColor(LIME if head == "Promise" else (SKY if head == "Personality" else PEACH))
        c.circle(x + 25, y + 83, 10, fill=1, stroke=0)
        para(c, head, x + 18, y + 58, w - 36, CARD_TITLE)
        para(c, body, x + 18, y + 36, w - 36, CARD_BODY)
    c.setFillColor(FOREST)
    c.roundRect(M, 38, PAGE_W - 2 * M, 29, 15, fill=1, stroke=0)
    c.setFillColor(LIME)
    c.setFont(FONT_SEMI, 10)
    c.drawString(M + 18, 49, "Know your money. See your next move. Stay in control.")
    page_number(c, 2)


def draw_logo_page(c):
    page_bg(c, SURFACE)
    title_block(c, "02 / Logo system", "A path that ends in a confident check.", "The Finli mark combines a circular money world, a rising path and a checkmark. Use the full lockup for brand moments and the standalone icon for compact surfaces.", 3)
    card(c, M, 104, 420, 135, fill=WHITE)
    logo(c, M + 35, 140, 345)
    c.setFont(FONT_BOLD, 7)
    c.setFillColor(MUTED)
    c.drawString(M + 18, 116, "PRIMARY LOCKUP / USE ON LIGHT SURFACES")
    card(c, M + 445, 104, 165, 135, fill=FOREST)
    logo(c, M + 470, 139, 115, image_path=LOGO_LIGHT)
    c.setFillColor(LIME)
    c.setFont(FONT_BOLD, 7)
    c.drawCentredString(M + 527, 116, "DARK SURFACE")
    c.setStrokeColor(FOREST)
    c.setLineWidth(1)
    c.rect(M + 32, 62, 150, 29, fill=0, stroke=1)
    c.setFont(FONT_BOLD, 7)
    c.setFillColor(MUTED)
    c.drawString(M + 32, 50, "CLEAR SPACE = ICON HEIGHT / 4")
    c.setFont(FONT_SEMI, 10)
    c.setFillColor(FOREST)
    c.drawString(M + 250, 78, "Always leave breathing room around the mark.")
    c.setFont(FONT, 9)
    c.setFillColor(MUTED)
    c.drawString(M + 250, 61, "Do not crop, stretch, outline or add effects.")
    page_number(c, 3)


def draw_colour_page(c):
    page_bg(c)
    title_block(c, "03 / Colour system", "Trust first. Growth second.", "The palette is rooted in deep forest green and lime growth, softened by warm paper, sky and peach. Use contrast deliberately: lime is an accent, not body text.", 4)
    swatch(c, M, 167, 178, 100, FOREST, "Primary / Deep Forest", "#173F32", WHITE)
    swatch(c, M + 192, 167, 178, 100, LIME, "Secondary / Lime Growth", "#C9F36A", FOREST)
    swatch(c, M + 384, 167, 178, 100, SKY, "Support / Open Sky", "#C9EDFB", BLUE_INK)
    swatch(c, M, 49, 178, 100, CANVAS, "Canvas / Warm Neutral", "#F3F2EE", INK)
    swatch(c, M + 192, 49, 178, 100, PEACH, "Support / Human Warmth", "#F2C8AC", INK)
    swatch(c, M + 384, 49, 178, 100, INK, "Text / Ink", "#11110F", WHITE)
    card(c, M + 590, 49, 125, 218, fill=WHITE)
    para(c, "Use ratios", M + 607, 247, 92, CARD_TITLE)
    para(c, "60% warm neutral\n25% forest\n10% sky or peach\n5% lime", M + 607, 220, 90, style("ratio", 10, MUTED, 16, FONT))
    para(c, "Lime on white is decorative only. Use forest text or a forest button for readable actions.", M + 607, 136, 90, style("note", 8, MUTED, 12, FONT))
    page_number(c, 4)


def draw_type_page(c):
    page_bg(c, SURFACE)
    title_block(c, "04 / Typography", "Soft geometry. Clear hierarchy.", "Finli uses a modern grotesk with generous spacing and short, human sentences. The type should feel considered, never loud.", 5)
    c.setFillColor(FOREST)
    c.setFont(FONT_EXTRA, 35)
    c.drawString(M, 208, "Money clarity")
    c.setFont(FONT_SEMI, 17)
    c.drawString(M, 177, "A confident next step.")
    c.setFont(FONT, 11)
    c.setFillColor(MUTED)
    c.drawString(M, 151, "Use body copy to explain what matters now, why it matters, and what the user can do next.")
    card(c, 460, 74, 255, 165, fill=WHITE)
    para(c, "Type scale", 480, 218, 200, CARD_TITLE)
    for yy, size, label in [(180, 26, "Display / 26-40"), (149, 16, "Heading / 16-24"), (120, 11, "Body / 10-14"), (94, 8, "Meta / 7-9")]:
        c.setFillColor(FOREST if size > 11 else MUTED)
        c.setFont(FONT_SEMI if size > 11 else FONT_BOLD, size)
        c.drawString(480, yy, "Finli")
        c.setFillColor(MUTED)
        c.setFont(FONT_BOLD, 7)
        c.drawString(550, yy + 2, label)
    page_number(c, 5)


def draw_foundations_page(c):
    page_bg(c)
    title_block(c, "05 / Foundations", "Every screen should feel like one calm system.", "Use rounded surfaces, quiet borders, generous spacing and one clear action. The interface should reduce financial anxiety, not add visual noise.", 6)
    # spacing rail
    c.setFillColor(FOREST)
    c.roundRect(M, 72, 185, 165, 18, fill=1, stroke=0)
    c.setFillColor(LIME)
    c.setFont(FONT_BOLD, 7)
    c.drawString(M + 18, 215, "SPACING")
    c.setFillColor(WHITE)
    for i, (n, label) in enumerate([(8, "micro"), (16, "control"), (24, "card"), (40, "section"), (64, "hero")]):
        yy = 190 - i * 23
        c.setFillColor(LIME if i == 4 else HexColor("#7BA88A"))
        c.roundRect(M + 18, yy, n * 1.3, 7, 3, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont(FONT_BOLD, 7)
        c.drawString(M + 105, yy + 1, f"{n}px / {label}")
    # UI sample
    card(c, M + 220, 72, 495, 165, fill=SURFACE)
    c.setFillColor(MUTED)
    c.setFont(FONT_BOLD, 7)
    c.drawString(M + 245, 214, "FOUNDATION SAMPLE")
    c.setFillColor(FOREST)
    c.setFont(FONT_SEMI, 19)
    c.drawString(M + 245, 184, "Your next money move")
    c.setFillColor(MUTED)
    c.setFont(FONT, 9)
    c.drawString(M + 245, 164, "Build your buffer before you increase risk.")
    c.setFillColor(LIME)
    c.roundRect(M + 245, 119, 150, 29, 15, fill=1, stroke=0)
    c.setFillColor(FOREST)
    c.setFont(FONT_BOLD, 8)
    c.drawCentredString(M + 320, 130, "See the roadmap")
    c.setStrokeColor(LINE)
    c.roundRect(M + 430, 112, 230, 72, 14, fill=0, stroke=1)
    c.setFillColor(FOREST)
    c.setFont(FONT_BOLD, 8)
    c.drawString(M + 447, 163, "Monthly plan")
    c.setFont(FONT_EXTRA, 25)
    c.drawString(M + 447, 133, "68%")
    c.setFillColor(MUTED)
    c.setFont(FONT, 8)
    c.drawString(M + 500, 137, "needs covered")
    page_number(c, 6)


def draw_components_page(c):
    page_bg(c, SURFACE)
    title_block(c, "06 / Components", "One action per moment.", "Components should make the next step obvious. Keep choices calm, labels specific and feedback immediate.", 7)
    # component cards
    items = [("Primary action", FOREST, WHITE, "Continue"), ("Growth action", LIME, FOREST, "See your plan"), ("Quiet action", SURFACE, FOREST, "Review later")]
    x = M
    for title, fill, fg, label in items:
        card(c, x, 160, 185, 88, fill=WHITE)
        c.setFont(FONT_BOLD, 7)
        c.setFillColor(MUTED)
        c.drawString(x + 16, 228, title.upper())
        c.setFillColor(fill)
        c.roundRect(x + 16, 187, 145, 28, 14, fill=1, stroke=0)
        c.setFillColor(fg)
        c.setFont(FONT_BOLD, 8)
        c.drawCentredString(x + 88, 197, label)
        x += 200
    # status rows
    card(c, M, 56, 585, 78, fill=WHITE)
    para(c, "Status language", M + 16, 119, 140, CARD_TITLE)
    for i, (label, col) in enumerate([("On track", FOREST), ("Ready to review", BLUE_INK), ("Needs attention", HexColor("#9A5A27"))]):
        xx = M + 165 + i * 132
        c.setFillColor(col)
        c.circle(xx, 101, 4, fill=1, stroke=0)
        c.setFillColor(MUTED)
        c.setFont(FONT_BOLD, 8)
        c.drawString(xx + 10, 98, label)
    para(c, "Avoid alarmist red unless the user must act immediately. Explain the issue and give a recovery path.", M + 165, 83, 360, CARD_BODY)
    page_number(c, 7)


def draw_accessibility_page(c):
    page_bg(c)
    title_block(c, "07 / Accessibility", "Calm is also clear.", "Finli should be readable and usable by people with different vision, language, attention and confidence levels.", 8)
    rows = [
        ("Contrast", "Use forest or ink for text. Lime is an accent, not small body copy."),
        ("Language", "Short sentences. Explain terms before using them. Support localization from day one."),
        ("Motion", "Use motion to orient, never to distract. Respect reduced-motion preferences."),
        ("Touch", "Keep primary controls large, spaced and easy to confirm or undo."),
        ("Charts", "Label trends with words and numbers; do not rely on colour alone."),
    ]
    y = 206
    for n, (head, body) in enumerate(rows, 1):
        c.setFillColor(LIME if n % 2 else SKY)
        c.circle(M + 17, y + 3, 11, fill=1, stroke=0)
        c.setFillColor(FOREST)
        c.setFont(FONT_BOLD, 8)
        c.drawCentredString(M + 17, y, str(n))
        para(c, head, M + 40, y + 11, 125, CARD_TITLE)
        para(c, body, M + 195, y + 11, 440, CARD_BODY)
        c.setStrokeColor(LINE)
        c.line(M + 40, y - 19, PAGE_W - M, y - 19)
        y -= 38
    page_number(c, 8)


def draw_imagery_page(c):
    page_bg(c, SURFACE)
    title_block(c, "08 / Imagery and motion", "A garden, not a casino.", "The current website uses a pixel-garden metaphor: steady growth, visible paths and small wins. Keep imagery warm, optimistic and grounded in real progress.", 9)
    card(c, M, 78, 300, 157, fill=SKY, stroke=SKY)
    c.setFillColor(FOREST)
    c.circle(M + 95, 151, 44, fill=1, stroke=0)
    c.setFillColor(LIME)
    c.line(M + 75, 128, M + 128, 181)
    c.setLineWidth(8)
    c.line(M + 75, 128, M + 128, 181)
    c.setStrokeColor(FOREST)
    c.setLineWidth(1)
    c.roundRect(M + 170, 121, 95, 38, 19, fill=0, stroke=1)
    c.setFillColor(FOREST)
    c.setFont(FONT_BOLD, 8)
    c.drawCentredString(M + 218, 136, "small wins")
    card(c, M + 325, 78, 390, 157, fill=FOREST)
    c.setFillColor(LIME)
    c.setFont(FONT_BOLD, 7)
    c.drawString(M + 349, 208, "MOTION RULES")
    para(c, "Reveal context progressively. Let paths, rings and progress bars move slowly. Avoid spinning markets, flashing prices or urgency cues.", M + 349, 185, 320, style("dark2", 12, WHITE, 17, FONT_SEMI))
    para(c, "Preferred subjects: everyday money, quiet routines, small progress, local life, light and open space.", M + 349, 120, 310, BODY_DARK)
    page_number(c, 9)


def draw_voice_page(c):
    page_bg(c, FOREST_DEEP)
    title_block(c, "09 / Voice and messaging", "Friendly expertise, never financial theatre.", "Finli speaks like a calm guide: specific, respectful and honest about uncertainty. The product should help people feel capable, not judged.", 10, dark=True)
    cols = [(M, "Say", "Your spending on shopping is above the target you set. Want to see what that changes?"),
            (M + 255, "Avoid", "You are overspending. Fix this now."),
            (M + 510, "Voice", "Clear, plain, warm and action-oriented.")]
    for x, head, body in cols:
        card(c, x, 84, 215, 123, fill=HexColor("#224E40"), stroke=HexColor("#3A6757"))
        c.setFillColor(LIME)
        c.setFont(FONT_BOLD, 7)
        c.drawString(x + 16, 181, head.upper())
        para(c, body, x + 16, 164, 180, style("voice", 10, WHITE, 14, FONT_SEMI if head == "Say" else FONT))
    c.setFont(FONT_BOLD, 7)
    c.setFillColor(HexColor("#9BB7A1"))
    c.drawString(M, 57, "MESSAGE FORMULA")
    c.setFont(FONT_SEMI, 12)
    c.setFillColor(WHITE)
    c.drawString(M, 39, "What we noticed  +  Why it matters  +  What you can do next")
    page_number(c, 10)


def draw_product_page(c):
    page_bg(c)
    title_block(c, "10 / Product expression", "Make the brand tangible in one glance.", "The product experience should carry the same rhythm as the website: soft paper surfaces, forest anchors, lime progress and one clear next action.", 11)
    # phone mock
    phone_x, phone_y, phone_w, phone_h = M + 25, 45, 215, 225
    c.setFillColor(INK)
    c.roundRect(phone_x, phone_y, phone_w, phone_h, 22, fill=1, stroke=0)
    c.setFillColor(SURFACE)
    c.roundRect(phone_x + 7, phone_y + 7, phone_w - 14, phone_h - 14, 17, fill=1, stroke=0)
    c.setFillColor(FOREST)
    c.setFont(FONT_SEMI, 11)
    c.drawString(phone_x + 22, phone_y + phone_h - 37, "Good morning, Asha")
    c.setFillColor(MUTED)
    c.setFont(FONT, 7.5)
    c.drawString(phone_x + 22, phone_y + phone_h - 52, "Here is your next clear step.")
    c.setFillColor(FOREST)
    c.roundRect(phone_x + 22, phone_y + 94, phone_w - 44, 72, 16, fill=1, stroke=0)
    c.setFillColor(LIME)
    c.setFont(FONT_BOLD, 7)
    c.drawString(phone_x + 37, phone_y + 144, "NEXT PRIORITY")
    c.setFillColor(WHITE)
    c.setFont(FONT_SEMI, 15)
    c.drawString(phone_x + 37, phone_y + 119, "Build your buffer")
    c.setFont(FONT, 7.5)
    c.drawString(phone_x + 37, phone_y + 103, "You are 68% of the way there.")
    c.setFillColor(LIME)
    c.roundRect(phone_x + 22, phone_y + 58, 118, 25, 12, fill=1, stroke=0)
    c.setFillColor(FOREST)
    c.setFont(FONT_BOLD, 7.5)
    c.drawCentredString(phone_x + 81, phone_y + 67, "See your roadmap")
    # rules
    x = M + 285
    for i, (head, body, col) in enumerate([
        ("Anchor", "One forest surface holds the important thing.", FOREST),
        ("Guide", "Lime shows progress or the next action.", LIME),
        ("Soften", "Paper, sky and peach create room to breathe.", SKY),
    ]):
        y = 194 - i * 50
        c.setFillColor(col)
        c.circle(x, y, 11, fill=1, stroke=0)
        para(c, head, x + 25, y + 9, 100, CARD_TITLE)
        para(c, body, x + 155, y + 9, 260, CARD_BODY)
    page_number(c, 11)


def draw_checklist_page(c):
    page_bg(c, FOREST)
    c.setFillColor(LIME)
    c.setFont(FONT_BOLD, 7)
    c.drawString(M, PAGE_H - 25 * mm, "11 / QUICK REFERENCE")
    para(c, "Finli in one page.", M, PAGE_H - 37 * mm, 420, style("last", 32, WHITE, 35, FONT_SEMI))
    items = [
        ("Primary", "#173F32", "Trust, stability, long-term growth"),
        ("Secondary", "#C9F36A", "Progress, clarity, the next action"),
        ("Type", "Inter Display", "Soft geometry, generous leading"),
        ("Voice", "Calm and direct", "Explain, contextualize, invite"),
        ("Image world", "Garden and path", "Small wins over market theatre"),
        ("Rule", "One clear move", "Never overwhelm the user"),
    ]
    y = 208
    for head, value, desc in items:
        c.setFillColor(LIME if y % 2 else SKY)
        c.circle(M + 12, y + 3, 6, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont(FONT_BOLD, 8)
        c.drawString(M + 32, y, head.upper())
        c.setFont(FONT_SEMI, 11)
        c.drawString(M + 130, y, value)
        c.setFillColor(HexColor("#B9D3C0"))
        c.setFont(FONT, 9)
        c.drawString(M + 310, y, desc)
        y -= 31
    c.setStrokeColor(HexColor("#3A6757"))
    c.line(M, 44, PAGE_W - M, 44)
    c.setFillColor(WHITE)
    c.setFont(FONT_SEMI, 12)
    c.drawString(M, 25, "Finli: understand money. Make better moves.")
    c.setFillColor(HexColor("#9BB7A1"))
    c.setFont(FONT_BOLD, 7)
    c.drawRightString(PAGE_W - M, 26, "BRAND BOOK / VERSION 1.0")
    page_number(c, 12, "FINLI BRAND BOOK / REFERENCE")


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=(PAGE_W, PAGE_H))
    c.setTitle("Finli Brand Book")
    c.setAuthor("Finli")
    for draw in [
        draw_cover,
        draw_platform,
        draw_logo_page,
        draw_colour_page,
        draw_type_page,
        draw_foundations_page,
        draw_components_page,
        draw_accessibility_page,
        draw_imagery_page,
        draw_voice_page,
        draw_product_page,
        draw_checklist_page,
    ]:
        draw(c)
        c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
