import React, { useState } from 'react';
import {
    Smile, ArrowRight, Star, Plus, Menu, X, ArrowDownRight, HeartHandshake,
    Clock, MapPin, Phone, Instagram, Facebook, LogIn, Mail, Target, Award, Users2,
    Check, Sparkles, ChevronDown, MessageSquare
} from 'lucide-react';
import { BRAND_CONFIG } from '../brandConfig';
import LiveVoiceSession from './LiveVoiceSession';
import Auth from './Auth';

interface ClinicWebsiteTemplateProps {
    onOpenAuth: () => void;
    onOpenWidget: () => void;
}

const ClinicWebsiteTemplate: React.FC<ClinicWebsiteTemplateProps> = ({ onOpenAuth, onOpenWidget }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isVoiceWidgetOpen, setIsVoiceWidgetOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Helper for smooth scrolling
    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    // Local handlers to bridge the gap or use internal state if props aren't enough
    const handleAuthOpen = () => {
        setIsAuthModalOpen(true);
    };

    const handleWidgetOpen = () => {
        setIsVoiceWidgetOpen(true);
    };

    return (
        <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-100 selection:text-emerald-900">
            {/* 1. NAVIGATION */}
            <header className="fixed top-0 w-full z-50 px-4 py-6 transition-all duration-300">
                <nav className="mx-auto max-w-7xl rounded-full backdrop-blur-xl border shadow-lg px-6 py-3 flex items-center justify-between transition-all duration-300 bg-white/80 border-white/20 shadow-slate-200/50">
                    {/* Logo */}
                    <a href="#" className="flex items-center gap-2 group">
                        <div className={`${BRAND_CONFIG.colors.primaryFull} p-1.5 rounded-lg group-hover:bg-emerald-600 transition-colors text-white`}>
                            <Smile className="w-6 h-6 stroke-[1.5]" />
                        </div>
                        <span className="text-xl font-semibold tracking-tight text-slate-900">{BRAND_CONFIG.name}</span>
                    </a>

                    {/* Menu (Desktop) */}
                    <div className="hidden lg:flex items-center gap-6 xl:gap-8">
                        <a href="#" onClick={(e) => scrollToSection(e, 'home')} className="text-sm font-medium transition-colors text-slate-600 hover:text-emerald-600">Ana Səhifə</a>
                        <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="text-sm font-medium transition-colors text-slate-600 hover:text-emerald-600">Haqqımızda</a>
                        <a href="#team" onClick={(e) => scrollToSection(e, 'team')} className="text-sm font-medium transition-colors text-slate-600 hover:text-emerald-600">Həkimlər</a>
                        <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="text-sm font-medium transition-colors text-slate-600 hover:text-emerald-600">Xidmətlər</a>
                        <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="text-sm font-medium transition-colors text-slate-600 hover:text-emerald-600">Əlaqə</a>
                    </div>

                    {/* CTA & Auth */}
                    <div className="hidden lg:flex items-center gap-3">
                        <button onClick={onOpenAuth} className={`inline-flex items-center gap-2 border border-${BRAND_CONFIG.colors.primary}-500 ${BRAND_CONFIG.colors.primaryText} text-sm font-medium px-4 xl:px-5 py-2.5 rounded-full transition-all hover:bg-emerald-50 active:scale-95`}>
                            <LogIn className="w-4 h-4" /> Həkim Girişi
                        </button>
                        <button onClick={onOpenWidget} className={`inline-flex items-center gap-2 ${BRAND_CONFIG.colors.primaryFull} text-sm font-medium px-4 xl:px-5 py-2.5 rounded-full transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 ${BRAND_CONFIG.colors.primaryHover} text-white active:scale-95`}>
                            Randevu Al
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Mobile Menu Icon */}
                    <button className="lg:hidden text-slate-900 p-2 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </nav>

                {/* Mobile Overlay Menu */}
                <div className={`fixed inset-0 z-[60] bg-white transition-all duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
                    <div className="p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-12">
                            <a href="#" className="flex items-center gap-2 group">
                                <div className={`${BRAND_CONFIG.colors.primaryFull} p-1.5 rounded-lg text-white`}>
                                    <Smile className="w-6 h-6 stroke-[1.5]" />
                                </div>
                                <span className="text-xl font-semibold tracking-tight text-slate-900">{BRAND_CONFIG.name}</span>
                            </a>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400">
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-6 items-center flex-1 justify-center text-center">
                            <a href="#" onClick={(e) => { scrollToSection(e, 'home'); setIsMobileMenuOpen(false); }} className="text-2xl font-bold text-slate-900 border-b-2 border-transparent hover:border-emerald-500 transition-all">Ana Səhifə</a>
                            <a href="#about" onClick={(e) => { scrollToSection(e, 'about'); setIsMobileMenuOpen(false); }} className="text-2xl font-bold text-slate-900 border-b-2 border-transparent hover:border-emerald-500 transition-all">Haqqımızda</a>
                            <a href="#team" onClick={(e) => { scrollToSection(e, 'team'); setIsMobileMenuOpen(false); }} className="text-2xl font-bold text-slate-900 border-b-2 border-transparent hover:border-emerald-500 transition-all">Həkimlər</a>
                            <a href="#services" onClick={(e) => { scrollToSection(e, 'services'); setIsMobileMenuOpen(false); }} className="text-2xl font-bold text-slate-900 border-b-2 border-transparent hover:border-emerald-500 transition-all">Xidmətlər</a>
                            <a href="#contact" onClick={(e) => { scrollToSection(e, 'contact'); setIsMobileMenuOpen(false); }} className="text-2xl font-bold text-slate-900 border-b-2 border-transparent hover:border-emerald-500 transition-all">Əlaqə</a>
                        </div>

                        <div className="mt-auto space-y-4">
                            <button onClick={() => { onOpenAuth(); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-center gap-2 border-2 border-${BRAND_CONFIG.colors.primary}-500 ${BRAND_CONFIG.colors.primaryText} font-bold py-4 rounded-2xl transition-all active:scale-95`}>
                                <LogIn className="w-5 h-5" /> Həkim Girişi
                            </button>
                            <button onClick={() => { onOpenWidget(); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-center gap-2 ${BRAND_CONFIG.colors.primaryFull} text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95`}>
                                Randevu Al <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. HERO SECTION */}
            <section id="home" className="pt-32 lg:pt-48 pb-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-semibold tracking-tighter leading-[1.1] text-slate-900">
                                {BRAND_CONFIG.slogan.split('<br />').map((text, i) => (
                                    <React.Fragment key={i}>
                                        {text.includes('Aparan Yolunuz') ? (
                                            <span className={`text-transparent bg-clip-text bg-gradient-to-r from-${BRAND_CONFIG.colors.primary}-600 to-${BRAND_CONFIG.colors.secondary}-500`}>{text}</span>
                                        ) : text}
                                        {i === 0 && <br className="hidden sm:block" />}
                                    </React.Fragment>
                                ))}
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl text-slate-500 font-medium max-w-lg leading-relaxed">
                                {BRAND_CONFIG.description}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={onOpenWidget} className={`flex items-center justify-center gap-2 ${BRAND_CONFIG.colors.primaryFull} text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-emerald-500/30 ${BRAND_CONFIG.colors.primaryHover} transition-all active:scale-95`}>
                                    Randevu Al <ArrowRight className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-4 px-6 py-4 rounded-2xl border bg-white border-slate-100 shadow-sm">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Patient" />
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">500+ Xəstə</p>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                            <span className="text-[10px] font-bold text-slate-400">4.9/5 Reytinq</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Image */}
                        <div className="relative order-first lg:order-none">
                            <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl group shadow-emerald-900/10">
                                <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop" alt="Dental Treatment" className="w-full h-[350px] sm:h-[500px] lg:h-[600px] object-cover transition-transform duration-700 group-hover:scale-105" />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-transparent"></div>

                                {/* Floating Notification */}
                                <div className="absolute bottom-8 left-8 right-8 p-6 rounded-3xl backdrop-blur-xl border border-white/20 bg-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
                                            <HeartHandshake className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-1">Vədimiz</p>
                                            <p className="text-white font-medium text-lg">Sizin Rahatlığınız, Bizim Prioritetimiz.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. ABOUT/FEATURES */}
            <section id="about" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all group">
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-all text-emerald-600">
                                <Target className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-slate-900 tracking-tight">Dəqiq Diaqnostika</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">Ən düzgün diaqnoz və müalicə üçün müasir texnologiyadan istifadə edirik.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all group">
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-all text-emerald-600">
                                <Award className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-slate-900 tracking-tight">Ekspert Komanda</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">Sizin üçün ən yaxşı nəticəni təmin edən təcrübəli mütəxəssislərimiz.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all group lg:col-span-2 flex flex-col justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-xl shadow-emerald-500/20">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                    <Users2 className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-semibold tracking-tight">Xəstəyə Özəl Yanaşma</h3>
                            </div>
                            <p className="text-emerald-50 font-medium leading-relaxed text-lg mb-8">Hər bir xəstənin ehtiyaclarına uyğun fərdi müalicə planları hazırlayır və şəffaf kommunikasiya qururuq.</p>
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-3xl font-bold">15+</span>
                                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">İllik Təcrübə</span>
                                </div>
                                <div className="w-px h-10 bg-white/20"></div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-bold">10k+</span>
                                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">Uğurlu Müalicə</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. SERVICES SECTION */}
            <section id="services" className="py-24 lg:py-32 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-6 text-slate-900">
                            Hərtərəfli <span className={`${BRAND_CONFIG.colors.primaryText}`}>Xidmətlərimiz</span>
                        </h2>
                        <p className="text-lg text-slate-500 font-medium">
                            Hər bir ehtiyacınızı qarşılamaq üçün tam çeşidli müasir stomatoloji həllər təklif edirik.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {BRAND_CONFIG.services.map((service) => (
                            <div key={service.id} className="group p-2 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border relative overflow-hidden bg-white hover:shadow-emerald-900/5 border-slate-100">
                                <div className="relative h-56 rounded-2xl overflow-hidden bg-slate-100">
                                    <img src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm text-slate-900">{service.id}</div>
                                </div>
                                <div className="p-6 relative">
                                    <div className={`absolute -top-10 right-6 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:${BRAND_CONFIG.colors.primaryFull} group-hover:text-white transition-colors bg-white ${BRAND_CONFIG.colors.primaryText}`}>
                                        {service.icon === 'Plus' && <Plus className="w-6 h-6" />}
                                        {service.icon === 'Sparkles' && <Sparkles className="w-6 h-6" />}
                                        {service.icon === 'Target' && <Target className="w-6 h-6" />}
                                        {service.icon === 'Smile' && <Smile className="w-6 h-6" />}
                                        {service.icon === 'Clock' && <Clock className="w-6 h-6" />}
                                    </div>
                                    <h3 className="text-2xl font-semibold mb-3 tracking-tight text-slate-900 mt-2">{service.title}</h3>
                                    <p className="leading-relaxed text-base text-slate-500">{service.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. TEAM SECTION */}
            <section className="bg-white pt-24 pb-24 relative" id="team">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider bg-slate-100 text-slate-600">Komanda</span>
                            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-slate-900">
                                Peşəkar <span className={`${BRAND_CONFIG.colors.primaryText}`}>Həkimlərimiz</span>
                            </h2>
                            <p className="text-lg text-slate-500 font-medium max-w-xl">
                                Komandamız rahat bir mühitdə ən yüksək keyfiyyətli xidməti göstərməyə həsr olunmuşdur.
                            </p>
                        </div>
                    </div>

                    {/* Team Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-center">
                        {BRAND_CONFIG.doctors.map((doctor, i) => (
                            doctor.isHead ? (
                                <div key={i} className={`lg:col-span-1 lg:-mt-12 group relative rounded-3xl overflow-hidden ${BRAND_CONFIG.colors.primaryFull} shadow-xl shadow-emerald-500/20 cursor-pointer order-first lg:order-none`}>
                                    <div className="aspect-[4/5] w-full relative">
                                        <img src={doctor.image} alt={doctor.name} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-90" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-transparent"></div>
                                        <div className="absolute top-4 right-4 p-2 rounded-full bg-white">
                                            <Star className={`w-4 h-4 ${BRAND_CONFIG.colors.primaryText} fill-emerald-600`} />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-center text-white">
                                        <span className="inline-block px-2 py-0.5 rounded-md backdrop-blur-md text-[10px] font-bold uppercase tracking-widest mb-2 bg-white/20">{doctor.label || 'Baş Həkim'}</span>
                                        <h4 className="text-xl font-semibold">{doctor.name}</h4>
                                        <p className="text-sm font-medium text-emerald-100">{doctor.role}</p>
                                    </div>
                                </div>
                            ) : (
                                <div key={i} className="group relative rounded-3xl overflow-hidden transition-colors cursor-pointer bg-emerald-50/50 hover:bg-emerald-100/50">
                                    <div className="aspect-[4/5] w-full relative">
                                        <img src={doctor.image} alt={doctor.name} className="absolute inset-0 w-full h-full object-cover" />
                                        <div className="absolute top-4 right-4 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-white">
                                            <ArrowDownRight className={`w-4 h-4 ${BRAND_CONFIG.colors.primaryText} rotate-180`} />
                                        </div>
                                    </div>
                                    <div className="p-4 text-center">
                                        <h4 className="text-lg font-semibold text-slate-900">{doctor.name}</h4>
                                        <p className={`text-sm font-medium ${BRAND_CONFIG.colors.primaryText}`}>{doctor.role}</p>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. FAQ SECTION */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-slate-900">
                            Tez-tez Verilən <span className={`${BRAND_CONFIG.colors.primaryText}`}>Suallar</span>
                        </h2>
                        <p className="text-lg text-slate-500 font-medium">
                            Hər hansı bir sualınız varsa, tez-tez verilən suallar bölməsinə baxa bilərsiniz.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {BRAND_CONFIG.faqs.map((faq, i) => (
                            <details key={i} className="group rounded-2xl shadow-sm [&_summary::-webkit-details-marker]:hidden open:ring-1 open:ring-emerald-500/20 bg-white">
                                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-slate-900">
                                    <h2 className="text-lg font-semibold">{faq.question}</h2>
                                    <div className={`rounded-full p-1.5 ${BRAND_CONFIG.colors.primaryText} transition duration-300 group-open:-rotate-180 bg-emerald-50`}>
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </summary>
                                <p className="px-6 pb-6 text-slate-500 leading-relaxed font-medium">
                                    {faq.answer}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. APPOINTMENT SECTION */}
            <section id="book" className={`py-24 rounded-t-[3rem] lg:rounded-t-[4rem] overflow-hidden relative bg-emerald-950 text-white`}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative hidden lg:block">
                            <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-emerald-500/20 rounded-full blur-3xl"></div>
                            <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800" alt="Medical Staff" className="rounded-[2.5rem] shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500 object-cover border-4 border-emerald-900/50" />
                            <div className="absolute -bottom-8 -left-8 p-6 rounded-2xl shadow-xl max-w-xs bg-white text-slate-900 border border-slate-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-lg bg-emerald-100 ${BRAND_CONFIG.colors.primaryText}`}>
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <span className="font-bold text-lg">Sürətli Rezervasiya</span>
                                </div>
                                <p className="text-sm text-slate-500 font-medium">Randevunuzu 2 dəqiqədən az müddətdə təsdiqləyin.</p>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
                                Gülüş Səyahətinizə Bizimlə Başlayın.
                            </h2>
                            <p className="font-medium mb-10 text-lg text-emerald-200/80">
                                Növbəti ziyarətinizi planlaşdırmaq çox sadədir. Aşağıdakı formanı doldurun və qısa zamanda randevunuzu təsdiqləyək.
                            </p>

                            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onOpenWidget(); }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" placeholder="Ad Soyad" className="w-[100%] border rounded-xl px-5 py-4 placeholder-emerald-400/60 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-emerald-900/50 border-emerald-800 text-white" />
                                    <input type="tel" placeholder="Telefon Nömrəsi" className="w-[100%] border rounded-xl px-5 py-4 placeholder-emerald-400/60 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-emerald-900/50 border-emerald-800 text-white" />
                                </div>
                                <button type="button" onClick={onOpenWidget} className={`w-full ${BRAND_CONFIG.colors.primaryFull} font-semibold text-lg py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 flex items-center justify-center gap-2 mt-4 ${BRAND_CONFIG.colors.primaryHover} text-white`}>
                                    Randevu Al <ArrowRight className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. FOOTER */}
            <footer className="pt-20 pb-10 border-t bg-slate-50 border-slate-200" id="contact">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        <div className="space-y-6">
                            <a href="#" className="flex items-center gap-2">
                                <div className={`${BRAND_CONFIG.colors.primaryFull} p-1.5 rounded-lg text-white`}>
                                    <Smile className="w-6 h-6 stroke-[1.5]" />
                                </div>
                                <span className="text-xl font-semibold tracking-tight text-slate-900">{BRAND_CONFIG.name}</span>
                            </a>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                {BRAND_CONFIG.description.substring(0, 100)}...
                            </p>
                            <div className="flex gap-4">
                                <a href={BRAND_CONFIG.contact.social.facebook} className={`w-10 h-10 rounded-full border flex items-center justify-center ${BRAND_CONFIG.colors.primaryHover} hover:border-emerald-500 transition-all bg-white border-slate-200 ${BRAND_CONFIG.colors.primaryText} hover:text-white`}>
                                    <Facebook className="w-5 h-5" />
                                </a>
                                <a href={BRAND_CONFIG.contact.social.instagram} className={`w-10 h-10 rounded-full border flex items-center justify-center ${BRAND_CONFIG.colors.primaryHover} hover:border-emerald-500 transition-all bg-white border-slate-200 ${BRAND_CONFIG.colors.primaryText} hover:text-white`}>
                                    <Instagram className="w-5 h-5" />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold mb-6 text-slate-900">Əlaqə</h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-slate-500 font-medium leading-relaxed">
                                    <MapPin className={`w-5 h-5 ${BRAND_CONFIG.colors.primaryText} shrink-0`} />
                                    <span>{BRAND_CONFIG.contact.address}</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-500 font-medium">
                                    <Phone className={`w-5 h-5 ${BRAND_CONFIG.colors.primaryText} shrink-0`} />
                                    <span>{BRAND_CONFIG.contact.phone}</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-500 font-medium">
                                    <Mail className={`w-5 h-5 ${BRAND_CONFIG.colors.primaryText} shrink-0`} />
                                    <span>{BRAND_CONFIG.contact.email}</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-6 text-slate-900">İş Saatları</h4>
                            <ul className="space-y-3 text-slate-500 font-medium">
                                {BRAND_CONFIG.workingHours.map((interval, i) => (
                                    <li key={i} className="flex justify-between">
                                        <span>{interval.days}</span>
                                        <span className="text-slate-900">{interval.hours}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-6 text-slate-900">Xidmətlər</h4>
                            <ul className="space-y-3 text-slate-500 font-medium">
                                {BRAND_CONFIG.services.slice(0, 4).map((service) => (
                                    <li key={service.id}><a href="#" className={`hover:${BRAND_CONFIG.colors.primaryText} transition-colors`}>{service.title}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-slate-200">
                        <p className="text-slate-500 font-medium text-sm">© 2024 {BRAND_CONFIG.name}. Bütün hüquqlar qorunur.</p>
                        <div className="flex gap-8 text-sm font-medium text-slate-500">
                            <a href="#" className={`hover:${BRAND_CONFIG.colors.primaryText}`}>Məxfilik Siyasəti</a>
                            <a href="#" className={`hover:${BRAND_CONFIG.colors.primaryText}`}>Şərtlər və Qaydalar</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Floating Chat Button */}
            {!isVoiceWidgetOpen && (
                <button
                    onClick={onOpenWidget}
                    className={`fixed bottom-6 right-6 z-40 w-16 h-16 ${BRAND_CONFIG.colors.primaryFull} text-white rounded-full shadow-2xl shadow-emerald-500/30 flex items-center justify-center transition-all ${BRAND_CONFIG.colors.primaryHover} hover:scale-105 active:scale-95 group`}
                >
                    <MessageSquare className="w-7 h-7" />
                    <span className="absolute right-full mr-4 bg-white text-slate-800 px-4 py-2 rounded-2xl text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 origin-right whitespace-nowrap pointer-events-none border border-slate-100">
                        Canlı Asistent
                    </span>
                </button>
            )}
        </div>
    );
};

export default ClinicWebsiteTemplate;
