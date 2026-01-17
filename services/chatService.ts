import { db } from '../firebase';
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    Timestamp,
    getDocs,
    writeBatch,
    serverTimestamp,
    doc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { Speaker } from '../types';

export interface ChatSession {
    id: string;
    patientName: string; // 'Anonim' ve ya 'Məzahir bəy'
    lastMessage: string;
    lastMessageTime: any;
    createdAt: any;
    status: 'active' | 'completed';
}

export interface ChatMessage {
    id?: string;
    speaker: Speaker;
    text: string;
    timestamp: any;
    createdAt: any;
}

const SESSIONS_COL = 'voice_agent_sessions';

export const ChatService = {
    // 1. Yeni sessiya yarat (Sayt açılanda)
    createSession: async (initialName: string = "Anonim Xəstə"): Promise<string> => {
        try {
            const docRef = await addDoc(collection(db, SESSIONS_COL), {
                patientName: initialName,
                lastMessage: "Söhbət başladı",
                lastMessageTime: serverTimestamp(),
                createdAt: serverTimestamp(),
                status: 'active'
            });
            return docRef.id;
        } catch (error) {
            console.error("Error creating session:", error);
            throw error;
        }
    },

    // 2. Sessiyanın adını yenilə (Məs: "Məzahir bəy" tapılanda)
    updateSessionName: async (sessionId: string, newName: string) => {
        try {
            const sessionRef = doc(db, SESSIONS_COL, sessionId);
            await updateDoc(sessionRef, { patientName: newName });
        } catch (error) {
            console.error("Error updating session name:", error);
        }
    },

    // 3. Mesaj yaz (Konkret sessiya ID-si ilə)
    saveMessage: async (sessionId: string, speaker: Speaker, text: string) => {
        if (!sessionId) return;
        try {
            // Mesajı sub-kolleksiyaya yaz
            const messagesRef = collection(db, SESSIONS_COL, sessionId, 'messages');
            await addDoc(messagesRef, {
                speaker,
                text,
                timestamp: Date.now(),
                createdAt: serverTimestamp()
            });

            // Sessiyanın "Son Mesaj"ını yenilə (Dashboard üçün)
            const sessionRef = doc(db, SESSIONS_COL, sessionId);
            await updateDoc(sessionRef, {
                lastMessage: text,
                lastMessageTime: serverTimestamp()
            });
        } catch (error) {
            console.error("Error saving message:", error);
        }
    },

    // 4. Konkret sessiyanın mesajlarını dinlə (Dashboard-da sağ tərəf üçün)
    subscribeToSessionMessages: (sessionId: string, callback: (messages: ChatMessage[]) => void) => {
        if (!sessionId) return () => { };

        const messagesRef = collection(db, SESSIONS_COL, sessionId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ChatMessage));
            callback(messages);
        });
    },

    // 5. Bütün sessiyaları dinlə (Dashboard-da SOL tərəf siyahısı üçün)
    subscribeToAllSessions: (callback: (sessions: ChatSession[]) => void) => {
        const q = query(collection(db, SESSIONS_COL), orderBy('lastMessageTime', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const sessions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ChatSession));
            callback(sessions);
        });
    },

    // 6. Sessiyanı sil
    deleteSession: async (sessionId: string) => {
        try {
            await deleteDoc(doc(db, SESSIONS_COL, sessionId));
        } catch (e) { console.error(e); }
    }
};
