"""بررسی برخوردِ واقعی متن‌ها با ثبت فراخوانی‌های drawString در سطح ReportLab."""
import runpy
from reportlab.pdfgen.canvas import Canvas

recs, pages, cur = [], [], 0
_orig_draw = Canvas.drawString
_orig_centre = Canvas.drawCentredString
_orig_show = Canvas.showPage


def _draw(self, x, y, t, *a, **k):
    try:
        size = self._fontsize
        wd = self.stringWidth(t, self._fontname, size)
    except Exception:
        size, wd = 9, len(t) * 5
    recs.append([cur, x, y, wd, size, t])
    return _orig_draw(self, x, y, t, *a, **k)


def _centre(self, x, y, t, *a, **k):
    try:
        size = self._fontsize
        wd = self.stringWidth(t, self._fontname, size)
    except Exception:
        size, wd = 9, len(t) * 5
    recs.append([cur, x - wd / 2.0, y, wd, size, t])
    return _orig_centre(self, x, y, t, *a, **k)


def _show(self, *a, **k):
    global cur
    cur += 1
    return _show.__wrapped__(self, *a, **k)


Canvas.drawString = _draw
Canvas.drawCentredString = _centre
_orig_show_wrapped = Canvas.showPage


def _show2(self, *a, **k):
    global cur
    cur += 1
    return _orig_show_wrapped(self, *a, **k)


Canvas.showPage = _show2
runpy.run_path('tools/make_brochure.py')

# تحلیل برخوردها
from collections import defaultdict
byp = defaultdict(list)
for pg, x, y, wd, size, t in recs:
    if not str(t).strip():
        continue
    byp[pg].append((x, y - 0.15 * size, x + wd + 0.15 * size, y + 0.82 * size, str(t), size))

total = 0
for pg in sorted(byp):
    items = byp[pg]
    bad = []
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            a, b = items[i], items[j]
            # چاپ دوبارهٔ همان متن برای ایجاد حالت پُررنگ
            if a[4] == b[4] and abs(a[0] - b[0]) < 1.5 and abs(a[1] - b[1]) < 1.0:
                continue
            ix = max(0, min(a[2], b[2]) - max(a[0], b[0]))
            iy = max(0, min(a[3], b[3]) - max(a[1], b[1]))
            if ix > 1.5 and iy > 1.5:
                area_small = min((a[2] - a[0]) * (a[3] - a[1]), (b[2] - b[0]) * (b[3] - b[1]))
                if ix * iy > 0.35 * area_small:
                    bad.append((a[4][:38], b[4][:38], round(ix, 1), round(iy, 1)))
    total += len(bad)
    print('صفحه', pg + 1, '| تعداد متن:', len(items), '| برخورد:', len(bad))
    for t in bad[:5]:
        print('     ✗', t)
print('مجموع برخوردهای مشکوک:', total)
