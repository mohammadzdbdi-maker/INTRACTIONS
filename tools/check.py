import pymupdf
d = pymupdf.open('بروشور-تداخلات-دارویی.pdf')
W, H = d[0].rect.width, d[0].rect.height
M = 24
bad = 0
for i, p in enumerate(d):
    low, over = [], []
    for b in p.get_text('dict')['blocks']:
        for l in b.get('lines', []):
            for s in l['spans']:
                x0, y0, x1, y1 = s['bbox']
                if not s['text'].strip():
                    continue
                if y0 > 548 and not s['text'].startswith('۱۴۰۵'):
                    low.append((round(y0), round(y1), s['text'][:55]))
                if x1 > W - M + 2 or x0 < M - 2:
                    over.append((round(x0), round(x1), round(y0), s['text'][:55]))
    flag = 'OK ' if not low and not over else 'FIX'
    if flag == 'FIX':
        bad += 1
    print(flag, '| صفحه', i + 1, '| تداخل با پانویس:', len(low), '| خارج از حاشیه:', len(over))
    for t in low[:4]:
        print('      ↓', t)
    for t in over[:4]:
        print('      ↔', t)
print('تعداد صفحات نیازمند اصلاح:', bad)
