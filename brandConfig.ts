
export const BRAND_CONFIG = {
    name: "Swarnim",
    slogan: "Özünəinamlı Gülüşə Aparan Yolunuz Burada Başlayır.",
    description: "Rahatlığınız üçün nəzərdə tutulmuş dünya səviyyəli stomatoloji xidməti təcrübə edin. Ən yaxşı gülüşünüzü üzə çıxarmaq üçün müasir texnologiyanı zərif toxunuşla birləşdiririk.",

    // Design System
    colors: {
        primary: "emerald", // Tailwind color base
        primaryFull: "bg-emerald-500",
        primaryHover: "hover:bg-emerald-600",
        primaryText: "text-emerald-600",
        primaryLight: "bg-emerald-50",
        secondary: "teal",
    },

    contact: {
        address: "186 Dental Way, Los Angeles, CA 90024",
        phone: "(310) 555-0187",
        email: "info@swarnim.com",
        social: {
            facebook: "#",
            instagram: "#",
            twitter: "#",
        }
    },

    workingHours: [
        { days: "B.e - Ç.a", hours: "09:00 - 17:00" },
        { days: "Çər - C.a", hours: "09:00 - 17:00" },
        { days: "Cümə", hours: "09:00 - 15:00" },
    ],

    services: [
        {
            id: "01",
            title: "Ümumi Stomatologiya",
            description: "Sağlam gülüş üçün təmizləmə, plomblama və profilaktik qulluq təklif edirik.",
            image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800",
            icon: "Plus"
        },
        {
            id: "02",
            title: "Kosmetik Stomatologiya",
            description: "Peşəkar ağartma və vinirlərlə xəyalınızdakı gülüşə sahib olun.",
            image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800",
            icon: "Sparkles"
        },
        {
            id: "03",
            title: "Cərrahiyyə",
            description: "Komandamız bütün mürəkkəb cərrahi ehtiyaclar üçün zərif qulluq göstərir.",
            image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg",
            icon: "Target"
        },
        {
            id: "04",
            title: "Uşaq Stomatologiyası",
            description: "Uşaqların sağlam gülüşü üçün əyləncəli və zərif qulluq təmin edirik.",
            image: "https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?auto=format&fit=crop&q=80&w=800",
            icon: "Smile"
        },
        {
            id: "05",
            title: "Ortodontiya",
            description: "Müasir ortodontik həllərimizlə mükəmməl düzülmüş dişlərə sahib olun.",
            image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=800",
            icon: "Smile"
        },
        {
            id: "06",
            title: "Sedasiya",
            description: "Təhlükəsiz sedasiya seçimlərimizlə stressiz bir müayinə təcrübəsi yaşayın.",
            image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
            icon: "Clock"
        }
    ],

    doctors: [
        {
            name: "Dr. Alex Chen",
            role: "Ümumi Stomatoloq",
            image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600",
            isHead: false
        },
        {
            name: "Dr. James Carter",
            role: "Cərrah",
            image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600",
            isHead: false
        },
        {
            name: "Dr. Sofia Rodriguez",
            role: "Kosmetik Stomatoloq",
            image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600",
            isHead: true,
            label: "Baş Həkim"
        },
        {
            name: "Dr. Maria Lopez",
            role: "Ortodont",
            image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=600",
            isHead: false
        },
        {
            name: "Dr. Olivia Carter",
            role: "Uşaq Həkimi",
            image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=600",
            isHead: false
        }
    ],

    faqs: [
        {
            question: "Sığorta qəbul edirsinizmi?",
            answer: "Bəli, əksər əsas stomatoloji sığorta planlarını qəbul edirik. Zəhmət olmasa sığorta məlumatlarınızla ofisimizlə əlaqə saxlayın."
        },
        {
            question: "Nə qədər tez-tez müayinə olunmalıyam?",
            answer: "Optimal ağız sağlamlığını qorumaq üçün hər altı aydan bir müayinə və təmizləmə üçün diş həkiminə müraciət etməyi tövsiyə edirik."
        },
        {
            question: "Təcili randevu verirsinizmi?",
            answer: "Bəli, hər gün təcili hallar üçün vaxt ayırırıq. Ağrı və ya zədə halında dərhal bizimlə əlaqə saxlayın."
        },
        {
            question: "Kosmetik stomatologiya təklif edirsinizmi?",
            answer: "Əlbəttə. İstədiyiniz inamlı gülüşə sahib olmağınız üçün vinirlərlə, diş ağartma və tam gülüş dizaynı təklif edirik."
        },
        {
            question: "Onlayn randevu ala bilərəmmi?",
            answer: "Bəli! Aşağıdakı onlayn formadan istifadə edərək sizə uyğun vaxtda randevu təyin ed bilərsiniz."
        }
    ]
};
