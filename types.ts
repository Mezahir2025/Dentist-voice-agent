
export interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: any;
  timestamp: number;
}

export interface VoiceState {
  isActive: boolean;
  isConnecting: boolean;
  isListening: boolean;
  error: string | null;
}

export enum Speaker {
  User = 'User',
  Agent = 'Agent',
  Doctor = 'doctor'
}

export interface TranscriptionEntry {
  speaker: Speaker;
  text: string;
  timestamp: number;
}
