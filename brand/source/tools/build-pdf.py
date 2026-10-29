# جمع صفحات دليل إرث في ملف PDF واحد بالترتيب المعتمد
# الاستعمال: python build-pdf.py <order.json> <مجلد ملفات الصفحات> <الملف الناتج> [أول صفحة] [آخر صفحة]
import sys, os, json
from pypdf import PdfReader, PdfWriter

order_file, pdf_dir, out = sys.argv[1:4]
order = json.load(open(order_file, encoding='utf-8'))['pages']
first = sys.argv[4] if len(sys.argv) > 4 else None
last = sys.argv[5] if len(sys.argv) > 5 else None
if first: order = order[order.index(first):]
if last: order = order[:order.index(last) + 1]

w = PdfWriter()
used = []
for name in order:
    f = os.path.join(pdf_dir, name + '.pdf')
    if os.path.exists(f):
        w.add_page(PdfReader(f).pages[0]); used.append(name)
author = 'م/ أحمد درهم حسين الفقيه'
w.add_metadata({'/Title': 'دليل هوية إرث IRTH', '/Author': author, '/Creator': author,
                '/Producer': author, '/Subject': 'إعداد وتصميم: م/ أحمد درهم حسين الفقيه — الشريك المؤسس ومدير المشروع'})
with open(out, 'wb') as fh: w.write(fh)
print(len(used), 'pages ->', out)
