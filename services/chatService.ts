import { supabase } from '../supabaseClient';
import { Speaker } from '../types';

export interface ChatSession {
    id: string;
    patient_name: string;
    last_message: string;
    last_message_time: string;
    status: 'active' | 'completed' | 'waiting_for_doctor' | 'doctor_responding';
    created_at: string;
}

export interface ChatMessage {
    id: string;
    session_id: string;
    speaker: Speaker;
    text: string;
    timestamp: number;
    created_at: string;
}

export const ChatService = {
    createSession: async (initialName: string = "Anonim Xəstə"): Promise<string> => {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .insert([
                    {
                        patient_name: initialName,
                        last_message: "Söhbət başladı",
                        status: 'active'
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            return data.id;
        } catch (error) {
            console.error("Error creating session:", error);
            throw error;
        }
    },

    updateSessionName: async (sessionId: string, newName: string) => {
        try {
            const { error } = await supabase
                .from('sessions')
                .update({ patient_name: newName })
                .eq('id', sessionId);
            if (error) throw error;
        } catch (error) {
            console.error("Error updating session name:", error);
        }
    },

    saveMessage: async (sessionId: string, speaker: Speaker, text: string) => {
        if (!sessionId) return;
        try {
            const { error: msgError } = await supabase
                .from('messages')
                .insert([
                    {
                        session_id: sessionId,
                        speaker,
                        text,
                        timestamp: Date.now()
                    }
                ]);
            if (msgError) throw msgError;

            await supabase
                .from('sessions')
                .update({
                    last_message: text,
                    last_message_time: new Date().toISOString()
                })
                .eq('id', sessionId);
        } catch (error) {
            console.error("Error saving message:", error);
        }
    },

    subscribeToSessionMessages: (sessionId: string, callback: (messages: ChatMessage[]) => void) => {
        if (!sessionId) return () => { };
        supabase
            .from('messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })
            .then(({ data }) => {
                if (data) callback(data as ChatMessage[]);
            });

        const channel = supabase
            .channel(`messages:${sessionId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `session_id=eq.${sessionId}` }, () => {
                supabase
                    .from('messages')
                    .select('*')
                    .eq('session_id', sessionId)
                    .order('created_at', { ascending: true })
                    .then(({ data }) => {
                        if (data) callback(data as ChatMessage[]);
                    });
            })
            .subscribe();
        return () => supabase.removeChannel(channel);
    },

    subscribeToAllSessions: (callback: (sessions: ChatSession[]) => void) => {
        supabase
            .from('sessions')
            .select('*')
            .order('last_message_time', { ascending: false })
            .then(({ data }) => {
                if (data) callback(data as ChatSession[]);
            });

        const channel = supabase
            .channel('public:sessions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => {
                supabase
                    .from('sessions')
                    .select('*')
                    .order('last_message_time', { ascending: false })
                    .then(({ data }) => {
                        if (data) callback(data as ChatSession[]);
                    });
            })
            .subscribe();
        return () => supabase.removeChannel(channel);
    },

    deleteSession: async (sessionId: string) => {
        await supabase.from('sessions').delete().eq('id', sessionId);
    },

    deleteAllSessions: async () => {
        await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    },

    deleteMessage: async (sessionId: string, messageId: string) => {
        if (!sessionId || !messageId) return;
        await supabase.from('messages').delete().eq('id', messageId);
    },

    updateSessionStatus: async (sessionId: string, status: 'active' | 'waiting_for_doctor' | 'doctor_responding') => {
        await supabase.from('sessions').update({ status }).eq('id', sessionId);
    },

    sendDoctorMessage: async (sessionId: string, text: string) => {
        if (!sessionId || !text.trim()) return;
        try {
            await supabase.from('messages').insert([{ session_id: sessionId, speaker: 'doctor', text, timestamp: Date.now() }]);
            await supabase.from('sessions').update({ last_message: text, last_message_time: new Date().toISOString(), status: 'doctor_responding' }).eq('id', sessionId);
        } catch (error) {
            console.error("Error sending doctor message:", error);
        }
    }
};
