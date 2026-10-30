import React, { useState } from 'react';
import {
  Users,
  Wheat,
  Tractor,
  PlusCircle,
  FileText,
  CalendarCheck2,
  User as UserIcon,
  Search,
  MapPin,
  Calendar,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Send,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Post, PostType } from '../types';
import { POPULAR_VILLAGES, DEFAULT_VILLAGE, WORK_CATEGORIES_LABOUR } from '../config/village';
import { NavTab } from '../components/BottomNav';

interface HomePageProps {
  posts: Post[];
  loadingPosts: boolean;
  onRefreshPosts: () => void;
  onOpenBookingModal: (post: Post) => void;
  onNavigateTab: (tab: NavTab) => void;
  onSelectCategoryFilter: (type: PostType) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  posts,
  loadingPosts,
  onRefreshPosts,
  onOpenBookingModal,
  onNavigateTab,
  onSelectCategoryFilter,
}) => {
  const { userProfile, currentUser } = useAuth();
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<PostType | 'all'>('all');
  const [selectedVillageFilter, setSelectedVillageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (selectedTypeFilter !== 'all' && post.postType !== selectedTypeFilter) {
      return false;
    }
    if (selectedVillageFilter !== 'all') {
      const vFilter = selectedVillageFilter.toLowerCase().split(' ')[0];
      if (!post.village.toLowerCase().includes(vFilter)) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = post.title.toLowerCase().includes(q);
      const matchAuthor = post.authorName.toLowerCase().includes(q);
      const matchCrop = post.cropName ? post.cropName.toLowerCase().includes(q) : false;
      const matchDesc = post.description ? post.description.toLowerCase().includes(q) : false;
      const matchLocation = post.location ? post.location.toLowerCase().includes(q) : false;
      const matchVillage = post.village ? post.village.toLowerCase().includes(q) : false;
      return matchTitle || matchAuthor || matchCrop || matchDesc || matchLocation || matchVillage;
    }
    return true;
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'शुभ सकाळ';
    if (hour < 17) return 'राम राम';
    return 'शुभ संध्याकाळ';
  };

  const getPostTypeBadge = (type: PostType) => {
    switch (type) {
      case 'workers_needed':
        return { label: '👷 मजूर पाहिजेत', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'work_wanted':
        return { label: '🌾 काम पाहिजे', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'tractor_service':
        return { label: '🚜 अवजारे / ट्रॅक्टर', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'bullock_service':
        return { label: '🐂 बैलजोडी सेवा', bg: 'bg-orange-100 text-orange-900 border-orange-300' };
      case 'seeds':
        return { label: '🌱 बियाणे', bg: 'bg-green-100 text-green-900 border-green-300' };
      case 'fertilizers':
        return { label: '🌾 खते', bg: 'bg-lime-100 text-lime-900 border-lime-300' };
      case 'agri_tools':
        return { label: '🛠️ कृषी साहित्य', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'agri_services':
        return { label: '🚁 कृषी सेवा', bg: 'bg-teal-100 text-teal-900 border-teal-300' };
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* 1. Greeting & AgriNex Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-full text-xs font-semibold backdrop-blur-xs border border-white/20">
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              <span>गाव: {userProfile?.village || 'सर्व गावे'}</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-extrabold tracking-wider uppercase text-emerald-200">
              AgriNex • Smart Agriculture Service Network
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              {getGreeting()},{' '}
              <span className="text-emerald-200">
                {userProfile?.name?.split(' ')[0] || 'शेतकरी मित्र'}!
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-bold text-emerald-100 mt-0.5">
              &ldquo;शेतीच्या प्रत्येक गरजेला, डिजिटल जोडणी!&rdquo;
            </p>
            <p className="text-[11px] text-emerald-100/90 leading-relaxed max-w-lg mt-1">
              शेतमजूर, शेतीची अवजारे, बियाणे व खते यांसाठी एकात्मिक डिजिटल व्यासपीठ. सशक्त शेतकरी – समृद्ध ग्रामीण भारत!
            </p>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
      </div>

      {/* 2. Six Core Categories (Per AgriNex Poster Section 3) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm font-black text-zinc-900 flex items-center gap-1.5">
              <span>🌾 AgriNex कृषी सेवा श्रेणी</span>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ६ मुख्य विभाग
              </span>
            </h3>
          </div>
          {selectedTypeFilter !== 'all' && (
            <button
              onClick={() => setSelectedTypeFilter('all')}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              सर्व दाखवा
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {/* Category 1: शेतमजूर */}
          <button
            onClick={() => {
              setSelectedTypeFilter(selectedTypeFilter === 'workers_needed' ? 'all' : 'workers_needed');
              onSelectCategoryFilter('workers_needed');
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group shadow-xs active:scale-97 ${
              selectedTypeFilter === 'workers_needed' || selectedTypeFilter === 'work_wanted'
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
                : 'bg-white border-zinc-200 hover:border-amber-400 hover:bg-amber-50/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md">
                विभाग १
              </span>
            </div>
            <div>
              <span className="text-sm font-extrabold text-zinc-900 block leading-tight">
                👷 शेतमजूर
              </span>
              <span className="text-[11px] text-zinc-500 mt-0.5 block">
                मजूर पाहिजेत / काम पाहिजे
              </span>
            </div>
          </button>

          {/* Category 2: अवजारे / यंत्रसामग्री */}
          <button
            onClick={() => {
              setSelectedTypeFilter(selectedTypeFilter === 'tractor_service' ? 'all' : 'tractor_service');
              onSelectCategoryFilter('tractor_service');
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group shadow-xs active:scale-97 ${
              selectedTypeFilter === 'tractor_service' || selectedTypeFilter === 'bullock_service'
                ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300'
                : 'bg-white border-zinc-200 hover:border-blue-400 hover:bg-blue-50/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Tractor className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded-md">
                विभाग २
              </span>
            </div>
            <div>
              <span className="text-sm font-extrabold text-zinc-900 block leading-tight">
                🚜 अवजारे / यंत्रसामग्री
              </span>
              <span className="text-[11px] text-zinc-500 mt-0.5 block">
                ट्रॅक्टर, रोटाव्हेटर, नांगर, बैलजोडी
              </span>
            </div>
          </button>

          {/* Category 3: बियाणे */}
          <button
            onClick={() => {
              setSelectedTypeFilter(selectedTypeFilter === 'seeds' ? 'all' : 'seeds');
              onSelectCategoryFilter('seeds');
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group shadow-xs active:scale-97 ${
              selectedTypeFilter === 'seeds'
                ? 'bg-green-50 border-green-400 ring-2 ring-green-300'
                : 'bg-white border-zinc-200 hover:border-green-400 hover:bg-green-50/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-500/15 text-green-800 flex items-center justify-center group-hover:scale-110 transition-transform text-lg">
                🌱
              </div>
              <span className="text-[10px] font-bold text-green-800 bg-green-100 px-1.5 py-0.5 rounded-md">
                विभाग ३
              </span>
            </div>
            <div>
              <span className="text-sm font-extrabold text-zinc-900 block leading-tight">
                🌱 बियाणे (Seeds)
              </span>
              <span className="text-[11px] text-zinc-500 mt-0.5 block">
                सोयाबीन, कापूस, भाजीपाला
              </span>
            </div>
          </button>

          {/* Category 4: खते */}
          <button
            onClick={() => {
              setSelectedTypeFilter(selectedTypeFilter === 'fertilizers' ? 'all' : 'fertilizers');
              onSelectCategoryFilter('fertilizers');
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group shadow-xs active:scale-97 ${
              selectedTypeFilter === 'fertilizers'
                ? 'bg-lime-50 border-lime-400 ring-2 ring-lime-300'
                : 'bg-white border-zinc-200 hover:border-lime-400 hover:bg-lime-50/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-lime-500/15 text-lime-800 flex items-center justify-center group-hover:scale-110 transition-transform text-lg">
                🌾
              </div>
              <span className="text-[10px] font-bold text-lime-800 bg-lime-100 px-1.5 py-0.5 rounded-md">
                विभाग ४
              </span>
            </div>
            <div>
              <span className="text-sm font-extrabold text-zinc-900 block leading-tight">
                🌾 खते (Fertilizers)
              </span>
              <span className="text-[11px] text-zinc-500 mt-0.5 block">
                सेंद्रिय खत, डीएपी, कंपोस्ट
              </span>
            </div>
          </button>

          {/* Category 5: कृषी साहित्य */}
          <button
            onClick={() => {
              setSelectedTypeFilter(selectedTypeFilter === 'agri_tools' ? 'all' : 'agri_tools');
              onSelectCategoryFilter('agri_tools');
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group shadow-xs active:scale-97 ${
              selectedTypeFilter === 'agri_tools'
                ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-300'
                : 'bg-white border-zinc-200 hover:border-purple-400 hover:bg-purple-50/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-800 flex items-center justify-center group-hover:scale-110 transition-transform text-lg">
                🛠️
              </div>
              <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded-md">
                विभाग ५
              </span>
            </div>
            <div>
              <span className="text-sm font-extrabold text-zinc-900 block leading-tight">
                🛠️ कृषी साहित्य
              </span>
              <span className="text-[11px] text-zinc-500 mt-0.5 block">
                स्प्रे पंप, ठिबक पाईप, ताडपत्री
              </span>
            </div>
          </button>

          {/* Category 6: कृषी सेवा */}
          <button
            onClick={() => {
              setSelectedTypeFilter(selectedTypeFilter === 'agri_services' ? 'all' : 'agri_services');
              onSelectCategoryFilter('agri_services');
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group shadow-xs active:scale-97 ${
              selectedTypeFilter === 'agri_services'
                ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-300'
                : 'bg-white border-zinc-200 hover:border-teal-400 hover:bg-teal-50/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-800 flex items-center justify-center group-hover:scale-110 transition-transform text-lg">
                🚁
              </div>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded-md">
                विभाग ६
              </span>
            </div>
            <div>
              <span className="text-sm font-extrabold text-zinc-900 block leading-tight">
                🚁 कृषी सेवा
              </span>
              <span className="text-[11px] text-zinc-500 mt-0.5 block">
                ड्रोन फवारणी, सॉईल टेस्ट, हार्वेस्टर
              </span>
            </div>
          </button>
        </div>
      </div>


      {/* 3. Below Buttons: Quick Shortcuts (Per Specification) */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-3 shadow-xs">
        <div className="grid grid-cols-4 gap-2 text-center">
          <button
            onClick={() => onNavigateTab('create_post')}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-emerald-50 text-zinc-700 hover:text-emerald-800 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold">नवीन पोस्ट</span>
          </button>

          <button
            onClick={() => onNavigateTab('profile')}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-emerald-50 text-zinc-700 hover:text-emerald-800 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold">माझ्या पोस्ट</span>
          </button>

          <button
            onClick={() => onNavigateTab('bookings')}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-emerald-50 text-zinc-700 hover:text-emerald-800 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold">माझ्या बुकिंग्स</span>
          </button>

          <button
            onClick={() => onNavigateTab('profile')}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-emerald-50 text-zinc-700 hover:text-emerald-800 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <UserIcon className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold">माझे प्रोफाइल</span>
          </button>
        </div>
      </div>

      {/* 4. Village Feed Header & Filter Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-base font-extrabold text-zinc-900">
              {selectedVillageFilter === 'all'
                ? `सर्व गावांतील सक्रिय पोस्ट्स (${filteredPosts.length})`
                : `${selectedVillageFilter} परिसरातील सक्रिय पोस्ट्स (${filteredPosts.length})`}
            </h3>
            <p className="text-xs text-zinc-500">
              उपलब्ध शेती सेवा व मजुरांची माहिती
            </p>
          </div>
          <button
            onClick={onRefreshPosts}
            disabled={loadingPosts}
            className="p-2 rounded-xl text-zinc-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors focus:outline-none"
            title="रिफ्रेश करा"
          >
            <RefreshCw className={`w-4 h-4 ${loadingPosts ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="काम, गाव, पीक किंवा व्यक्तीच्या नावाने शोधा..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-zinc-400 hover:text-zinc-600"
            >
              रद्द करा
            </button>
          )}
        </div>

        {/* Village Selection Filter Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-zinc-500 whitespace-nowrap mr-1">
            गाव:
          </span>
          <button
            onClick={() => setSelectedVillageFilter('all')}
            className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all border ${
              selectedVillageFilter === 'all'
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            सर्व गावे
          </button>
          {userProfile?.village && (
            <button
              onClick={() => setSelectedVillageFilter(userProfile.village.split(' ')[0])}
              className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all border ${
                selectedVillageFilter === userProfile.village.split(' ')[0]
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              📍 माझे गाव ({userProfile.village.split(' ')[0]})
            </button>
          )}
          {POPULAR_VILLAGES.slice(0, 6).map((v) => {
            const shortV = v.split(' ')[0];
            if (userProfile?.village && userProfile.village.includes(shortV)) return null;
            return (
              <button
                key={v}
                onClick={() => setSelectedVillageFilter(shortV)}
                className={`px-2.5 py-1 rounded-xl font-medium whitespace-nowrap transition-all border ${
                  selectedVillageFilter === shortV
                    ? 'bg-emerald-700 text-white border-emerald-700 font-bold shadow-xs'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {shortV}
              </button>
            );
          })}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedTypeFilter('all')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              selectedTypeFilter === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            सर्व पोस्ट्स
          </button>
          <button
            onClick={() => setSelectedTypeFilter('workers_needed')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              selectedTypeFilter === 'workers_needed'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            👷 कामगार पाहिजेत
          </button>
          <button
            onClick={() => setSelectedTypeFilter('work_wanted')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              selectedTypeFilter === 'work_wanted'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            🌾 काम पाहिजे
          </button>
          <button
            onClick={() => setSelectedTypeFilter('tractor_service')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              selectedTypeFilter === 'tractor_service'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            🚜 अवजारे / ट्रॅक्टर
          </button>
          <button
            onClick={() => setSelectedTypeFilter('bullock_service')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              selectedTypeFilter === 'bullock_service'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            🐂 बैलजोडी
          </button>
          <button
            onClick={() => setSelectedTypeFilter('seeds')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              selectedTypeFilter === 'seeds'
                ? 'bg-green-600 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            🌱 बियाणे
          </button>
          <button
            onClick={() => setSelectedTypeFilter('fertilizers')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              selectedTypeFilter === 'fertilizers'
                ? 'bg-lime-600 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            🌾 खते
          </button>
          <button
            onClick={() => setSelectedTypeFilter('agri_tools')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              selectedTypeFilter === 'agri_tools'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            🛠️ कृषी साहित्य
          </button>
          <button
            onClick={() => setSelectedTypeFilter('agri_services')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              selectedTypeFilter === 'agri_services'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            🚁 कृषी सेवा
          </button>
        </div>
      </div>

      {/* 5. Posts Feed List */}
      <div className="space-y-4">
        {loadingPosts ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500 font-medium">गावातील पोस्ट्स लोड होत आहेत...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200 p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
              <Sparkles className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-zinc-800">
              या श्रेणीत सध्या कोणतीही पोस्ट उपलब्ध नाही.
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              तुम्ही स्वतः नवीन कामाची किंवा सेवेची पोस्ट प्रसिद्ध करू शकता.
            </p>
            <button
              onClick={() => onNavigateTab('create_post')}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>नवीन पोस्ट प्रसिद्ध करा</span>
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const badge = getPostTypeBadge(post.postType);
            const isOwnPost = currentUser?.uid === post.authorId;
            const isFilled = post.status === 'filled';

            return (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-xs hover:shadow-md transition-shadow space-y-3 relative overflow-hidden"
              >
                {/* Header Tag and Rate */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                    <h4 className="text-base font-extrabold text-zinc-900 leading-snug">
                      {post.title}
                    </h4>
                  </div>

                  {/* Rate highlight */}
                  <div className="text-right shrink-0 bg-emerald-50 px-3 py-1.5 rounded-2xl border border-emerald-200">
                    <span className="text-base font-black text-emerald-800">
                      ₹{post.rate}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">
                      /{post.rateType}
                    </span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 pt-1">
                  {post.workDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>तारीख: <strong>{post.workDate}</strong></span>
                    </div>
                  )}

                  {post.workTime && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>वेळ: {post.workTime}</span>
                    </div>
                  )}

                  {post.cropName && (
                    <div className="flex items-center gap-1.5">
                      <Wheat className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>पीक: <strong>{post.cropName}</strong></span>
                    </div>
                  )}

                  {post.location && (
                    <div className="flex items-center gap-1.5 col-span-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">ठिकाण: {post.location}</span>
                    </div>
                  )}
                </div>

                {/* Multi-worker progress bar if applicable */}
                {post.postType === 'workers_needed' && post.requiredWorkers && (
                  <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-amber-950">
                      <span>आवश्यक मजूर: {post.requiredWorkers}</span>
                      <span>
                        स्वीकारले: {post.acceptedWorkersCount || 0}/{post.requiredWorkers}
                      </span>
                    </div>
                    <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (((post.acceptedWorkersCount || 0) / post.requiredWorkers) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Description if present */}
                {post.description && (
                  <p className="text-xs text-zinc-600 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 leading-relaxed">
                    {post.description}
                  </p>
                )}

                {/* Author Info & Booking Action */}
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                      {post.authorName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">
                        {post.authorName}
                      </p>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <span>{post.village}</span>
                        <span>•</span>
                        <span className="text-amber-600 font-bold flex items-center">
                          <Star className="w-2.5 h-2.5 fill-amber-500 mr-0.5" />
                          ४.९
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Booking CTA */}
                  {isOwnPost ? (
                    <span className="px-3 py-1.5 bg-zinc-100 text-zinc-600 text-xs font-semibold rounded-xl border border-zinc-200">
                      तुमची स्वतःची पोस्ट
                    </span>
                  ) : isFilled ? (
                    <span className="px-3 py-1.5 bg-zinc-100 text-zinc-500 text-xs font-semibold rounded-xl border border-zinc-200">
                      जागा पूर्ण भरल्या
                    </span>
                  ) : (
                    <button
                      onClick={() => onOpenBookingModal(post)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>विनंती पाठवा</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
