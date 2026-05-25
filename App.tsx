
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Smile, ArrowRight, Star, Plus,
  Menu, Bell, ChevronLeft, ChevronRight, ChevronDown,
  Calendar as CalendarIcon, MessageSquare, X,
  ArrowDownRight, HeartHandshake, CheckCircle2,
  Clock, MapPin, Phone, Instagram, Facebook,
  Loader2, LogIn, Mail, Twitter, Target, Award, Users2,
  CheckCircle, Check, Sparkles, Filter, LayoutGrid, List, Activity, Users, CalendarCheck
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { Appointment } from './types';
import LiveVoiceSession from './components/LiveVoiceSession';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import ClinicWebsiteTemplate from './components/ClinicWebsiteTemplate';
import ManualAppointmentModal from './components/ManualAppointmentModal';
import { BRAND_CONFIG } from './brandConfig';

type UserRole = 'patient' | 'dentist';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('patient');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isVoiceWidgetOpen, setIsVoiceWidgetOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Helper for smooth scrolling
  const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, []);

  // 1. Auth states & Header Updates
  useEffect(() => {
    // Dynamic tab info
    document.title = `${BRAND_CONFIG.name} — Premium Stomatoloji Xidmət`;

    // Set Favicon
    const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.rel = 'shortcut icon';
    link.href = 'https://cdn-icons-png.flaticon.com/512/3209/3209085.png';
    if (!document.querySelector("link[rel*='icon']")) {
      document.head.appendChild(link);
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUser(session.user);
        setRole('dentist');
      }
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setCurrentUser(session.user);
        setRole('dentist');
        setIsVoiceWidgetOpen(false);
      } else {
        setCurrentUser(null);
        setRole('patient');
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser || role !== 'dentist') return;

    // Initial Fetch
    supabase
      .from('appointments')
      .select('*')
      .order('timestamp', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("Initial fetch error:", error.message);
        if (data) setAppointments(data as Appointment[]);
      });

    // Realtime listener
    const channel = supabase
      .channel('public:appointments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          supabase
            .from('appointments')
            .select('*')
            .order('timestamp', { ascending: false })
            .then(({ data }) => {
              if (data) setAppointments(data as Appointment[]);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, role]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRole('patient');
  };

  const handleUpdateStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    if (status === 'cancelled') {
      await supabase.from('appointments').delete().eq('id', id);
    } else {
      await supabase.from('appointments').update({ status }).eq('id', id);
    }
  };

  const handleBookAppointment = async (data: any) => {
    const { error } = await supabase.from('appointments').insert([
      {
        patient_name: data.patientName,
        phone: data.phone,
        date: data.date,
        time: data.time,
        reason: data.reason,
        status: 'pending',
        timestamp: Date.now()
      }
    ]);

    if (error) {
      console.error("Booking error details:", error.message, error.details, error.hint);
      return;
    }

    setNotification({ message: 'Randevunuz uğurla qeydə alındı!', type: 'success' });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleDeleteAllAppointments = async () => {
    if (!currentUser || role !== 'dentist') return;

    const { error } = await supabase.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error("Delete all error:", error);
      return;
    }

    setNotification({ message: 'Bütün randevular silindi!', type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  // Clinic website template view
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('view') === 'clinic') {
    return <ClinicWebsiteTemplate onOpenAuth={() => {}} onOpenWidget={() => {}} />;
  }

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // PATIENT VIEW (Landing Page)
  if (role === 'patient') {
    return (
      <>
        <LandingPage
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenWidget={() => setIsVoiceWidgetOpen(true)}
        />
        <LiveVoiceSession isOpen={isVoiceWidgetOpen} onClose={() => setIsVoiceWidgetOpen(false)} onAppointmentBooked={handleBookAppointment} />
        <Auth isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onAuthSuccess={(u) => { setCurrentUser(u); setRole('dentist'); setIsVoiceWidgetOpen(false); }} />
      </>
    );
  }

  // DENTIST VIEW
  return (
    <>
      <Dashboard
        currentUser={currentUser}
        appointments={appointments}
        onLogout={handleLogout}
        onUpdateStatus={handleUpdateStatus}
        onOpenVoiceWidget={() => setIsVoiceWidgetOpen(true)}
        onOpenManualBooking={() => setIsManualModalOpen(true)}
        onDeleteAll={handleDeleteAllAppointments}
      />

      <LiveVoiceSession
        isOpen={isVoiceWidgetOpen}
        onClose={() => setIsVoiceWidgetOpen(false)}
        onAppointmentBooked={handleBookAppointment}
      />

      <ManualAppointmentModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSubmit={handleBookAppointment}
      />

      {notification && (
        <div className="fixed bottom-10 right-10 z-[150] animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl bg-[#1E293B] text-white border border-slate-700">
            <Check className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">{notification.message}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
