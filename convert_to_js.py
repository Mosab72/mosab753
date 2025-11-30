#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
أداة تحويل بيانات العقود من تنسيق Tab-Separated إلى JavaScript
"""

import json
import sys

def parse_date(date_str):
    """تحويل التاريخ من MM/DD/YY إلى YYYY-MM-DD"""
    if not date_str or not date_str.strip():
        return ''
    try:
        parts = date_str.strip().split('/')
        if len(parts) == 3:
            month, day, year = parts
            # تحويل السنة من رقمين إلى أربعة أرقام
            if len(year) == 2:
                year = '20' + year
            return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    except:
        return ''
    return ''

def process_contract_line(line):
    """معالجة سطر واحد من بيانات العقد"""
    columns = line.split('\t')
    
    if len(columns) < 14:
        return None
    
    contract = {
        "docReceived": columns[0].strip(),
        "docDate": parse_date(columns[1]),
        "progress": columns[2].strip(),
        "updatedDocReceived": columns[3].strip(),
        "updatedDocDate": parse_date(columns[4]),
        "visitScheduled": columns[5].strip(),
        "visitDate": parse_date(columns[6]),
        "management": columns[7].strip(),
        "program": columns[8].strip(),
        "university": columns[9].strip(),
        "degree": columns[10].strip(),
        "status": columns[11].strip(),
        "startDate": parse_date(columns[12]),
        "endDate": parse_date(columns[13])
    }
    
    return contract

def main():
    print("=" * 80)
    print("أداة تحويل بيانات العقود")
    print("=" * 80)
    print()
    
    # قراءة الملف المدخل
    input_file = 'raw_contracts.txt'
    output_file = 'contracts_data_full.js'
    
    print(f"📖 قراءة البيانات من: {input_file}")
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"❌ خطأ: لم يتم العثور على الملف {input_file}")
        print()
        print("يرجى لصق بيانات العقود في الملف raw_contracts.txt")
        print("التنسيق: أعمدة مفصولة بـ Tab (من Excel)")
        return
    
    print(f"✅ تم قراءة {len(lines)} سطر")
    print()
    
    # معالجة البيانات
    print("🔄 معالجة البيانات...")
    contracts = []
    errors = 0
    
    for i, line in enumerate(lines, 1):
        line = line.strip()
        if not line:
            continue
            
        contract = process_contract_line(line)
        if contract:
            contracts.append(contract)
        else:
            errors += 1
            print(f"⚠️  تحذير: السطر {i} غير صالح")
    
    print(f"✅ تم معالجة {len(contracts)} عقد بنجاح")
    if errors > 0:
        print(f"⚠️  عدد الأسطر الخاطئة: {errors}")
    print()
    
    # إنشاء ملف JavaScript
    print(f"💾 كتابة الناتج إلى: {output_file}")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('// بيانات جميع العقود - تم إنشاؤها تلقائياً\n')
        f.write('// Generated automatically - All Contracts Data\n\n')
        f.write('const contractsData = ')
        json.dump(contracts, f, ensure_ascii=False, indent=2)
        f.write(';\n\n')
        f.write('console.log(`تم تحميل ${contractsData.length} عقد من النظام`);\n')
    
    print(f"✅ تم إنشاء الملف بنجاح!")
    print()
    
    # إحصائيات
    print("=" * 80)
    print("📊 إحصائيات البيانات")
    print("=" * 80)
    print()
    
    # عدد العقود
    print(f"إجمالي العقود: {len(contracts)}")
    print()
    
    # توزيع الجامعات
    universities = {}
    for c in contracts:
        uni = c['university']
        universities[uni] = universities.get(uni, 0) + 1
    
    print(f"عدد الجامعات: {len(universities)}")
    print("\nأعلى 10 جامعات:")
    sorted_unis = sorted(universities.items(), key=lambda x: x[1], reverse=True)[:10]
    for i, (uni, count) in enumerate(sorted_unis, 1):
        print(f"  {i}. {uni}: {count} عقد")
    print()
    
    # توزيع الإدارات
    departments = {}
    for c in contracts:
        dept = c['management']
        departments[dept] = departments.get(dept, 0) + 1
    
    print(f"عدد الإدارات: {len(departments)}")
    print("\nتوزيع الإدارات:")
    for dept, count in sorted(departments.items(), key=lambda x: x[1], reverse=True):
        print(f"  • {dept}: {count} عقد")
    print()
    
    # توزيع الدرجات
    degrees = {}
    for c in contracts:
        deg = c['degree']
        degrees[deg] = degrees.get(deg, 0) + 1
    
    print("توزيع الدرجات العلمية:")
    for deg, count in sorted(degrees.items(), key=lambda x: x[1], reverse=True):
        print(f"  • {deg}: {count} عقد")
    print()
    
    # التوزيع الزمني
    from datetime import datetime
    
    ended = 0
    h1_2025 = 0
    h2_2025 = 0
    year_2026 = 0
    
    end_2024 = datetime(2024, 12, 31)
    end_h1_2025 = datetime(2025, 6, 30)
    end_2025 = datetime(2025, 12, 31)
    
    for c in contracts:
        if c['endDate']:
            try:
                end_date = datetime.strptime(c['endDate'], '%Y-%m-%d')
                if end_date <= end_2024:
                    ended += 1
                elif end_date <= end_h1_2025:
                    h1_2025 += 1
                elif end_date <= end_2025:
                    h2_2025 += 1
                else:
                    year_2026 += 1
            except:
                pass
    
    print("التوزيع الزمني:")
    print(f"  • منتهية أو قريبة (قبل 2025): {ended} عقد")
    print(f"  • النصف الأول 2025: {h1_2025} عقد")
    print(f"  • النصف الثاني 2025: {h2_2025} عقد")
    print(f"  • 2026 وما بعد: {year_2026} عقد")
    print()
    
    print("=" * 80)
    print("✅ انتهت العملية بنجاح!")
    print()
    print("الخطوات التالية:")
    print("1. افتح ملف index.html في المتصفح")
    print("2. تأكد من أن جميع الملفات في نفس المجلد")
    print("3. استمتع بالنظام! 🎉")
    print("=" * 80)

if __name__ == '__main__':
    main()
