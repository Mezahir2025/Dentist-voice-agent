
import React from 'react';
import { Appointment } from '../types';
import { Calendar, Clock, Phone, User, CheckCircle, XCircle, MoreVertical, MessageSquare } from 'lucide-react';

interface Props {
  appointment: Appointment;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
}

const AppointmentCard: React.FC<Props> = ({ appointment, onConfirm, onCancel }) => {
  const statusStyles = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Yeni Müraciət', border: 'border-amber-100' },
    confirmed: { bg: 'bg-teal-50', text: 'text-teal-700', label: 'Təsdiqləndi', border: 'border-teal-100' },
    cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Ləğv edildi', border: 'border-rose-100' },
  };

  const currentStyle = statusStyles[appointment.status];

  return (
    <div className="group bg-white rounded-[3rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-10 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:border-teal-100/50 relative overflow-hidden">
      {/* Decorative Gradient Overlay */}
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-[60px] opacity-10 transition-all duration-700 group-hover:opacity-20 ${
        appointment.status === 'pending' ? 'bg-amber-400' : appointment.status === 'confirmed' ? 'bg-teal-400' : 'bg-rose-400'
      }`} />

      <div className="flex justify-between items-start mb-10 relative z-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-teal-50 group-hover:border-teal-100 transition-all duration-500">
            <User className="w-8 h-8 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xl tracking-tight group-hover:text-teal-700 transition-colors">{appointment.patientName}</h3>
            <div className="flex items-center gap-2 mt-2">
               <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border}`}>
                {currentStyle.label}
              </span>
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">• ID: {appointment.id}</span>
            </div>
          </div>
        </div>
        <button className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-300 hover:text-slate-600">
          <MoreVertical className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10 relative z-10">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Görüş Tarixi</p>
          <div className="flex items-center gap-3 text-slate-700 font-semibold">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>{appointment.date}</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Saat</p>
          <div className="flex items-center gap-3 text-slate-700 font-semibold">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>{appointment.time}</span>
          </div>
        </div>
        <div className="col-span-2 space-y-1.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Əlaqə nömrəsi</p>
          <div className="flex items-center gap-3 text-slate-700 font-semibold">
            <Phone className="w-4 h-4 text-teal-600" />
            <span>{appointment.phoneNumber}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-3xl mb-10 border border-slate-100 relative z-10 group-hover:bg-white transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Səbəb</p>
        </div>
        <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{appointment.reason}"</p>
      </div>

      {appointment.status === 'pending' && (
        <div className="flex gap-4 relative z-10">
          <button 
            onClick={() => onConfirm(appointment.id)}
            className="flex-1 flex items-center justify-center gap-3 bg-slate-900 hover:bg-teal-600 text-white py-5 rounded-2xl text-[13px] font-bold transition-all active:scale-95 shadow-xl shadow-slate-900/10"
          >
            <CheckCircle className="w-5 h-5" /> Təsdiq Et
          </button>
          <button 
            onClick={() => onCancel(appointment.id)}
            className="flex items-center justify-center px-6 bg-white hover:bg-rose-50 text-rose-500 border-2 border-slate-100 hover:border-rose-100 py-5 rounded-2xl text-[13px] font-bold transition-all active:scale-95"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
