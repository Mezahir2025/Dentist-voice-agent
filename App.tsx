
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
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  query,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { Appointment } from './types';
import LiveVoiceSession from './components/LiveVoiceSession';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import ManualAppointmentModal from './components/ManualAppointmentModal';
import { BRAND_CONFIG } from './brandConfig';

type UserRole = 'patient' | 'dentist';
const COLLECTION_PATH = "3289uriu2903u90";

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setRole('dentist');
        setIsVoiceWidgetOpen(false); // Close widget when entering dashboard
      } else {
        setRole('patient');
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Appointments
  useEffect(() => {
    if (!currentUser || role !== 'dentist') return;
    const q = query(collection(db, COLLECTION_PATH));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(apps.sort((a, b) => b.timestamp - a.timestamp));
    });
    return () => unsubscribe();
  }, [currentUser, role]);

  const handleLogout = async () => {
    await signOut(auth);
    setRole('patient');
  };

  const handleUpdateStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    if (status === 'cancelled') {
      // Delete cancelled appointments instead of updating status
      const docRef = doc(db, COLLECTION_PATH, id);
      await deleteDoc(docRef);
    } else {
      const docRef = doc(db, COLLECTION_PATH, id);
      await updateDoc(docRef, { status });
    }
  };

  const handleBookAppointment = async (data: any) => {
    await addDoc(collection(db, COLLECTION_PATH), {
      ...data,
      status: 'pending',
      timestamp: Date.now(),
      createdAt: serverTimestamp()
    });
    setNotification({ message: 'Randevunuz uğurla qeydə alındı!', type: 'success' });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleDeleteAllAppointments = async () => {
    if (!currentUser || role !== 'dentist') return;

    // Batch delete would be better for many docs, but loop is fine for small scale
    const promises = appointments.map(app => deleteDoc(doc(db, COLLECTION_PATH, app.id)));
    await Promise.all(promises);

    setNotification({ message: 'Bütün randevular silindi!', type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

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
