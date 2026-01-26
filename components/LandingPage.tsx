import React from 'react';
import {
    Smile, ArrowRight, Star, HeartHandshake, Target, ShieldCheck, Zap,
    Play, Phone, Activity
} from 'lucide-react';
import { BRAND_CONFIG } from '../brandConfig';

interface LandingPageProps {
    onOpenAuth: () => void;
    onOpenWidget: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onOpenWidget }) => {
    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="min-h-screen bg-navy-950 text-white font-sans selection:bg-gold-500/30 selection:text-gold-200 overflow-x-hidden">

            {/* BACKGROUND EFFECTS */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-navy-800/20 rounded-full blur-[120px] animate-float"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold-600/5 rounded-full blur-[120px] animate-float [animation-delay:2s]"></div>
                <div className="absolute top-[30%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-navy-900/10 rounded-full blur-[100px]"></div>
            </div>

            {/* NAVIGATION */}
            <nav className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-white/5 bg-navy-950/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-24">
                        {/* Logo */}
                        <a href="#" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gold-500/20 blur-xl rounded-full group-hover:bg-gold-500/30 transition-all"></div>
                                <div className="relative bg-gradient-to-br from-navy-800 to-navy-950 border border-white/10 p-2.5 rounded-xl text-gold-400">
                                    <Smile className="w-6 h-6 stroke-[1.5]" />
                                </div>
                            </div>
                            <div>
                                <span className="block text-xl font-serif font-bold tracking-tight text-white leading-none">
                                    {BRAND_CONFIG?.name || 'Stom AI'}
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-500/80 font-semibold">Dental Studio</span>
                            </div>
                        </a>



                        {/* Auth Buttons */}
                        <div className="flex items-center gap-6">
                            <button
                                onClick={onOpenAuth}
                                className="hidden sm:flex text-sm font-medium text-navy-200 hover:text-white transition-colors"
                            >
                                Giriş
                            </button>
                            <button
                                onClick={onOpenWidget}
                                className="relative group overflow-hidden rounded-full"
                            >
                                <div className="absolute inset-0 bg-gold-500 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                                <div className="relative border border-gold-500/30 px-8 py-3 rounded-full text-sm font-bold text-gold-400 group-hover:text-navy-950 transition-colors duration-300 tracking-wide uppercase">
                                    Randevu Al
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section id="home" className="relative min-h-screen flex items-center pt-24 pb-0 overflow-hidden z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">

                        {/* Text Content */}
                        <div className="space-y-12 relative order-2 lg:order-1">
                            <div className="inline-flex items-center gap-3 pl-1 pr-4 py-1 rounded-full bg-gold-900/20 border border-gold-500/20 text-gold-300 text-[10px] font-bold tracking-[0.2em] uppercase mb-6 animate-in fade-in slide-in-from-left-4 duration-700">
                                <span className="flex h-6 w-8 items-center justify-center rounded-full bg-gold-500 text-navy-950">AI</span>
                                Yeni Nəsil Stomatologiya
                            </div>

                            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-serif font-medium tracking-tight leading-[0.95] text-white">
                                <span className="block text-navy-200/50">Mükəmməl</span>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-200 via-gold-400 to-gold-600">
                                    Gülüşlər
                                </span>
                            </h1>

                            <p className="text-lg text-navy-200/70 leading-relaxed max-w-lg font-light border-l-2 border-gold-500/20 pl-8">
                                Estetika və texnologiyanın vəhdəti.
                                Süni intellekt dəstəkli asistentimizlə vaxtınızı ən səmərəli şəkildə idarə edin.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 pt-4">
                                <button
                                    onClick={onOpenWidget}
                                    className="flex items-center justify-center gap-4 bg-gold-500 text-navy-950 px-10 py-5 rounded-none rounded-tr-3xl rounded-bl-3xl font-bold tracking-wide shadow-[0_0_40px_-10px_rgba(198,168,124,0.3)] hover:shadow-[0_0_60px_-10px_rgba(198,168,124,0.5)] hover:scale-[1.02] transition-all active:scale-95 group"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    <span>CANLI DEMO</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <div className="flex items-center gap-5 px-8 py-5 rounded-none rounded-tl-3xl rounded-br-3xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer">
                                    <div className="flex -space-x-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-12 h-12 rounded-full border-2 border-navy-950 bg-navy-800 overflow-hidden grayscale hover:grayscale-0 transition-all duration-300">
                                                <img src={`https://i.pravatar.cc/100?img=${i + 30}`} className="w-full h-full object-cover" alt="User" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-serif text-lg text-white leading-none mb-1">500+</p>
                                        <p className="text-navy-300 text-xs tracking-wider uppercase">Məmnun Pasiyent</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Representation */}
                        <div className="relative h-[600px] flex items-center justify-center order-1 lg:order-2">
                            {/* Abstract Luxury Shape */}
                            <div className="absolute inset-0 bg-gradient-to-b from-gold-500/10 to-transparent rounded-full blur-3xl opacity-30"></div>

                            <div className="relative w-full max-w-md aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-navy-900 group">
                                <img
                                    src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800"
                                    alt="Luxury Dental Interior"
                                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-transparent"></div>

                                {/* Floating UI Card */}
                                <div className="absolute bottom-10 left-10 right-10 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl animate-float">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center text-navy-950 shadow-lg shadow-gold-500/20">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gold-400 uppercase tracking-widest mb-1">Səsli Asistent</p>
                                            <p className="text-white font-serif text-xl">Stom AI</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-1.5 w-full bg-navy-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-gold-500 w-2/3 animate-[shimmer_2s_infinite]"></div>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-navy-300 font-medium tracking-wider">
                                            <span>SƏSİ DİNLƏYİR...</span>
                                            <span>00:24</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* SERVICES / FEATURES GRID */}
            <section id="features" className="py-32 relative z-10 bg-navy-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
                        <div className="max-w-xl">
                            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
                                İstisna <span className="text-gold-500 italic">Xidmət</span>, <br />
                                Unudulmaz Təcrübə.
                            </h2>
                            <p className="text-navy-300 text-lg font-light leading-relaxed">
                                Hər bir detal sizin rahatlığınız və sağlamlığınız üçün incəliklə düşünülmüşdür.
                            </p>
                        </div>
                        <button className="text-gold-400 uppercase tracking-widest text-xs font-bold border-b border-gold-500/30 pb-1 hover:text-white hover:border-white transition-all">
                            Bütün Xidmətlər
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: ShieldCheck,
                                title: "Tam Məxfilik",
                                desc: "Premium standartlara uyğun məlumat təhlükəsizliyi və konfidensiallıq."
                            },
                            {
                                icon: Zap,
                                title: "Smart Randevu",
                                desc: "Süni intellekt ilə 24/7 anında randevu təsdiqi və xatırlatmalar."
                            },
                            {
                                icon: Star,
                                title: "VIP Qulluq",
                                desc: "Hər pasiyentə fərdi yanaşma və özəl müalicə planı."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group p-10 rounded-[2rem] bg-navy-800/30 border border-white/5 hover:bg-navy-800 hover:border-gold-500/20 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <feature.icon className="w-32 h-32 text-gold-500 transform rotate-12" />
                                </div>

                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-navy-700 to-navy-900 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                                        <feature.icon className="w-7 h-7 text-gold-400" />
                                    </div>
                                    <h3 className="text-2xl font-serif text-white mb-4">{feature.title}</h3>
                                    <p className="text-navy-300 leading-relaxed font-light">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION */}
            <section className="py-32 relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gold-900/5"></div>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="relative rounded-[3rem] overflow-hidden p-12 lg:p-24 text-center border border-white/5 bg-navy-900">
                        {/* Decorative Patterns */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-900/10 to-transparent opacity-50"></div>

                        <div className="relative z-10">
                            <h2 className="text-5xl md:text-7xl font-serif text-white mb-8 tracking-tight">
                                Gülüşünüzü <span className="text-gold-500">Kəşf Edin</span>
                            </h2>
                            <p className="text-xl text-navy-200/80 mb-12 max-w-2xl mx-auto font-light">
                                İlk konsultasiya tamamilə ödənişsizdir.
                                Bu gün qeydiyyatdan keçin və fərqi hiss edin.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <button
                                    onClick={onOpenWidget}
                                    className="w-full sm:w-auto px-10 py-5 bg-gold-500 text-navy-950 text-sm font-bold tracking-widest uppercase hover:bg-white transition-colors shadow-2xl shadow-gold-900/20"
                                >
                                    İndi Başla
                                </button>
                                <button className="w-full sm:w-auto px-10 py-5 bg-transparent border border-navy-700 text-white text-sm font-bold tracking-widest uppercase hover:border-gold-500 hover:text-gold-500 transition-colors">
                                    Əlaqə Saxla
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER SIMPLE */}
            <footer className="py-10 border-t border-white/5 text-center">
                <p className="text-navy-400 text-sm font-light uppercase tracking-widest">© 2026 Stom AI. All rights reserved.</p>
            </footer>

        </div>
    );
};

export default LandingPage;
