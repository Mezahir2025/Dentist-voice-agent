
import React, { useState, useMemo } from 'react';
import {
  Stethoscope, LogOut, MessageCircle,
  Plus, Clock, Bell, ChevronLeft, ChevronRight, MoreHorizontal, Menu,
  Calendar as CalendarIcon, MessageSquare, X, Search, Send, Paperclip,
  Check, User, Filter, LayoutGrid, List, Activity, Users, CalendarCheck
} from 'lucide-react';
import { Appointment, Speaker } from '../types';
import { ChatService, ChatMessage } from '../services/chatService';
import { BRAND_CONFIG } from '../brandConfig';

interface DashboardProps {
  currentUser: any;
  appointments: Appointment[];
  onLogout: () => void;
  onUpdateStatus: (id: string, status: 'confirmed' | 'cancelled') => void;
  onOpenVoiceWidget: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  appointments,
  onLogout,
  onUpdateStatus,
  onOpenVoiceWidget
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'chat'>('appointments');
  const [viewDate, setViewDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Multi-session chat stats
  const [sessions, setSessions] = useState<any[]>([]); // ChatSession[]
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 1. Bütün sessiyaları (xəstələri) yüklə
  React.useEffect(() => {
    const unsubscribe = ChatService.subscribeToAllSessions((newSessions) => {
      setSessions(newSessions);
      // İlk dəfə yüklənəndə və ya sessiya yoxdursa, birincini seçə bilərik (optional)
    });
    return () => unsubscribe();
  }, []);

  // 2. Seçilmiş sessiyanın mesajlarını yüklə
  React.useEffect(() => {
    if (activeSessionId) {
      const unsubscribe = ChatService.subscribeToSessionMessages(activeSessionId, setMessages);
      return () => unsubscribe();
    } else {
      setMessages([]);
    }
  }, [activeSessionId]);

  const handleDeleteSession = async () => {
    if (activeSessionId && window.confirm("Bu söhbəti silmək istədiyinizə əminsiniz?")) {
      await ChatService.deleteSession(activeSessionId);
      setActiveSessionId(null);
    }
  };

  const selectedSession = sessions.find(s => s.id === activeSessionId);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
    };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    if (filterStatus === 'all') return appointments;
    return appointments.filter(app => app.status === filterStatus);
  }, [appointments, filterStatus]);

  return (
    <div className="dashboard-v2 min-h-screen flex w-full bg-[#F8FAFC] font-['Plus_Jakarta_Sans',sans-serif] relative">
      {/* SIDEBAR OVERLAY (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-[280px] bg-white flex flex-col py-8 border-r border-slate-100 shrink-0 h-screen z-40 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-8 mb-10 flex items-center gap-3">
          <div className={`w-10 h-10 ${BRAND_CONFIG.colors.primaryFull} rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20`}>
            <Stethoscope size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900 tracking-tight">{BRAND_CONFIG.name}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-sm group ${activeTab === 'appointments' ? `bg-${BRAND_CONFIG.colors.primary}-50 ${BRAND_CONFIG.colors.primaryText}` : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
          >
            <div className="flex items-center gap-3">
              <CalendarIcon size={18} className={activeTab === 'appointments' ? BRAND_CONFIG.colors.primaryText : 'text-slate-400 group-hover:text-slate-600'} />
              <span>Randevular</span>
            </div>
            {stats.pending > 0 && (
              <span className={`${BRAND_CONFIG.colors.primaryFull} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-emerald-500/20`}>{stats.pending}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-sm group ${activeTab === 'chat' ? `bg-${BRAND_CONFIG.colors.primary}-50 ${BRAND_CONFIG.colors.primaryText}` : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare size={18} className={activeTab === 'chat' ? BRAND_CONFIG.colors.primaryText : 'text-slate-400 group-hover:text-slate-600'} />
              <span>Mesajlar</span>
            </div>
          </button>
        </nav>

        <div className="px-4 mt-auto">
          <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                {currentUser?.displayName?.[0] || 'D'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">{currentUser?.displayName || 'Dr. Sahibə'}</p>
                <p className="text-xs text-slate-400 truncate">Baş Həkim</p>
              </div>
            </div>
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-xl font-semibold transition-all text-xs border border-transparent hover:border-rose-100">
              <LogOut size={14} /> Çıxış
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">
              {activeTab === 'appointments' ? 'Randevular' : 'Mesajlar'}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-64 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Axtar..." className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:bg-white focus:border-emerald-500 transition-all" />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50 rounded-full hover:bg-emerald-50">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button onClick={onOpenVoiceWidget} className="bg-emerald-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:bg-emerald-600 active:scale-95 transition-all">
              <Plus size={18} /> <span className="hidden sm:inline">Yeni Randevu</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'appointments' ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Ümumi</p>
                    <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Gözləyən</p>
                    <h3 className="text-2xl font-bold text-slate-900">{stats.pending}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CalendarCheck size={24} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Təsdiqlənmiş</p>
                    <h3 className="text-2xl font-bold text-slate-900">{stats.confirmed}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Aktivlik</p>
                    <h3 className="text-2xl font-bold text-slate-900">98%</h3>
                  </div>
                </div>
              </div>

              {/* Filters & View Toggle */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-4">
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
                  {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold capitalize transition-all whitespace-nowrap ${filterStatus === status ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                      {status === 'all' ? 'Hamısı' : status === 'pending' ? 'Gözləyən' : status === 'confirmed' ? 'Təsdiqlənmiş' : 'Ləğv'}
                    </button>
                  ))}
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                    <List size={18} />
                  </button>
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                    <LayoutGrid size={18} />
                  </button>
                </div>
              </div>

              {/* Appointments List/Grid */}
              {viewMode === 'list' ? (
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Xəstə</th>
                          <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Tarix & Saat</th>
                          <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Səbəb</th>
                          <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                          <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Əməliyyatlar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredAppointments.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm uppercase">
                                  {app.patientName[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-sm">{app.patientName}</p>
                                  <p className="text-xs text-slate-400">{app.phoneNumber}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                  <CalendarIcon size={14} className="text-slate-400" /> {app.date}
                                </span>
                                <span className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                                  <Clock size={14} /> {app.time}
                                </span>
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                                {app.reason}
                              </span>
                            </td>
                            <td className="py-5 px-6">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${app.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                app.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                  'bg-orange-50 text-orange-600 border-orange-100'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${app.status === 'confirmed' ? 'bg-emerald-500' :
                                  app.status === 'cancelled' ? 'bg-rose-500' :
                                    'bg-orange-500'
                                  }`}></span>
                                {app.status === 'pending' ? 'Gözləyir' : app.status === 'confirmed' ? 'Təsdiq' : 'Ləğv'}
                              </span>
                            </td>
                            <td className="py-5 px-6 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {app.status !== 'confirmed' && (
                                  <button onClick={() => onUpdateStatus(app.id, 'confirmed')} className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Təsdiqlə">
                                    <Check size={16} />
                                  </button>
                                )}
                                {app.status !== 'cancelled' && (
                                  <button onClick={() => onUpdateStatus(app.id, 'cancelled')} className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors" title="Ləğv et">
                                    <X size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredAppointments.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-400">
                              <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                  <CalendarIcon size={24} className="opacity-50" />
                                </div>
                                <p className="text-sm font-medium">Bu statusda randevu tapılmadı.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAppointments.map((app) => (
                    <div key={app.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-full h-1.5 ${app.status === 'confirmed' ? 'bg-emerald-500' :
                        app.status === 'cancelled' ? 'bg-rose-500' :
                          'bg-orange-500'
                        }`}></div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 font-bold text-lg uppercase">
                            {app.patientName[0]}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-lg">{app.patientName}</h3>
                            <p className="text-xs text-slate-400 font-medium">{app.phoneNumber}</p>
                          </div>
                        </div>
                        <button className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={20} /></button>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <CalendarIcon size={16} />
                          </div>
                          <span className="font-semibold">{app.date}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <Clock size={16} />
                          </div>
                          <span className="font-semibold">{app.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <Activity size={16} />
                          </div>
                          <span className="font-medium">{app.reason}</span>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-slate-50">
                        <button onClick={() => onUpdateStatus(app.id, 'confirmed')} className="flex-1 bg-emerald-50 text-emerald-600 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-100 transition-colors">
                          Təsdiqlə
                        </button>
                        <button onClick={() => onUpdateStatus(app.id, 'cancelled')} className="px-4 border border-slate-100 text-rose-500 rounded-xl hover:bg-rose-50 transition-colors">
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#F8FAFC]">
              {/* Chat Sidebar - Sessiyalar Siyahısı */}
              <div className={`w-full lg:w-80 bg-white border-r border-slate-100 flex flex-col min-h-0 ${activeSessionId ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-4 md:p-6 border-b border-slate-50">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Mesajlar</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Axtar..." className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                  {sessions.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">Heç bir söhbət tapılmadı.</div>
                  ) : (
                    sessions.map(session => (
                      <button
                        key={session.id}
                        onClick={() => setActiveSessionId(session.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${activeSessionId === session.id ? `bg-${BRAND_CONFIG.colors.primary}-50 border border-${BRAND_CONFIG.colors.primary}-100 shadow-sm` : 'hover:bg-slate-50 border border-transparent'}`}
                      >
                        <div className="relative shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase bg-emerald-500`}>
                            {session.patientName?.[0] || 'A'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-sm text-slate-900 truncate">{session.patientName}</h4>
                          </div>
                          <p className="text-xs text-slate-500 truncate">{session.lastMessage}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area - Seçilmiş Sessiya */}
              <div className={`flex-1 flex flex-col bg-[#F8FAFC] min-h-0 ${!activeSessionId ? 'hidden lg:flex' : 'flex'}`}>
                {selectedSession ? (
                  <>
                    <div className="h-20 px-4 md:px-8 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setActiveSessionId(null)}
                          className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase ${BRAND_CONFIG.colors.primaryFull}`}>
                          {selectedSession.patientName?.[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{selectedSession.patientName}</h4>
                          <p className={`text-xs ${BRAND_CONFIG.colors.primaryText} font-bold uppercase tracking-wider flex items-center gap-1`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${BRAND_CONFIG.colors.primaryFull}`}></span> Online
                          </p>
                        </div>
                      </div>
                      <button onClick={handleDeleteSession} className="p-2 text-rose-400 hover:text-rose-600 transition-colors rounded-full hover:bg-rose-50" title="Sil">
                        <LogOut size={20} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <MessageSquare size={32} className="mb-2 opacity-50" />
                          <p className="text-xs font-bold uppercase tracking-wider">Hələ ki, yazışma yoxdur</p>
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.speaker === Speaker.Agent ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm border ${msg.speaker === Speaker.Agent
                              ? 'bg-emerald-500 text-white rounded-tr-none shadow-emerald-500/20 border-emerald-500'
                              : 'bg-white text-slate-700 rounded-tl-none border-slate-100'
                              }`}>
                              <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                              <span className={`text-[10px] font-bold mt-2 block ${msg.speaker === Speaker.Agent ? 'text-emerald-100/70 text-right' : 'text-slate-300'
                                }`}>
                                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <MessageCircle size={40} className="text-slate-400" />
                    </div>
                    <p className="font-bold text-slate-500 uppercase tracking-widest text-sm">Soldan bir söhbət seçin</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
