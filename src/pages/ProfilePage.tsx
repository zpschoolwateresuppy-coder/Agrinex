import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  MapPin,
  Star,
  Trash2,
  LogOut,
  FileText,
  MessageSquareQuote,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Calendar,
} from 'lucide-react';
import { useAuth, TEST_PERSONAS } from '../context/AuthContext';
import { Post, Review } from '../types';
import { postService } from '../services/postService';
import { reviewService } from '../services/reviewService';
import { POPULAR_VILLAGES, DEFAULT_VILLAGE } from '../config/village';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface ProfilePageProps {
  onNavigateToCreatePost: () => void;
  onNavigateToBookings: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onNavigateToCreatePost,
  onNavigateToBookings,
}) => {
  const { userProfile, currentUser, logout, refreshProfile, switchTestPersona } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'reviews' | 'edit'>('posts');

  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Edit Profile form state
  const [editName, setEditName] = useState(userProfile?.name || '');
  const [editVillage, setEditVillage] = useState(userProfile?.village || DEFAULT_VILLAGE);
  const [editOccupation, setEditOccupation] = useState(userProfile?.occupation || 'शेतकरी');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Confirm delete post modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deletingPost, setDeletingPost] = useState(false);

  // Confirm logout modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const loadUserData = async () => {
    if (!currentUser) return;
    setLoadingData(true);
    try {
      const [posts, reviews] = await Promise.all([
        postService.getUserPosts(currentUser.uid),
        reviewService.getUserReviews(currentUser.uid),
      ]);
      setMyPosts(posts);
      setMyReviews(reviews);
    } catch (err) {
      console.warn('Error loading user profile data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadUserData();
    if (userProfile) {
      setEditName(userProfile.name);
      setEditVillage(userProfile.village || DEFAULT_VILLAGE);
      setEditOccupation(userProfile.occupation || 'शेतकरी');
    }
  }, [currentUser, userProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!editName.trim() || editName.trim().length < 2) {
      setProfileError('कृपया वैध नाव टाका (किमान २ अक्षरे).');
      return;
    }
    if (!editVillage.trim() || editVillage.trim().length < 2) {
      setProfileError('कृपया गावाचे नाव टाका (किमान २ अक्षरे).');
      return;
    }

    setSavingProfile(true);
    setProfileError(null);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        name: editName.trim(),
        village: editVillage.trim(),
        occupation: editOccupation.trim(),
        updatedAt: new Date().toISOString(),
      });
      await refreshProfile();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 2000);
    } catch (err: any) {
      setProfileError(err?.message || 'प्रोफाइल अपडेट करताना त्रुटी आली.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeletePost = async () => {
    if (!deleteTargetId) return;
    setDeletingPost(true);
    try {
      await postService.deletePost(deleteTargetId);
      setMyPosts((prev) => prev.filter((p) => p.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err: any) {
      alert('पोस्ट हटवताना अडचण आली: ' + (err?.message || 'Unknown error'));
    } finally {
      setDeletingPost(false);
    }
  };

  return (
    <div className="space-y-5 pb-24 max-w-2xl mx-auto">
      {/* 1. Profile Summary Card */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-emerald-600/20">
              {userProfile?.name?.charAt(0) || <User className="w-8 h-8" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900 leading-snug">
                {userProfile?.name || 'वापरकर्ता'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-zinc-500 font-medium">
                <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                  <Briefcase className="w-3 h-3 text-emerald-600" />
                  {userProfile?.occupation || 'शेतकरी'}
                </span>
                <span className="flex items-center gap-1 text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  {userProfile?.village || DEFAULT_VILLAGE}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2.5 rounded-2xl text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors focus:outline-none"
            title="लॉगआउट"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Rating and Contact bar */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-100 text-xs">
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center space-x-2.5">
            <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-400 block font-semibold">मोबाईल नंबर</span>
              <span className="font-bold text-zinc-800 truncate">{userProfile?.phone}</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/70 flex items-center space-x-2.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-amber-800 block font-semibold">गावातील रेटिंग</span>
              <span className="font-extrabold text-amber-950">
                {userProfile?.rating?.toFixed(1) || '५.०'} ({userProfile?.reviewCount || 0} रिव्ह्यू)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tabs */}
      <div className="grid grid-cols-3 p-1 bg-zinc-200/80 rounded-2xl">
        <button
          onClick={() => setActiveSubTab('posts')}
          className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'posts'
              ? 'bg-white text-emerald-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          माझ्या पोस्ट ({myPosts.length})
        </button>

        <button
          onClick={() => setActiveSubTab('reviews')}
          className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'reviews'
              ? 'bg-white text-emerald-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          मिळालेले रिव्ह्यू ({myReviews.length})
        </button>

        <button
          onClick={() => setActiveSubTab('edit')}
          className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'edit'
              ? 'bg-white text-emerald-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          माहिती बदला
        </button>
      </div>

      {/* 3. Sub-Tab Content */}

      {/* TAB: MY POSTS */}
      {activeSubTab === 'posts' && (
        <div className="space-y-3">
          {loadingData ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : myPosts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-zinc-200 p-8 text-center space-y-3">
              <FileText className="w-10 h-10 text-zinc-300 mx-auto" />
              <p className="text-xs font-bold text-zinc-700">तुम्ही अजून एकही पोस्ट प्रसिद्ध केलेली नाही.</p>
              <button
                onClick={onNavigateToCreatePost}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700"
              >
                + नवीन पोस्ट तयार करा
              </button>
            </div>
          ) : (
            myPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-zinc-200 p-4 shadow-xs space-y-2 relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {post.village}
                    </span>
                    <h4 className="text-sm font-extrabold text-zinc-900 mt-1">{post.title}</h4>
                    <p className="text-xs text-emerald-700 font-bold mt-0.5">
                      दर: ₹{post.rate} /{post.rateType}
                    </p>
                  </div>

                  <button
                    onClick={() => setDeleteTargetId(post.id)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                    title="पोस्ट हटवा"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    तारीख: {post.workDate || 'तातडीने'}
                  </span>
                  <span className="font-semibold text-emerald-700">
                    स्थिती: {post.status === 'active' ? 'सक्रिय' : 'पूर्ण / भरले'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: REVIEWS */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-3">
          {loadingData ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : myReviews.length === 0 ? (
            <div className="bg-white rounded-3xl border border-zinc-200 p-8 text-center space-y-2">
              <MessageSquareQuote className="w-10 h-10 text-zinc-300 mx-auto" />
              <p className="text-xs font-bold text-zinc-700">अजून कोणताही अभिप्राय प्राप्त झालेला नाही.</p>
              <p className="text-[11px] text-zinc-400">
                काम पूर्ण झाल्यावर सहभागी शेतकरी व मजूर तुम्हाला येथे रेटिंग देतील.
              </p>
            </div>
          ) : (
            myReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-3xl border border-zinc-200 p-4 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      {rev.reviewerName?.charAt(0) || 'ग'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-900 block">
                        {rev.reviewerName}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('mr-IN') : ''}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center space-x-0.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-xs font-bold text-amber-900">{rev.rating}</span>
                  </div>
                </div>

                {/* Badges for criteria */}
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {rev.workQuality && (
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
                      दर्जा: {rev.workQuality}
                    </span>
                  )}
                  {rev.punctuality && (
                    <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200 font-medium">
                      वेळ: {rev.punctuality}
                    </span>
                  )}
                  {rev.behavior && (
                    <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded-md border border-purple-200 font-medium">
                      वागणूक: {rev.behavior}
                    </span>
                  )}
                </div>

                {rev.comment && (
                  <p className="text-xs text-zinc-600 bg-zinc-50 p-2 rounded-xl italic">
                    "{rev.comment}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: EDIT PROFILE */}
      {activeSubTab === 'edit' && (
        <div className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900">वैयक्तिक माहिती अद्ययावत करा</h3>

          {profileSuccess && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>प्रोफाइल यशस्वीरीत्या जतन झाले!</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                पूर्ण नाव
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                मोबाईल नंबर (बदलता येत नाही)
              </label>
              <input
                type="text"
                value={userProfile?.phone || ''}
                readOnly
                className="w-full px-4 py-2.5 bg-zinc-100 border border-zinc-300 rounded-xl text-xs text-zinc-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                गावाचे नाव
              </label>
              <input
                type="text"
                value={editVillage}
                onChange={(e) => setEditVillage(e.target.value)}
                placeholder="उदा. दोंदुडा, वडगाव, राहुरी..."
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
              <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                <span className="text-[10px] text-zinc-400">सुचवलेली:</span>
                {POPULAR_VILLAGES.slice(0, 5).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setEditVillage(v.split(' ')[0])}
                    className={`text-[10px] px-2 py-0.5 rounded-md border ${
                      editVillage === v.split(' ')[0]
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border-zinc-200'
                    }`}
                  >
                    {v.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                मुख्य काम / व्यवसाय
              </label>
              <select
                value={editOccupation}
                onChange={(e) => setEditOccupation(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="शेतकरी">🌾 शेतकरी</option>
                <option value="मजूर">👷 शेतमजूर / गटप्रमुख</option>
                <option value="ट्रॅक्टर मालक">🚜 ट्रॅक्टर व अवजारे मालक</option>
                <option value="कृषी दुकानदार">🏪 कृषी दुकानदार</option>
                <option value="बैलजोडी मालक">🐂 बैलजोडी सेवा</option>
                <option value="इतर">इतर कृषी सेवा</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-98 disabled:opacity-50"
            >
              {savingProfile ? 'जतन होत आहे...' : 'माहिती जतन करा'}
            </button>
          </form>
        </div>
      )}

      {/* Switch Persona for Testing Poster Personas */}
      <div className="bg-emerald-50/70 rounded-3xl border border-emerald-200 p-4 space-y-2">
        <h4 className="text-xs font-bold text-emerald-950">
          🔄 इतर वापरकर्ता खात्यात स्विच करा (चाचणीसाठी):
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TEST_PERSONAS.map((tp) => (
            <button
              key={tp.key}
              onClick={() => switchTestPersona(tp.key)}
              className="p-2 bg-white text-zinc-800 border border-emerald-200 rounded-xl text-[11px] font-semibold hover:bg-emerald-100/70 transition-colors text-left truncate"
            >
              {tp.badge}
            </button>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-zinc-900">
              पोस्ट हटवायची खात्री करा
            </h3>
            <p className="text-xs text-zinc-600">
              तुम्ही ही पोस्ट कायमस्वरूपी हटवू इच्छिता का? ही क्रिया पूर्ववत करता येणार नाही.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2.5 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-100"
              >
                रद्द करा
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={deletingPost}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm"
              >
                {deletingPost ? 'हटवत आहे...' : 'हो, हटवा'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-zinc-900">
              लॉगआउट करावे का?
            </h3>
            <p className="text-xs text-zinc-600">
              तुम्ही AgriNex ॲपमधून बाहेर पडू इच्छिता का? नंतर पुन्हा मोबाईल नंबर व पासवर्डने लॉगिन करता येईल.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-100"
              >
                रद्द करा
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm"
              >
                हो, लॉगआउट करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
