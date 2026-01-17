# ✅ CELESTIA AI - QURAŞDIRMA CHECKLIST

## 📋 Klinika üçün addım-addım təlimat

---

## MƏRHƏLƏ 1: MÜQAVİLƏ VƏ ÖDƏNİŞ (1 gün)

### 1.1 Müqavilə İmzalanması
- [ ] Müqavilə sənədini göndər (email/WhatsApp)
- [ ] Müştəri tərəfindən oxunub təsdiqlənməsi
- [ ] Print və imza (və ya elektron imza)
- [ ] Skanı qəbul et və arxivlə

### 1.2 Ödəniş Qəbulu
- [ ] Quraşdırma ödənişi: ₼_____ (müqaviləyə uyğun)
- [ ] Ödəniş qəbul edildi: **Tarix: ____**
- [ ] Məbləğ təsdiqləndi: ✅
- [ ] İnvoys göndərildi

### 1.3 Məlumat Toplanması
Müştəridən tələb olunan məlumatlar:

- [ ] **Klinika adı:** _________________________
- [ ] **Domenləri (əgər varsa):** _________________________
- [ ] **Logo (PNG/SVG format):** Qəbul edildi ✅
- [ ] **Əsas rəng (Hex code):** #_________
- [ ] **Telefon nömrəsi:** +994 ___ ___ __ __
- [ ] **Email:** _________________________
- [ ] **İş saatları:** 
  - Bazar ertəsi - Cümə: ___:___ - ___:___
  - Şənbə: ___:___ - ___:___
  - Bazar: Bağlı / Açıq
- [ ] **Randevu uzunluğu:** ___ dəqiqə (default: 30)
- [ ] **Operatorların adları və emailləri:**
  1. ___________________________
  2. ___________________________
  3. ___________________________

---

## MƏRHƏLƏ 2: TEXNİKİ QURAŞDIRMA (2-3 gün)

### 2.1 Firebase Layihəsi Yaratmaq
- [ ] Firebase Console-da yeni layihə yarat
- [ ] Layihə adı: `celestia-[klinika-adi]`
- [ ] Authentication aktivləşdir (Email/Password)
- [ ] Firestore Database yarat
- [ ] Firestore qaydaları konfiqurasiya et
- [ ] Firebase Hosting aktivləşdir

### 2.2 Branding Konfiqurasiyası
- [ ] Logo upload et (`public/logo.png`)
- [ ] Əsas rəngi `constants.ts`-də dəyişdir
- [ ] Klinika adını `index.html`-də yenilə
- [ ] Favicon yaradıb əlavə et

### 2.3 Sistem Parametrləri
`constants.ts` faylında dəyişikliklər:

```typescript
export const CLINIC_CONFIG = {
  name: "___________________",
  primaryColor: "#_________",
  phone: "+994__________",
  email: "___________________",
  workingHours: {
    weekday: { start: "09:00", end: "18:00" },
    saturday: { start: "09:00", end: "14:00" },
    sunday: "closed"
  },
  appointmentDuration: 30
};
```

- [ ] Konfiqurasiya tamamlandı ✅

### 2.4 API Açarları
- [ ] Yeni Gmail hesabı yarat (əgər lazımsa)
- [ ] Google AI Studio-da API açarı yarat
- [ ] `.env` faylında açarları doldur:
  ```
  VITE_GEMINI_API_KEY=___________________
  VITE_FIREBASE_API_KEY=___________________
  VITE_FIREBASE_PROJECT_ID=___________________
  ```
- [ ] API açarları test et ✅

### 2.5 Build və Deploy
- [ ] `npm run build` - Build uğurlu ✅
- [ ] `firebase deploy` - Deploy uğurlu ✅
- [ ] Production URL: https://________________.web.app
- [ ] SSL sertifikatı aktiv ✅

---

## MƏRHƏLƏ 3: OPERATOR HESABLARI (1 gün)

### 3.1 Operator Yaratmaq
Hər operator üçün:

**Operator 1:**
- [ ] Email: _________________________
- [ ] Parol yaradılıb və göndərilib
- [ ] Firebase Authentication-da əlavə edilib
- [ ] Dashboard girişi test edilib ✅

**Operator 2:**
- [ ] Email: _________________________
- [ ] Parol yaradılıb və göndərilib
- [ ] Firebase Authentication-da əlavə edilib
- [ ] Dashboard girişi test edilib ✅

**Operator 3:**
- [ ] Email: _________________________
- [ ] Parol yaradılıb və göndərilib
- [ ] Firebase Authentication-da əlavə edilib
- [ ] Dashboard girişi test edilib ✅

### 3.2 İcazələr
- [ ] Operator rolları təyin edilib
- [ ] Mesajlara giriş konfiqurasiya edilib
- [ ] Randevu idarəetməsi aktiv

---

## MƏRHƏLƏ 4: VEBSAYTA İNTEQRASİYA (1 gün)

### 4.1 Widget Kodu Hazırlamaq
```html
<script src="https://[KLİNİKA].web.app/widget.js"></script>
<script>
  CelestiaWidget.init({
    clinicId: "[KLİNİKA_ID]",
    primaryColor: "#10b981",
    position: "bottom-right"
  });
</script>
```

- [ ] Widget kodu müştəriyə göndərildi ✅
- [ ] Müştəri vebsaytına əlavə etdi
- [ ] Widget görünür və işləyir ✅

### 4.2 Test
- [ ] Yazılı rejim test edildi ✅
- [ ] Səsli rejim test edildi ✅ (Professional/Premium)
- [ ] Randevu sistemi test edildi ✅
- [ ] Firebase-də mesajlar görünür ✅
- [ ] Dashboard-da randevular görünür ✅

---

## MƏRHƏLƏ 5: TƏLİM VƏ TƏHVİLVERMƏ (1 gün)

### 5.1 Texniki Təlim (1-2 saat)
Online görüş (Zoom/Google Meet):

- [ ] **Dashboard istifadəsi** (30 dəq)
  - Giriş
  - Randevuları baxmaq
  - Statusları dəyişmək
  - Mesaj tarixçəsinə baxmaq

- [ ] **AI Cavablarının idarəsi** (20 dəq)
  - System prompt-un dəyişdirilməsi
  - Custom responses
  - Təhlükəsizlik

- [ ] **Problemlərin həlli** (20 dəq)
  - API kvotası bitərsə nə etmək
  - Widget görünmürsə
  - Səs işləmirsə

- [ ] **Suallar və cavablar** (20 dəq)

### 5.2 Təlim Materialları
- [ ] Video təlim linki göndərildi
- [ ] PDF istifadəçi təlimatı göndərildi
- [ ] FAQ sənədi göndərildi

### 5.3 Support Məlumatları
- [ ] Support kanalları izah edildi:
  - 📧 Email: support@celestia-ai.az
  - 📱 WhatsApp: +994 XX XXX XX XX
  - 💬 Telegram: @celestia_support
- [ ] Cavab vaxtları izah edildi:
  - Basic: 2 iş günü
  - Professional: 24 saat
  - Premium: 1 saat

---

## MƏRHƏLƏ 6: GO-LIVE VƏ MONİTORİNQ (davamlı)

### 6.1 Sistem Aktivləşdirmə
- [ ] **Go-Live tarixi:** ___/___/2026
- [ ] Bütün funksiyalar aktiv ✅
- [ ] Monitoring qurulub
- [ ] Alert sistemləri konfiqurasiya edilib

### 6.2 İlk Həftə İzləmə
Hər gün yoxlanış:

**Gün 1:**
- [ ] Sistem işləyir ✅
- [ ] Zənglər qəbul olunur
- [ ] Problemlər: _______________

**Gün 2-7:**
- [ ] Gündəlik statistika:
  - Zənglər: ___
  - Randevular: ___
  - Problemlər: _______________

### 6.3 İlk Ay Hesabatı
- [ ] Performans hesabatı hazırla
- [ ] Müştəriyə təqdim et
- [ ] Təkmilləşdirmə təklifləri:
  1. ___________________________
  2. ___________________________
  3. ___________________________

---

## MƏRHƏLƏ 7: DAVAMEDƏN SUPPORT

### Aylıq Vəzifələr
- [ ] API kvotalarını yoxla
- [ ] Firebase istifadəsini monitor et
- [ ] Sistem yeniləmələrini et
- [ ] Backup götür
- [ ] Performans hesabatı göndər (Premium)

### Təkmilləşdirmələr
- [ ] Müştəri feedback-ini topla
- [ ] Yeni funksiyalar təklif et
- [ ] Custom feature development (Premium)

---

## 📊 QURAŞDIRMA STATİSTİKASI

| Mərhələ | Təxmini Vaxt | Status |
|---------|--------------|--------|
| 1. Müqavilə | 1 gün | ⏳ |
| 2. Texniki Quraşdırma | 2-3 gün | ⏳ |
| 3. Operator Hesabları | 1 gün | ⏳ |
| 4. Vebsayta İnteqrasiya | 1 gün | ⏳ |
| 5. Təlim | 1 gün | ⏳ |
| 6. Go-Live | - | ⏳ |

**CƏMI:** 5-7 iş günü

---

## 🎯 UĞUR KRİTERİYALARI

Layihə uğurlu sayılır əgər:

- ✅ Sistem 99%+ uptime göstərir
- ✅ Gündə ən azı 3-5 avtomatik randevu alınır
- ✅ Müştəri məmnun qalır (NPS > 8)
- ✅ İlk ay ərzində 0 kritik baq
- ✅ Operatorlar sistemi rahat istifadə edir

---

**Layihə Meneceri:** _________________  
**Texniki Məsul:** _________________  
**Başlanğıc tarixi:** ___/___/2026  
**Tamamlanma tarixi:** ___/___/2026  

✅ **Layihə tamamlandı və təhvil verildi**

---

*Bu checklist hər klinika quraşdırması üçün doldurulmalı və arxivləşdirilməlidir*
