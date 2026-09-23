#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
اعمال فایل تغییر قیمت روزانهٔ پیام (بولتن) روی اکسل‌های «با کد پیام».

ورودی بولتن (فرمت همیشگی پیام، ۶ ستون):
  کد ژنریک | کد پیام | نام فارسی | قیمت واحد (ریال) | تاریخ (میلادیِ فایل) | تاریخ تغییر (شمسی)

قواعد اعمال:
1. کلید = «کد پیام». هر ردیف بولتن به همهٔ ردیف‌های اکسل که آن کد پیام را دارند اعمال می‌شود
   (قیمت متعلق به محصول/کد پیام است، نه هر GTIN جدا).
2. ردیف‌ها به ترتیب تاریخ تغییر (شمسی) اعمال می‌شوند؛ آخرین تغییر برنده است.
3. ستون‌های «بولتن» همیشه به‌روز می‌شوند؛ با --sync-price (پیش‌فرض: روشن) ستون قیمت سایت هم
   جایگزین می‌شود اگر تاریخ تغییر بولتن >= تاریخ ثبت‌شدهٔ ستون سایت باشد.
4. کدی که در اکسل دارو نیست → در اکسل مکمل جستجو می‌شود (--supp)؛ آنجا هم نبود → شیت
   «کدهای جدید» در گزارش (فرآوردهٔ تازه، یا مکملِ بدون IRC که باید دستی اضافه شود).
5. تغییرلاگ کامل (کد، نام، قیمت قبل، بعد، تاریخ شمسی تغییر، فایل مبدأ) در فایل جدا ذخیره می‌شود.
6. بازاجرایی امن (idempotent): اگر قیمت و تاریخ تغییری نکنند، ردیف لاگ تکراری ساخته نمی‌شود.

استفاده:
  python apply_price_bulletin.py --bulletin <فایل.xlsx یا پوشه> --v3 drug.xlsx \
      [--supp supplement.xlsx] --out drug_updated.xlsx --changelog changes.xlsx [--no-sync-price]
"""
import argparse
import csv
import os
import re
import sys
import openpyxl


def jkey(s):
    """('1405/1/16' | '2026/1/16') -> tuple قابل مقایسه؛ شمسی اولویت دارد."""
    m = re.match(r'^\s*(\d{4})/(\d{1,2})/(\d{1,2})', str(s or ''))
    if not m:
        return (0, 0, 0)
    y, mo, d = map(int, m.groups())
    return (y, mo, d)


def parse_bulletin(path):
    """-> list of dict rows از یک فایل بولتن."""
    out = []
    fd = os.path.basename(path).split('-')[1] if '-' in os.path.basename(path) else ''
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb[wb.sheetnames[0]]
    for r in ws.iter_rows(min_row=3, values_only=True):
        if r is None or len(r) < 6 or r[1] is None:
            continue
        code = str(r[1]).strip()
        if not code.isdigit():
            continue
        price = str(r[3]).replace(',', '').strip()
        out.append({
            'generic': str(r[0] or '').strip(),
            'code': code,
            'name': str(r[2] or '').strip(),
            'price': price,
            'file_greg': str(r[4] or '').strip(),
            'jal': str(r[5] or '').strip(),
            'jkey': jkey(r[5]),
            'srcfile': fd,
        })
    wb.close()
    return out


def find_col(headers, *needles):
    for i, h in enumerate(headers):
        hs = str(h or '')
        if all(n in hs for n in needles):
            return i
    return None


def load_target(path):
    """-> (wb, ws, headers, colmap) برای اکسل هدف (دارو یا مکمل)."""
    wb = openpyxl.load_workbook(path)
    ws = wb[wb.sheetnames[0]]
    headers = [c.value for c in ws[1]]
    colmap = {
        'code': find_col(headers, 'کد پیام') if find_col(headers, 'کد پیام', 'تطبیق') is None
                else find_col(headers, 'کد پیام'),
        'price_site': find_col(headers, 'قیمت واحد فعلی'),
        'date_site': find_col(headers, 'تاریخ به‌روزرسانی قیمت'),
        'price_bul': find_col(headers, 'آخرین تغییر در بولتن') if find_col(headers, 'قیمت واحد (ریال) - آخرین') is None
                     else find_col(headers, 'قیمت واحد (ریال) - آخرین'),
        'date_bul': find_col(headers, 'تاریخ آخرین تغییر در بولتن'),
    }
    # برای فایل مکمل v2 نام ستون‌ها کمی متفاوت است
    if colmap['code'] is None:
        colmap['code'] = find_col(headers, 'کد پیام')
    if colmap['price_bul'] is None:
        colmap['price_bul'] = find_col(headers, 'قیمت کتابخانه')
    if colmap['date_bul'] is None:
        colmap['date_bul'] = find_col(headers, 'تاریخ فایل کتابخانه')
    if colmap['code'] is None:
        raise RuntimeError('ستون «کد پیام» در %s پیدا نشد' % path)
    return wb, ws, headers, colmap


def index_rows(ws, code_col):
    """-> dict code -> [row_numbers]"""
    idx = {}
    for row in ws.iter_rows(min_row=2):
        v = row[code_col].value
        if v is None:
            continue
        c = str(v).strip()
        if not c.isdigit():
            continue
        idx.setdefault(c, []).append(row[code_col].row)
    return idx


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--bulletin', required=True, help='فایل xlsx یا پوشهٔ بولتن‌ها')
    ap.add_argument('--v3', required=True, help='اکسل دارو (با کد پیام)')
    ap.add_argument('--supp', help='اکسل مکمل (با کد پیام) - اختیاری')
    ap.add_argument('--out', required=True, help='خروجی اکسل داروی به‌روزشده')
    ap.add_argument('--out-supp', help='خروجی اکسل مکمل به‌روزشده (اگر --supp داده شود)')
    ap.add_argument('--changelog', required=True, help='فایل گزارش تغییرات + کدهای جدید')
    ap.add_argument('--no-sync-price', action='store_true',
                    help='ستون قیمت سایت دست نخورد (فقط ستون‌های بولتن به‌روز شوند)')
    args = ap.parse_args()
    sync_price = not args.no_sync_price

    # ---- جمع‌آوری ردیف‌های بولتن
    if os.path.isdir(args.bulletin):
        files = sorted(os.path.join(args.bulletin, f) for f in os.listdir(args.bulletin) if f.lower().endswith('.xlsx'))
    else:
        files = [args.bulletin]
    brows = []
    for f in files:
        brows.extend(parse_bulletin(f))
    brows.sort(key=lambda r: r['jkey'])
    print('بولتن‌ها: %d فایل، %d ردیف' % (len(files), len(brows)))

    # ---- بارگذاری اهداف
    wb_d, ws_d, hdr_d, cm_d = load_target(args.v3)
    idx_d = index_rows(ws_d, cm_d['code'])
    wb_s = ws_s = cm_s = idx_s = None
    if args.supp:
        wb_s, ws_s, hdr_s, cm_s = load_target(args.supp)
        idx_s = index_rows(ws_s, cm_s['code'])
    print('اکسل دارو: %d کد یکتا | اکسل مکمل: %s' % (len(idx_d), (str(len(idx_s)) + ' کد یکتا') if idx_s else 'ندارد'))

    changes = []
    new_codes = {}
    applied = 0

    def set_cell(ws, r, c, v):
        if c is not None:
            ws.cell(row=r, column=c + 1, value=v)

    for b in brows:
        code, price = b['code'], b['price']
        target = None
        if code in idx_d:
            target = ('دارو', ws_d, cm_d, idx_d[code])
        elif idx_s is not None and code in idx_s:
            target = ('مکمل', ws_s, cm_s, idx_s[code])
        if target is None:
            if code not in new_codes:
                new_codes[code] = dict(b)
            else:
                new_codes[code].update({'price': price, 'jal': b['jal'], 'file_greg': b['file_greg'], 'srcfile': b['srcfile']})
            continue
        tgt_name, ws, cm, rnums = target
        for rn in rnums:
            old_p = ws.cell(row=rn, column=cm['price_bul'] + 1).value if cm['price_bul'] is not None else None
            old_j = ws.cell(row=rn, column=cm['date_bul'] + 1).value if cm['date_bul'] is not None else None
            changed = (str(old_p or '') != price) or (jkey(old_j) < b['jkey'])
            set_cell(ws, rn, cm['price_bul'], price)
            set_cell(ws, rn, cm['date_bul'], b['jal'])
            if sync_price and cm['price_site'] is not None:
                cur_j = jkey(ws.cell(row=rn, column=cm['date_site'] + 1).value if cm['date_site'] is not None else None)
                if b['jkey'] >= cur_j:
                    set_cell(ws, rn, cm['price_site'], price)
                    set_cell(ws, rn, cm['date_site'], b['jal'])
            if changed and rn == rnums[0]:
                changes.append((b['srcfile'], b['jal'], code, tgt_name, b['name'],
                                str(old_p or ''), price, old_j or ''))
        applied += 1

    # ---- ذخیره
    wb_d.save(args.out)
    print('اکسل دارو ذخیره شد:', args.out)
    if wb_s is not None:
        wb_s.save(args.out_supp or args.supp)
        print('اکسل مکمل ذخیره شد:', args.out_supp or args.supp)

    wbc = openpyxl.Workbook()
    wsc = wbc.active
    wsc.title = 'تغییرات اعمال شده'
    wsc.append(['فایل بولتن', 'تاریخ تغییر (شمسی)', 'کد پیام', 'هدف', 'نام فارسی', 'قیمت قبل', 'قیمت بعد', 'تاریخ قبل'])
    for row in changes:
        wsc.append(list(row))
    wsn = wbc.create_sheet('کدهای جدید (در اکسل نبود)')
    wsn.append(['کد پیام', 'کد ژنریک', 'نام فارسی بولتن', 'آخرین قیمت', 'تاریخ تغییر', 'فایل بولتن'])
    for c, b in sorted(new_codes.items()):
        wsn.append([c, b['generic'], b['name'], b['price'], b['jal'], b['srcfile']])
    wbc.save(args.changelog)
    print('گزارش ذخیره شد: %d تغییر، %d کد جدید -> %s' % (len(changes), len(new_codes), args.changelog))


if __name__ == '__main__':
    main()
