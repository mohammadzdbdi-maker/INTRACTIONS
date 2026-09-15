# -*- coding: utf-8 -*-
"""ابزارهای چاپ برای بروشور فارسی (RTL) با ReportLab و فونت Arad."""
import arabic_reshaper
from bidi.algorithm import get_display
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors

FONT_PATH = 'arad_regular.ttf'
pdfmetrics.registerFont(TTFont('Arad', FONT_PATH))
F = 'Arad'

# ابعاد A4 افقی (Landscape) بر حسب point
W, H = 841.89, 595.28
M = 24.0                 # حاشیه
CW = W - 2 * M           # عرض ناحیه محتوا

# پالت رنگی
# پالت خاکستری — مناسب چاپ سیاه‌وسفید
NAVY = colors.HexColor('#262626')
TEAL = colors.HexColor('#4A4A4A')
BLUE = colors.HexColor('#3D3D3D')
INK = colors.HexColor('#171717')
GRAY = colors.HexColor('#5C5C5C')
LIGHT = colors.HexColor('#F4F4F4')
LINE = colors.HexColor('#ADADAD')
WHITE = colors.white
RED = colors.HexColor('#1A1A1A')
ORANGE = colors.HexColor('#3A3A3A')
AMBER = colors.HexColor('#5A5A5A')
GREEN = colors.HexColor('#454545')
PURPLE = colors.HexColor('#333333')
HEAD_BG = colors.HexColor('#E3E3E3')

SEV = {
    'X': (colors.HexColor('#000000'), 'منع مصرف'),
    'D': (colors.HexColor('#454545'), 'عمده'),
    'C': (colors.HexColor('#7A7A7A'), 'متوسط'),
    'B': (colors.HexColor('#A5A5A5'), 'خفیف'),
}


def sev_chip(c, cx, cy, code, r=7.2):
    """نشانگر شدت تداخل — خوانا در چاپ سیاه‌وسفید."""
    col = SEV.get(code, (GRAY, ''))[0]
    if code in ('C', 'B'):
        c.setFillColor(WHITE)
        c.setStrokeColor(INK if code == 'C' else GRAY)
        c.setLineWidth(1.0)
        c.circle(cx, cy, r, stroke=1, fill=1)
        set_font(c, 8.4, INK if code == 'C' else GRAY, True)
    else:
        c.setFillColor(col)
        c.circle(cx, cy, r, stroke=0, fill=1)
        set_font(c, 8.4, WHITE, True)
    c.drawCentredString(cx, cy - 3.1, code)


def fa(s):
    """آماده‌سازی رشته فارسی برای ترسیم: اتصال حروف + بازآرایی راست‌به‌چپ."""
    if s is None:
        return ''
    return get_display(arabic_reshaper.reshape(str(s)))


def w(text, size=9, bold=False):
    """اندازه عرض رشته (پس از آماده‌سازی) به point."""
    t = fa(text)
    base = pdfmetrics.stringWidth(t, F, size)
    return base + (size * 0.035 if bold else 0.0)


def set_font(c, size=9, color=INK, bold=False):
    c.setFont(F, size)
    c.setFillColor(color)
    if bold:  # قلم پُررنگ مصنوعی: کانتور نازک هم‌رنگِ متن
        c.setStrokeColor(color)
        c.setLineWidth(max(0.2, size * 0.035))
    return bold


def _emit(c, t, x, y, size, bold):
    """ترسیم رشته؛ در حالت bold دو بار با offset اندک برای ایجاد ضخامت."""
    c.drawString(x, y, t)
    if bold:
        c.drawString(x + size * 0.018, y, t)


def wrap(text, size=9, maxw=100, bold=False):
    """شکستن متن به خطوط؛ ترتیب منطقی کلمات حفظ می‌شود."""
    lines = []
    for para in str(text).split('\n'):
        words = para.split(' ')
        cur = ''
        for word in words:
            trial = (cur + ' ' + word).strip()
            if not cur or w(trial, size, bold) <= maxw:
                cur = trial
            else:
                lines.append(cur)
                cur = word
        lines.append(cur)
    return lines


def draw_line(c, txt, x, y, size=9, color=INK, bold=False, maxw=None, align='right'):
    """ترسیم یک خط؛ x و maxw مشخص‌کننده محدوده (راست‌چین پیش‌فرض)."""
    set_font(c, size, color, bold)
    t = fa(txt)
    tw = pdfmetrics.stringWidth(t, F, size) + (size * 0.035 if bold else 0)
    if maxw is None:
        maxw = tw + 1
    if align == 'right':
        dx = x + maxw - tw
    elif align == 'center':
        dx = x + (maxw - tw) / 2.0
    else:
        dx = x
    _emit(c, t, dx, y, size, bold)
    return tw


def para(c, x, y, text, size=9, maxw=CW, lead=None, color=INK, bold=False, align='right'):
    """پاراگراف چندخطی؛ y بالای بلوک است و y پایین بلوک برگردانده می‌شود."""
    if lead is None:
        lead = size * 1.55
    yy = y
    for ln in wrap(text, size, maxw, bold):
        draw_line(c, ln, x, yy - size, size, color, bold, maxw, align)
        yy -= lead
    return yy


def para_h(c, text, size=9, maxw=CW, lead=None, bold=False):
    """ارتفاع مورد نیاز یک پاراگراف."""
    if lead is None:
        lead = size * 1.55
    return len(wrap(text, size, maxw, bold)) * lead


def bullets(c, x, y, items, size=8.8, maxw=CW, lead=None, color=INK,
            bullet='▪', bcolor=TEAL, gap=3.5, indent=11):
    """فهرست گلوله‌ای راست‌چین."""
    if lead is None:
        lead = size * 1.6
    yy = y
    for it in items:
        if isinstance(it, tuple):
            head, rest = it
        else:
            head, rest = None, it
        if head:
            head_w = w(head, size, True) + 6
        else:
            head_w = 0
        lines = wrap(rest, size, maxw - indent - head_w)
        for i, ln in enumerate(lines):
            if i == 0:
                set_font(c, size, bcolor, True)
                c.drawString(x + maxw - w(bullet, size, True), yy - size, fa(bullet))
                if head:
                    draw_line(c, head, x, yy - size, size, NAVY, True,
                              maxw - indent)
                draw_line(c, ln, x, yy - size, size, color, False,
                          maxw - indent - head_w)
            else:
                draw_line(c, ln, x, yy - size, size, color, False,
                          maxw - indent - head_w)
            yy -= lead
        yy -= gap
    return yy


def card(c, x, y, wd, title, lines, accent=TEAL, size=8.6, fill=WHITE,
         lead=None, pad=8, title_size=10, footer=None, fcolor=GRAY):
    """کادر عنوان‌دار با نوار رنگی بالا."""
    if lead is None:
        lead = size * 1.6
    inner = wd - 2 * pad
    ty = y - pad - title_size
    body = ty - 4
    for ln in lines:
        for wl in wrap(ln, size, inner):
            body -= lead
    h = (y - body) + pad + (12 if footer else 0)
    c.setFillColor(fill)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.roundRect(x, y - h, wd, h, 5, stroke=1, fill=1)
    c.setFillColor(accent)
    c.roundRect(x, y - 5, wd, 5, 2.5, stroke=0, fill=1)
    draw_line(c, title, x + pad, y - pad - title_size, title_size, accent, True,
              inner)
    yy = ty - 6
    for ln in lines:
        for wl in wrap(ln, size, inner):
            draw_line(c, wl, x + pad, yy - size, size, INK, False, inner)
            yy -= lead
    if footer:
        draw_line(c, footer, x + pad, y - h + 6, size - 0.8, fcolor, False, inner)
    return y - h


def callout(c, x, y, wd, title, text, kind='info', size=8.6, lead=None):
    """کادر هشدار/نکته با نوار عمودی رنگی در سمت راست."""
    pal = {'warn': (colors.HexColor('#000000'), colors.HexColor('#EDEDED'), 7),
           'info': (colors.HexColor('#5A5A5A'), colors.HexColor('#F6F6F6'), 4),
           'ok': (colors.HexColor('#3A3A3A'), colors.HexColor('#F4F4F4'), 4),
           'note': (colors.HexColor('#4A4A4A'), colors.HexColor('#F5F5F5'), 4)}[kind]
    accent, bg, bar_w = pal
    if lead is None:
        lead = size * 1.6
    pad = 8
    inner = wd - 2 * pad - 6
    lines = []
    for t in (text.split('\n') if isinstance(text, str) else list(text)):
        lines += wrap(t, size, inner)
    h = pad * 2 + (title_size := 10.2) + 4 + len(lines) * lead
    c.setFillColor(bg)
    c.roundRect(x, y - h, wd, h, 4, stroke=0, fill=1)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.7)
    c.roundRect(x, y - h, wd, h, 4, stroke=1, fill=0)
    c.setFillColor(accent)
    c.rect(x + wd - bar_w, y - h, bar_w, h, stroke=0, fill=1)
    draw_line(c, title, x + pad, y - pad - title_size, title_size, accent, True,
              inner)
    yy = y - pad - title_size - 6
    for ln in lines:
        draw_line(c, ln, x + pad, yy - size, size, INK, False, inner)
        yy -= lead
    return y - h


def table(c, x, y, colw, rows, header=None, fs=8.3, lead=10.9, pad=5,
          sev=None, header_bg=HEAD_BG, header_fg=INK, zebra=LIGHT, grid=LINE,
          min_h=17, center_cols=(), row_colors=None):
    """جدول راست‌چین؛ colw از راست به چپ. y پایین‌ترین نقطه را برمی‌گرداند."""
    total = sum(colw)
    ncol = len(colw)

    def cell_right(i):
        return x + total - sum(colw[:i])

    def row_lines(row):
        return [wrap(str(row[i]) if i < len(row) else '', fs, colw[i] - 2 * pad)
                for i in range(ncol)]

    yy = y
    if header:
        hl = row_lines(header)
        hh = max(len(l) for l in hl) * (lead + 1) + 2 * pad
        c.setFillColor(header_bg)
        c.rect(x, yy - hh, total, hh, stroke=0, fill=1)
        for i in range(ncol):
            lines = hl[i]
            ty = yy - pad - fs
            for ln in lines:
                if i in center_cols:
                    draw_line(c, ln, cell_right(i) - colw[i], ty, fs, header_fg, True,
                              colw[i], 'center')
                else:
                    draw_line(c, ln, cell_right(i) - colw[i], ty, fs, header_fg, True,
                              colw[i] - pad)
                ty -= (lead + 1)
        yy -= hh
    for ri, row in enumerate(rows):
        rl = row_lines(row)
        rh = max(min_h, max(len(l) for l in rl) * lead + 2 * pad)
        if zebra and ri % 2 == 0:
            c.setFillColor(zebra)
            c.rect(x, yy - rh, total, rh, stroke=0, fill=1)
        c.setStrokeColor(grid)
        c.setLineWidth(0.4)
        c.line(x, yy - rh, x + total, yy - rh)
        for i in range(ncol):
            ty = yy - pad - fs + 2
            for ln in rl[i]:
                if i in center_cols:
                    draw_line(c, ln, cell_right(i) - colw[i], ty, fs, INK, False,
                              colw[i], 'center')
                else:
                    draw_line(c, ln, cell_right(i) - colw[i], ty, fs, INK, False,
                              colw[i] - pad)
                ty -= lead
        if sev is not None:
            sev_chip(c, x + total - 9, yy - rh / 2.0, row[sev])
        yy -= rh
    c.setStrokeColor(grid)
    c.setLineWidth(0.6)
    c.line(x, y, x + total, y)
    return yy


def table_h(colw, rows, header=None, fs=8.3, lead=10.9, pad=5, min_h=17):
    """ارتفاع تقریبی جدول."""
    total_h = 0

    def lines_of(text, cw):
        return len(wrap(str(text), fs, cw - 2 * pad))

    if header:
        total_h += max(lines_of(h, cwi) for h, cwi in zip(header, colw)) * (lead + 1) + 2 * pad
    for row in rows:
        total_h += max(min_h, max(lines_of(row[i] if i < len(row) else '', colw[i])
                                  for i in range(len(colw))) * lead + 2 * pad)
    return total_h


def hbars(c, x, y, wd, data, title=None, color=colors.HexColor('#4A4A4A'), fs=8.6, bar_h=15, gap=8,
          maxv=None, unit='٪'):
    """نمودار میله‌ای افقی راست‌به‌چپ."""
    yy = y
    if title:
        draw_line(c, title, x, yy - 10.5, 10.2, NAVY, True, wd)
        yy -= 20
    vals = [d[1] for d in data]
    mx = maxv or max(vals) or 1
    label_w = 0
    for lab, v, *_ in data:
        label_w = max(label_w, w(lab, fs, True))
    val_w = 34
    bar_area = wd - label_w - val_w - 12
    for lab, v, *rest in data:
        col = color if len(rest) < 1 else rest[0]
        bl = max(3, bar_area * (v / mx))
        bx = x + label_w + 10
        c.setFillColor(colors.HexColor('#E8E8E8'))
        c.roundRect(bx, yy - bar_h, bar_area, bar_h, 3, stroke=0, fill=1)
        c.setFillColor(col)
        c.roundRect(bx + bar_area - bl, yy - bar_h, bl, bar_h, 3, stroke=0, fill=1)
        draw_line(c, lab, x, yy - bar_h + (bar_h - fs) / 2.0 + 1, fs, INK, True,
                  label_w + 8)
        draw_line(c, ('%.1f' % v).rstrip('0').rstrip('.') + unit, x + wd - val_w,
                  yy - bar_h + (bar_h - fs) / 2.0 + 1, fs, NAVY, True, val_w)
        yy -= (bar_h + gap)
    return yy


def stat_box(c, x, y, wd, value, label, sub='', accent=TEAL, h=62):
    c.setFillColor(WHITE)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.8)
    c.roundRect(x, y - h, wd, h, 5, stroke=1, fill=1)
    c.setFillColor(accent)
    c.roundRect(x, y - h, 6, h, 3, stroke=0, fill=1)
    draw_line(c, value, x + 10, y - 26, 20, accent, True, wd - 18)
    draw_line(c, label, x + 10, y - 42, 8.4, INK, False, wd - 18)
    if sub:
        draw_line(c, sub, x + 10, y - 54, 7.2, GRAY, False, wd - 18)
    return y - h


def chips(c, x, y, wd, items, fs=8.2, pad=6, gap=5, bg=colors.HexColor('#EFEFEF'), fg=INK):
    """ردیفی از برچسب‌های کپسولی."""
    cx = x + wd
    cy = y
    for it in items:
        tw = w(it, fs) + 2 * pad
        if cx - tw < x:
            cx = x + wd
            cy -= (fs * 1.6 + gap)
        c.setFillColor(bg)
        c.setStrokeColor(LINE)
        c.setLineWidth(0.6)
        c.roundRect(cx - tw, cy - fs * 1.45, tw, fs * 1.45, 4, stroke=1, fill=1)
        draw_line(c, it, cx - tw, cy - fs * 1.15, fs, fg, False, tw, 'center')
        cx -= (tw + gap)
    return cy - fs * 1.45


def header_band(c, kicker, title, page, total=8, color=NAVY, subtitle=None):
    h = 48 if subtitle is None else 56
    c.setFillColor(color)
    c.rect(0, H - h, W, h, stroke=0, fill=1)
    c.setFillColor(colors.HexColor('#FFFFFF'))
    c.setFillColor(colors.Color(1, 1, 1, alpha=0.12))
    c.rect(0, H - h, W, 3, stroke=0, fill=1)
    draw_line(c, title, M, H - (26 if subtitle is None else 28), 16.5, WHITE, True, CW)
    if subtitle:
        draw_line(c, subtitle, M, H - 45, 9, colors.Color(1, 1, 1, alpha=0.85), False, CW)
    # شماره بخش و صفحه در سمت چپ
    set_font(c, 9, colors.Color(1, 1, 1, alpha=0.9))
    c.drawString(M, H - 24, fa(kicker))
    pgtxt = '%d / %d' % (page, total)
    set_font(c, 9, colors.Color(1, 1, 1, alpha=0.9))
    c.drawString(M, H - 38, fa('صفحه ' + pgtxt))
    return H - h - 14


def footer(c, page, total=8, note=''):
    y = 22
    c.setStrokeColor(LINE)
    c.setLineWidth(0.7)
    c.line(M, y + 12, W - M, y + 12)
    draw_line(c, note, M, y, 7.6, GRAY, False, CW - 120)
    set_font(c, 7.6, GRAY)
    c.drawString(M, y, fa('صفحه %d از %d' % (page, total)))


def section_title(c, x, y, text, color=NAVY, size=11.5, wd=CW, sub=None):
    c.setFillColor(color)
    c.roundRect(x + wd - 4, y - size - 1, 4, size + 4, 2, stroke=0, fill=1)
    draw_line(c, text, x, y - size, size, color, True, wd - 10)
    yy = y - size - 4
    if sub:
        draw_line(c, sub, x, yy - 8.5, 8.3, GRAY, False, wd - 10)
        yy -= 13
    return yy - 5
