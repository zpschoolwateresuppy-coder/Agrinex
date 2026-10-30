import React, { useState } from 'react';
import {
  Sprout,
  Phone,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Tractor,
  Users,
  Wheat,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth, TEST_PERSONAS } from '../context/AuthContext';
import { POPULAR_VILLAGES, DEFAULT_VILLAGE } from '../config/village';

export const AuthPage: React.FC = () => {
  const { loginWithPhone, registerWithPhone, loginWithGoogle, switchTestPersona } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState(DEFAULT_VILLAGE);
  const [occupation, setOccupation] = useState('शेतकरी');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const FIREBASE_CONSOLE_AUTH_URL =
    'https://console.firebase.google.com/project/fiery-reach-38gvj/authentication/providers';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(FIREBASE_CONSOLE_AUTH_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setLocalError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setLocalError(err?.message || 'Google द्वारे लॉगिन करताना अडचण आली.');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaClick = async (key: 'farmer' | 'labourer' | 'tractor' | 'bullock' | 'shopkeeper') => {
    setLoading(true);
    setLocalError(null);
    try {
      await switchTestPersona(key);
    } catch (err: any) {
      setLocalError(err?.message || 'चाचणी खात्यात लॉगिन करताना अडचण आली.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    // Form Validations
    if (!name.trim()) {
      setLocalError('कृपया आपले पूर्ण नाव टाका.');
      return;
    }
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setLocalError('कृपया १० अंकी वैध भारतीय मोबाईल नंबर टाका (उदा. 9822123456).');
      return;
    }
    if (!village.trim() || village.trim().length < 2) {
      setLocalError('कृपया आपल्या गावाचे नाव टाका (किमान २ अक्षरे).');
      return;
    }
    if (!password || password.length < 6) {
      setLocalError('पासवर्ड किमान ६ अक्षरांचा असावा.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('दोन्ही पासवर्ड एकमेकांशी जुळत नाहीत.');
      return;
    }

    setLoading(true);
    try {
      await registerWithPhone({
        name: name.trim(),
        phone: cleanPhone,
        village,
        occupation,
        password,
        confirmPassword,
      });

      // Per requirement: Redirect to Login page after successful registration
      setSuccessMessage('नोंदणी यशस्वी झाली आहे! आता खालील फॉर्ममध्ये लॉगिन करा.');
      setIsRegister(false);
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setLocalError(err?.message || 'नोंदणी अयशस्वी झाली.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setLocalError('कृपया १० अंकी वैध मोबाईल नंबर टाका.');
      return;
    }
    if (!password) {
      setLocalError('कृपया पासवर्ड टाका.');
      return;
    }

    setLoading(true);
    try {
      await loginWithPhone(cleanPhone, password);
    } catch (err: any) {
      setLocalError(err?.message || 'लॉगिन अयशस्वी झाले. कृपया मोबाईल नंबर व पासवर्ड तपासा.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-emerald-100/40 flex flex-col justify-center px-4 py-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-700 to-teal-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-emerald-700/25 text-white border-2 border-white/50">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="text-3xl font-black text-emerald-950 tracking-tight flex items-center justify-center gap-1.5">
            AgriNex
          </h1>
          <p className="text-xs uppercase font-extrabold tracking-wider text-emerald-800">
            Smart Agriculture Service Network
          </p>
          <p className="text-sm font-bold text-emerald-700">
            &ldquo;शेतीच्या प्रत्येक गरजेला, डिजिटल जोडणी!&rdquo;
          </p>
          <p className="text-xs text-zinc-600 max-w-xs mx-auto">
            शेतमजूर, शेतीची अवजारे, बियाणे व खते यांसाठी एकात्मिक डिजिटल व्यासपीठ
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-6 space-y-5">
          {/* Toggle Tabs */}
          <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setLocalError(null);
              }}
              className={`py-2.5 text-sm font-bold rounded-xl transition-all ${
                !isRegister
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              लॉगिन करा
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setLocalError(null);
              }}
              className={`py-2.5 text-sm font-bold rounded-xl transition-all ${
                isRegister
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              नवीन नोंदणी
            </button>
          </div>

          {/* Feedback messages */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {localError && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">नोंदणी / लॉगिन त्रुटी</p>
                  <p className="leading-relaxed">{localError}</p>
                </div>
              </div>

              {/* Special interactive guide for Firebase Email/Password enable */}
              {(localError.includes('Firebase') ||
                localError.includes('ईमेल/पासवर्ड') ||
                localError.includes('Console')) && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-950 space-y-3 text-xs shadow-xs">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <span>⚙️</span>
                    <span>Firebase मध्ये १-वेळ सेटिंग (फक्त ३० सेकंद):</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    नवीन मोबाईल नंबरने थेट पासवर्ड नोंदणीसाठी Firebase Console मध्ये{' '}
                    <strong className="text-amber-950">Email/Password Provider</strong> सुरू करणे
                    आवश्यक असते.
                  </p>

                  <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1.5 font-medium text-amber-900">
                    <p className="font-bold text-amber-950">सोप्या ३ पायऱ्या:</p>
                    <p>१. खालील निळ्या बटणावर क्लिक करून Firebase Console उघडा.</p>
                    <p>
                      २. <strong>Email/Password</strong> पर्यायावर क्लिक करून{' '}
                      <strong>Enable</strong> करा.
                    </p>
                    <p>
                      ३. <strong>Save</strong> दाबा. त्यानंतर ॲपमध्ये येऊन पुन्हा नोंदणी किंवा लॉगिन
                      करा.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <a
                      href={FIREBASE_CONSOLE_AUTH_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-center flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Firebase Console उघडा</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="py-2.5 px-3 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>लिंक कॉपी झाली!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>लिंक कॉपी करा</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Immediate alternative: Google login */}
                  <div className="pt-2 border-t border-amber-200 text-center">
                    <p className="text-[11px] text-amber-800 font-medium mb-2">
                      किंवा कोणत्याही सेटिंगशिवाय तात्काळ Google द्वारे ॲपमध्ये प्रवेश करा:
                    </p>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full py-2.5 px-4 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Google द्वारे त्वरित सुरू करा</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Registration Form */}
          {isRegister ? (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  १. पूर्ण नाव <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="उदा. ज्ञानेश्वर विठ्ठल कदम"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-300 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* 2. Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  २. मोबाईल नंबर <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="उदा. 9822123456"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-300 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                    required
                  />
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  १० अंकी भारतीय मोबाईल नंबर (हाच तुमचा वापरकर्ता आयडी असेल).
                </p>
              </div>

              {/* 3. Village Name (Custom / Editable) */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  ३. गावाचे नाव <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="उदा. दोंदुडा, वडगाव, राहुरी, बारामती..."
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-300 rounded-2xl text-sm font-semibold text-zinc-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                  <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
                </div>
                {/* Popular village suggestions */}
                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-zinc-500 font-medium">सुचवलेली गावे:</span>
                  {POPULAR_VILLAGES.slice(0, 6).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVillage(v.split(' ')[0])}
                      className={`text-[11px] px-2.5 py-0.5 rounded-lg border transition-all ${
                        village === v.split(' ')[0] || village === v
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      {v.split(' ')[0]}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  तुम्ही महाराष्ट्रातील कोणत्याही गावाचे नाव येथे लिहू शकता.
                </p>
              </div>

              {/* Occupation selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  ४. आपली मुख्य भूमिका / वर्ग (पोस्टरनुसार ४ मुख्य घटक)
                </label>
                <select
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3 py-3 bg-zinc-50 border border-zinc-300 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                >
                  <option value="शेतकरी">🌾 शेतकरी (मजूर, अवजारे व साहित्य शोधण्यासाठी)</option>
                  <option value="मजूर">👷 शेतमजूर (कामाच्या संधी मिळवण्यासाठी)</option>
                  <option value="ट्रॅक्टर मालक">🚜 अवजारे / यंत्रसामग्री मालक (अवजारे भाड्याने देण्यासाठी)</option>
                  <option value="कृषी दुकानदार">🏪 कृषी दुकानदार (बियाणे, खते, साहित्य विक्रीसाठी)</option>
                  <option value="बैलजोडी मालक">🐂 बैलजोडी सेवा प्रदाता</option>
                  <option value="इतर">इतर कृषी सेवा</option>
                </select>
              </div>

              {/* 4. Password */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  ५. पासवर्ड <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="किमान ६ अक्षरे/अंक"
                    className="w-full pl-10 pr-10 py-3 bg-zinc-50 border border-zinc-300 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 5. Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  ६. पासवर्ड पुन्हा टाका <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="तोच पासवर्ड पुन्हा भरा"
                    className="w-full pl-10 pr-10 py-3 bg-zinc-50 border border-zinc-300 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'रजिस्ट्रेशन करा'
                )}
              </button>

              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200" />
                </div>
                <span className="relative px-3 bg-white text-[11px] font-semibold text-zinc-400 uppercase">
                  किंवा
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-300 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-xs transition-all active:scale-98"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google खात्याने थेट नोंदणी करा</span>
              </button>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  मोबाईल नंबर <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="उदा. 9822123456"
                    className="w-full pl-10 pr-4 py-3.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                    required
                  />
                  <Phone className="w-5 h-5 text-zinc-400 absolute left-3.5 top-4" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  पासवर्ड <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="आपला पासवर्ड टाका"
                    className="w-full pl-10 pr-10 py-3.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                  <Lock className="w-5 h-5 text-zinc-400 absolute left-3.5 top-4" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-4 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'लॉगिन करा'
                )}
              </button>

              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200" />
                </div>
                <span className="relative px-3 bg-white text-[11px] font-semibold text-zinc-400 uppercase">
                  किंवा
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-300 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-xs transition-all active:scale-98"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google खात्याने थेट लॉगिन करा</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setLocalError(null);
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                >
                  नवीन वापरकर्ता आहात? रजिस्ट्रेशन करा
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 1-Click Role Persona Testing Switcher */}
        <div className="bg-white/90 backdrop-blur-xs rounded-2xl border border-emerald-100 p-4 space-y-2.5 text-center shadow-sm">
          <p className="text-xs font-bold text-emerald-950 flex items-center justify-center gap-1.5">
            <span>⚡ AgriNex ४ मुख्य भूमिका (१-क्लिक चाचणी):</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TEST_PERSONAS.map((tp) => (
              <button
                key={tp.key}
                disabled={loading}
                onClick={() => handlePersonaClick(tp.key)}
                className="p-2.5 bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 text-left disabled:opacity-50"
              >
                {tp.key === 'farmer' && <Wheat className="w-4 h-4 text-emerald-700 shrink-0" />}
                {tp.key === 'labourer' && <Users className="w-4 h-4 text-emerald-700 shrink-0" />}
                {tp.key === 'tractor' && <Tractor className="w-4 h-4 text-emerald-700 shrink-0" />}
                {tp.key === 'shopkeeper' && <span className="text-sm shrink-0">🏪</span>}
                {tp.key === 'bullock' && <span className="text-sm shrink-0">🐂</span>}
                <span className="truncate">{tp.badge}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-zinc-500">
            मुख्य घटक: शेतकरी, शेतमजूर, अवजारे मालक, कृषी दुकानदार.
          </p>
        </div>
      </div>
    </div>
  );
};
