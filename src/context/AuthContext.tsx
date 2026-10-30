import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, formatMobileToAuthEmail, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';
import { DEFAULT_VILLAGE } from '../config/village';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  loginWithPhone: (phone: string, pass: string) => Promise<void>;
  registerWithPhone: (data: {
    name: string;
    phone: string;
    village: string;
    password: string;
    confirmPassword: string;
    occupation?: string;
  }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
  // Quick test persona helper for testing profiles
  switchTestPersona: (persona: 'farmer' | 'labourer' | 'tractor' | 'bullock' | 'shopkeeper') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const TEST_PERSONAS = [
  {
    key: 'farmer' as const,
    name: 'ज्ञानेश्वर कदम (शेतकरी)',
    phone: '9822011223',
    village: DEFAULT_VILLAGE,
    occupation: 'शेतकरी',
    badge: '🌾 शेतकरी',
  },
  {
    key: 'labourer' as const,
    name: 'तानाजी जाधव (मजूर गटप्रमुख)',
    phone: '9850022334',
    village: DEFAULT_VILLAGE,
    occupation: 'मजूर (गटप्रमुख)',
    badge: '👷 मजूर',
  },
  {
    key: 'tractor' as const,
    name: 'बाळासाहेब पाटील (ट्रॅक्टर मालक)',
    phone: '9881033445',
    village: DEFAULT_VILLAGE,
    occupation: 'ट्रॅक्टर व अवजारे मालक',
    badge: '🚜 अवजारे मालक',
  },
  {
    key: 'shopkeeper' as const,
    name: 'विनायक देशमुख (कृषी सेवा केंद्र)',
    phone: '9860055667',
    village: DEFAULT_VILLAGE,
    occupation: 'कृषी दुकानदार',
    badge: '🏪 कृषी दुकानदार',
  },
  {
    key: 'bullock' as const,
    name: 'तुकाराम शिंदे (बैलजोडी मालक)',
    phone: '9890044556',
    village: DEFAULT_VILLAGE,
    occupation: 'बैलजोडी सेवा',
    badge: '🐂 बैलजोडी मालक',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setUserProfile(data);
        return data;
      }
      return null;
    } catch (err) {
      console.warn('Profile fetch notice:', err);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const translateAuthError = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      return 'मोबाईल नंबर किंवा पासवर्ड चुकीचा आहे. कृपया पुन्हा तपासा.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'हा मोबाईल नंबर आधीच नोंदणीकृत आहे. कृपया लॉगिन करा.';
    }
    if (code === 'auth/weak-password') {
      return 'पासवर्ड किमान ६ अक्षरांचा असावा.';
    }
    if (code === 'auth/invalid-email') {
      return 'कृपया वैध १० अंकी मोबाईल नंबर टाका.';
    }
    if (code === 'auth/too-many-requests') {
      return 'अनेक अयशस्वी प्रयत्नांमुळे खाते तात्पुरते थांबवले आहे. कृपया थोड्या वेळाने प्रयत्न करा.';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'Firebase ऑथेंटिकेशनमध्ये ईमेल/पासवर्ड पर्याय सुरू करणे आवश्यक आहे. कृपया Firebase Console तपासा.';
    }
    return err?.message || 'लॉगिन किंवा नोंदणी करताना अडचण आली. कृपया पुन्हा प्रयत्न करा.';
  };

  const loginWithPhone = async (phone: string, pass: string) => {
    setError(null);
    const cleaned = phone.trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      throw new Error('कृपया १० अंकी वैध भारतीय मोबाईल नंबर टाका (६, ७, ८, किंवा ९ ने सुरू होणारा).');
    }
    if (!pass || pass.length < 6) {
      throw new Error('पासवर्ड किमान ६ अक्षरांचा असावा.');
    }

    const emailIdentity = formatMobileToAuthEmail(cleaned);
    try {
      const cred = await signInWithEmailAndPassword(auth, emailIdentity, pass);
      await fetchProfile(cred.user.uid);
    } catch (err: any) {
      const msg = translateAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const registerWithPhone = async (data: {
    name: string;
    phone: string;
    village: string;
    password: string;
    confirmPassword: string;
    occupation?: string;
  }) => {
    setError(null);
    if (!data.name.trim() || data.name.trim().length < 2) {
      throw new Error('कृपया आपले पूर्ण नाव टाका (किमान २ अक्षरे).');
    }
    const cleaned = data.phone.trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      throw new Error('कृपया १० अंकी वैध भारतीय मोबाईल नंबर टाका (उदा. 9822xxxxxx).');
    }
    if (!data.village.trim() || data.village.trim().length < 2) {
      throw new Error('कृपया आपल्या गावाचे नाव टाका (किमान २ अक्षरे).');
    }
    if (!data.password || data.password.length < 6) {
      throw new Error('पासवर्ड किमान ६ अक्षरांचा असावा.');
    }
    if (data.password !== data.confirmPassword) {
      throw new Error('दोन्ही पासवर्ड जुळत नाहीत. कृपया पुन्हा तपासा.');
    }

    const emailIdentity = formatMobileToAuthEmail(cleaned);

    try {
      // Create user securely via Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, emailIdentity, data.password);
      
      const newProfile: UserProfile = {
        id: cred.user.uid,
        name: data.name.trim(),
        phone: cleaned,
        village: data.village.trim(),
        occupation: data.occupation || 'शेतकरी',
        rating: 5.0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store profile in Firestore
      try {
        await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      } catch (fErr) {
        handleFirestoreError(fErr, OperationType.WRITE, `users/${cred.user.uid}`);
      }

      // Per requirement: "After successful registration, redirect the user to the Login page."
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (err: any) {
      const msg = translateAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const profile = await fetchProfile(cred.user.uid);
      if (!profile) {
        const newProfile: UserProfile = {
          id: cred.user.uid,
          name: cred.user.displayName || 'गावातील शेतकरी',
          phone: cred.user.phoneNumber?.replace(/\D/g, '') || '98' + Math.floor(10000000 + Math.random() * 90000000),
          village: DEFAULT_VILLAGE,
          occupation: 'शेतकरी',
          rating: 5.0,
          reviewCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        try {
          await setDoc(doc(db, 'users', cred.user.uid), newProfile);
          setUserProfile(newProfile);
        } catch (fErr) {
          handleFirestoreError(fErr, OperationType.WRITE, `users/${cred.user.uid}`);
        }
      }
    } catch (err: any) {
      const msg = translateAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    setError(null);
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchProfile(currentUser.uid);
    }
  };

  const clearError = () => setError(null);

  const switchTestPersona = async (
    personaKey: 'farmer' | 'labourer' | 'tractor' | 'bullock' | 'shopkeeper'
  ) => {
    const target = TEST_PERSONAS.find((p) => p.key === personaKey);
    if (!target) return;
    const defaultPass = 'shetmitra123';
    const emailIdentity = formatMobileToAuthEmail(target.phone);

    try {
      try {
        await signInWithEmailAndPassword(auth, emailIdentity, defaultPass);
      } catch (loginErr: any) {
        // If account doesn't exist yet, automatically register test account
        const cred = await createUserWithEmailAndPassword(auth, emailIdentity, defaultPass);
        const newProfile: UserProfile = {
          id: cred.user.uid,
          name: target.name,
          phone: target.phone,
          village: target.village,
          occupation: target.occupation,
          rating: 4.8,
          reviewCount: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', cred.user.uid), newProfile);
        setUserProfile(newProfile);
      }
    } catch (err: any) {
      console.error('Persona switch error:', err);
      const msg = translateAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        error,
        loginWithPhone,
        registerWithPhone,
        loginWithGoogle,
        logout,
        refreshProfile,
        clearError,
        switchTestPersona,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
