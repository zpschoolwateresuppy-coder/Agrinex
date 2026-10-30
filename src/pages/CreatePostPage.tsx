import React, { useState } from 'react';
import {
  Users,
  Wheat,
  Tractor,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Post, PostType, RateType } from '../types';
import {
  POPULAR_VILLAGES,
  DEFAULT_VILLAGE,
  WORK_CATEGORIES_LABOUR,
  TRACTOR_EQUIPMENT_CATEGORIES,
  BULLOCK_WORK_CATEGORIES,
  SEEDS_CATEGORIES,
  FERTILIZERS_CATEGORIES,
  AGRI_TOOLS_CATEGORIES,
  AGRI_SERVICES_CATEGORIES,
  CROPS_LIST,
  RATE_TYPES,
} from '../config/village';
import { postService } from '../services/postService';

interface CreatePostPageProps {
  initialType?: PostType;
  onPostCreated: () => void;
  onCancel: () => void;
}

export const CreatePostPage: React.FC<CreatePostPageProps> = ({
  initialType = 'workers_needed',
  onPostCreated,
  onCancel,
}) => {
  const { userProfile, currentUser } = useAuth();
  const [postType, setPostType] = useState<PostType>(initialType);

  // Common Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(WORK_CATEGORIES_LABOUR[0]);
  const [rate, setRate] = useState<number | ''>(350);
  const [rateType, setRateType] = useState<RateType>('प्रतिदिन');
  const [postVillage, setPostVillage] = useState(userProfile?.village || DEFAULT_VILLAGE);
  const [workDate, setWorkDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [workTime, setWorkTime] = useState('सकाळी ८:०० ते दुपारी २:००');
  const [duration, setDuration] = useState('१ दिवस');
  const [location, setLocation] = useState('शेतात / शिवारात');
  const [description, setDescription] = useState('');

  // Specific: Workers Needed
  const [requiredWorkers, setRequiredWorkers] = useState<number>(5);
  const [cropName, setCropName] = useState(CROPS_LIST[0]);

  // Specific: Work Wanted
  const [isGroup, setIsGroup] = useState<boolean>(false);
  const [groupCount, setGroupCount] = useState<number>(1);
  const [experience, setExperience] = useState('५ वर्षांचा अनुभव');

  // Specific: Tractor, Equipment, Seeds, Tools
  const [equipmentDetails, setEquipmentDetails] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Switch defaults when changing post type
  const handleTypeChange = (type: PostType) => {
    setPostType(type);
    setError(null);
    if (type === 'workers_needed') {
      setTitle('कापूस वेचणीसाठी ५ मजूर पाहिजेत');
      setCategory(WORK_CATEGORIES_LABOUR[2]);
      setRate(350);
      setRateType('प्रतिदिन');
    } else if (type === 'work_wanted') {
      setTitle('निंदण व शेतीकामासाठी मजूर उपलब्ध');
      setCategory(WORK_CATEGORIES_LABOUR[1]);
      setRate(300);
      setRateType('प्रतिदिन');
    } else if (type === 'tractor_service') {
      setTitle('महिंद्रा ४५ HP ट्रॅक्टर + रोटाव्हेटर नांगरणी');
      setCategory(TRACTOR_EQUIPMENT_CATEGORIES[0]);
      setRate(900);
      setRateType('प्रतितास');
    } else if (type === 'bullock_service') {
      setTitle('पेरणी व वखरणीसाठी बैलजोडी उपलब्ध');
      setCategory(BULLOCK_WORK_CATEGORIES[1]);
      setRate(1200);
      setRateType('प्रतिदिन');
    } else if (type === 'seeds') {
      setTitle('महाबीज प्रमाणित सोयाबीन बियाणे उपलब्ध');
      setCategory(SEEDS_CATEGORIES[0]);
      setRate(3200);
      setRateType('प्रति बॅग');
    } else if (type === 'fertilizers') {
      setTitle('सेंद्रिय गांडूळ खत व निंबोळी पेंड उपलब्ध');
      setCategory(FERTILIZERS_CATEGORIES[0]);
      setRate(350);
      setRateType('प्रति बॅग');
    } else if (type === 'agri_tools') {
      setTitle('१६ लिटर बॅटरी स्प्रे पंप विक्री व स्पेअर्स');
      setCategory(AGRI_TOOLS_CATEGORIES[0]);
      setRate(1800);
      setRateType('प्रति नग');
    } else if (type === 'agri_services') {
      setTitle('अचूक ड्रोन फवारणी सेवा - प्रति एकर जलद फवारणी');
      setCategory(AGRI_SERVICES_CATEGORIES[0]);
      setRate(450);
      setRateType('प्रतिएकर');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('कृपया पोस्ट करण्यासाठी प्रथम लॉगिन करा.');
      return;
    }

    if (!title.trim() || title.trim().length < 3) {
      setError('कृपया पोस्टचे शीर्षक व्यवस्थित टाका.');
      return;
    }

    if (!rate || Number(rate) <= 0) {
      setError('कृपया मजुरी किंवा सेवेचा योग्य दर टाका.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const authorName = userProfile?.name?.trim() || currentUser.displayName || 'गावातील शेतकरी';
      const authorPhone = userProfile?.phone?.trim() || currentUser.phoneNumber?.replace(/\D/g, '') || '';
      const effectiveVillage = postVillage.trim() || userProfile?.village?.trim() || DEFAULT_VILLAGE;

      const postPayload: any = {
        authorId: currentUser.uid,
        authorName,
        village: effectiveVillage,
        postType,
        title: title.trim(),
        category,
        rate: Number(rate),
        rateType,
        location: location.trim() || 'शेतात / शिवारात',
        status: 'active',
      };

      if (authorPhone) {
        postPayload.authorPhone = authorPhone;
      }
      if (workDate) {
        postPayload.workDate = workDate;
      }
      if (description.trim()) {
        postPayload.description = description.trim();
      }

      if (postType === 'workers_needed') {
        postPayload.requiredWorkers = Math.max(1, Number(requiredWorkers) || 1);
        if (cropName.trim()) postPayload.cropName = cropName.trim();
        if (workTime.trim()) postPayload.workTime = workTime.trim();
        if (duration.trim()) postPayload.duration = duration.trim();
      } else if (postType === 'work_wanted') {
        postPayload.isGroup = !!isGroup;
        postPayload.groupCount = isGroup ? Math.max(1, Number(groupCount) || 1) : 1;
        if (experience.trim()) postPayload.experience = experience.trim();
      } else {
        if (equipmentDetails.trim()) {
          postPayload.equipmentDetails = equipmentDetails.trim();
        }
      }

      await postService.createPost(postPayload);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onPostCreated();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'पोस्ट सेव्ह करताना अडचण आली.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24">
      {/* Title */}
      <div className="bg-emerald-800 text-white rounded-3xl p-5 shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">नवीन शेती पोस्ट तयार करा</h2>
          <p className="text-xs text-emerald-200 mt-0.5">
            गावातील शेतकरी व मजुरांपर्यंत तुमची मागणी किंवा सेवा पोहोचवा
          </p>
        </div>
      </div>

      {/* Select Post Type: AgriNex Categories */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-4 shadow-xs space-y-2">
        <label className="block text-xs font-bold text-zinc-700 flex items-center justify-between">
          <span>पोस्टचा प्रकार / सेवा श्रेणी निवडा:</span>
          <span className="text-[11px] font-semibold text-emerald-700">कृषी सेवा श्रेणी</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* 1. कामगार पाहिजेत */}
          <button
            type="button"
            onClick={() => handleTypeChange('workers_needed')}
            className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2 transition-all ${
              postType === 'workers_needed'
                ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold ring-2 ring-amber-300'
                : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs block leading-tight font-bold">मजूर पाहिजेत</span>
              <span className="text-[10px] text-zinc-500 block truncate">शेतकऱ्यांसाठी</span>
            </div>
          </button>

          {/* 2. काम पाहिजे */}
          <button
            type="button"
            onClick={() => handleTypeChange('work_wanted')}
            className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2 transition-all ${
              postType === 'work_wanted'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-2 ring-emerald-300'
                : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0">
              <Wheat className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs block leading-tight font-bold">काम पाहिजे</span>
              <span className="text-[10px] text-zinc-500 block truncate">मजुरांसाठी</span>
            </div>
          </button>

          {/* 3. ट्रॅक्टर व अवजारे */}
          <button
            type="button"
            onClick={() => handleTypeChange('tractor_service')}
            className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2 transition-all ${
              postType === 'tractor_service'
                ? 'bg-blue-50 border-blue-400 text-blue-950 font-bold ring-2 ring-blue-300'
                : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-700 flex items-center justify-center shrink-0">
              <Tractor className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs block leading-tight font-bold">ट्रॅक्टर व अवजारे</span>
              <span className="text-[10px] text-zinc-500 block truncate">यंत्रणा मालक</span>
            </div>
          </button>

          {/* 4. बैलजोडी सेवा */}
          <button
            type="button"
            onClick={() => handleTypeChange('bullock_service')}
            className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2 transition-all ${
              postType === 'bullock_service'
                ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold ring-2 ring-orange-300'
                : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-700 flex items-center justify-center shrink-0 text-base">
              🐂
            </div>
            <div className="min-w-0">
              <span className="text-xs block leading-tight font-bold">बैलजोडी सेवा</span>
              <span className="text-[10px] text-zinc-500 block truncate">पारंपारिक</span>
            </div>
          </button>

          {/* 5. बियाणे */}
          <button
            type="button"
            onClick={() => handleTypeChange('seeds')}
            className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2 transition-all ${
              postType === 'seeds'
                ? 'bg-green-50 border-green-400 text-green-950 font-bold ring-2 ring-green-300'
                : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-green-500/20 text-green-700 flex items-center justify-center shrink-0 text-base">
              🌱
            </div>
            <div className="min-w-0">
              <span className="text-xs block leading-tight font-bold">बियाणे</span>
              <span className="text-[10px] text-zinc-500 block truncate">शेतकरी / केंद्र</span>
            </div>
          </button>

          {/* 6. खते */}
          <button
            type="button"
            onClick={() => handleTypeChange('fertilizers')}
            className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2 transition-all ${
              postType === 'fertilizers'
                ? 'bg-lime-50 border-lime-400 text-lime-950 font-bold ring-2 ring-lime-300'
                : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-lime-500/20 text-lime-700 flex items-center justify-center shrink-0 text-base">
              🌾
            </div>
            <div className="min-w-0">
              <span className="text-xs block leading-tight font-bold">खते</span>
              <span className="text-[10px] text-zinc-500 block truncate">सेंद्रिय / रासायनिक</span>
            </div>
          </button>

          {/* 7. कृषी साहित्य */}
          <button
            type="button"
            onClick={() => handleTypeChange('agri_tools')}
            className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2 transition-all ${
              postType === 'agri_tools'
                ? 'bg-purple-50 border-purple-400 text-purple-950 font-bold ring-2 ring-purple-300'
                : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-700 flex items-center justify-center shrink-0 text-base">
              🛠️
            </div>
            <div className="min-w-0">
              <span className="text-xs block leading-tight font-bold">कृषी साहित्य</span>
              <span className="text-[10px] text-zinc-500 block truncate">स्प्रे पंप, ड्रिप</span>
            </div>
          </button>

          {/* 8. कृषी सेवा */}
          <button
            type="button"
            onClick={() => handleTypeChange('agri_services')}
            className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2 transition-all ${
              postType === 'agri_services'
                ? 'bg-teal-50 border-teal-400 text-teal-950 font-bold ring-2 ring-teal-300'
                : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-700 flex items-center justify-center shrink-0 text-base">
              🚁
            </div>
            <div className="min-w-0">
              <span className="text-xs block leading-tight font-bold">कृषी सेवा</span>
              <span className="text-[10px] text-zinc-500 block truncate">ड्रोन, टेस्टिंग</span>
            </div>
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-xs space-y-4">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>तुमची पोस्ट यशस्वीरीत्या प्रसिद्ध झाली आहे!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Post Title */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              पोस्टचे शीर्षक / कामाचे नाव <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="उदा. कापूस वेचणीसाठी ५ मजूर पाहिजेत"
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          {/* Dynamic Fields per Type */}

          {/* 1. WORKERS NEEDED FORM */}
          {postType === 'workers_needed' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Work Category */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    कामाचा प्रकार <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {WORK_CATEGORIES_LABOUR.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Crop Name */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    पिकाचे नाव (ऐच्छिक)
                  </label>
                  <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {CROPS_LIST.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Number of Workers needed */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  किती मजूर पाहिजेत? <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-zinc-300 rounded-2xl overflow-hidden bg-zinc-50">
                    <button
                      type="button"
                      onClick={() => setRequiredWorkers(Math.max(1, requiredWorkers - 1))}
                      className="px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="px-5 py-2.5 font-bold text-sm text-zinc-900 min-w-[50px] text-center">
                      {requiredWorkers}
                    </span>
                    <button
                      type="button"
                      onClick={() => setRequiredWorkers(requiredWorkers + 1)}
                      className="px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex space-x-1">
                    {[2, 5, 10, 15, 20].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setRequiredWorkers(num)}
                        className={`px-2.5 py-1.5 text-xs rounded-xl border ${
                          requiredWorkers === num
                            ? 'bg-amber-600 text-white border-amber-600 font-bold'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timing and Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    कामाची वेळ
                  </label>
                  <input
                    type="text"
                    value={workTime}
                    onChange={(e) => setWorkTime(e.target.value)}
                    placeholder="उदा. सकाळी ८:०० ते दुपारी २:००"
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    कामाचा कालावधी
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="उदा. २ दिवस किंवा १ आठवडा"
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* 2. WORK WANTED FORM */}
          {postType === 'work_wanted' && (
            <>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  कोणती कामे करता येतात? <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {WORK_CATEGORIES_LABOUR.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Individual vs Group */}
              <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200 space-y-2">
                <label className="block text-xs font-bold text-zinc-800">
                  मजुरांचे स्वरूप:
                </label>
                <div className="flex space-x-3">
                  <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      checked={!isGroup}
                      onChange={() => setIsGroup(false)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>वैयक्तिक मजूर (मी एकटाच आहे)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      checked={isGroup}
                      onChange={() => setIsGroup(true)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>मजुरांचा गट (गटप्रमुख)</span>
                  </label>
                </div>

                {isGroup && (
                  <div className="pt-2 flex items-center space-x-3">
                    <label className="text-xs font-bold text-zinc-700">
                      गटातील एकूण मजूर संख्या:
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={50}
                      value={groupCount}
                      onChange={(e) => setGroupCount(Number(e.target.value))}
                      className="w-24 px-3 py-1.5 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-center"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  अनुभव व विशेष कौशल्य (ऐच्छिक)
                </label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="उदा. कापूस वेचणी व निंदण कामाचा १० वर्षांचा अनुभव"
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* 3. TRACTOR SERVICE FORM */}
          {postType === 'tractor_service' && (
            <>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  उपलब्ध उपकरण / अवजार प्रकार <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {TRACTOR_EQUIPMENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  ट्रॅक्टर व अवजारांचे मॉडेल / तपशील
                </label>
                <input
                  type="text"
                  value={equipmentDetails}
                  onChange={(e) => setEquipmentDetails(e.target.value)}
                  placeholder="उदा. महिंद्रा ४७५ DI (४२ HP), शक्तीमान ७ फूट रोटाव्हेटर"
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* 4. BULLOCK SERVICE FORM */}
          {postType === 'bullock_service' && (
            <>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  कोणते काम करता येते? <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {BULLOCK_WORK_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  अवजारांची माहिती (तिफण, पाभर, नांगर इत्यादी)
                </label>
                <input
                  type="text"
                  value={equipmentDetails}
                  onChange={(e) => setEquipmentDetails(e.target.value)}
                  placeholder="उदा. खिलार बैलजोडी, लाकडी नांगर, तिफण व वखर सोबत उपलब्ध"
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* 5. SEEDS FORM */}
          {postType === 'seeds' && (
            <>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  बियाण्याचा प्रकार / वाण <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {SEEDS_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  बियाण्याचे वाण / कंपनी / उपलब्ध साठा
                </label>
                <input
                  type="text"
                  value={equipmentDetails}
                  onChange={(e) => setEquipmentDetails(e.target.value)}
                  placeholder="उदा. महाबीज प्रमाणित JS-335, ३० किलोची बॅग, १०० बॅग उपलब्ध"
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* 6. FERTILIZERS FORM */}
          {postType === 'fertilizers' && (
            <>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  खताचा प्रकार <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {FERTILIZERS_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  खताचा दर्जा / पॅकिंग / डिलिव्हरी तपशील
                </label>
                <input
                  type="text"
                  value={equipmentDetails}
                  onChange={(e) => setEquipmentDetails(e.target.value)}
                  placeholder="उदा. १ वर्ष जुने गांडूळ खत, ५० किलो पोते, ट्रॅक्टर ट्रॉलीने थेट शेतात डिलिव्हरी उपलब्ध"
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* 7. AGRI TOOLS FORM */}
          {postType === 'agri_tools' && (
            <>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  कृषी साहित्याचा प्रकार <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {AGRI_TOOLS_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  ब्रँड / वॉरंटी / उपकरण तपशील
                </label>
                <input
                  type="text"
                  value={equipmentDetails}
                  onChange={(e) => setEquipmentDetails(e.target.value)}
                  placeholder="उदा. १६ लिटर ड्युअल मोटर बॅटरी पंप, ६ महिने वॉरंटी व स्पेअर पार्ट उपलब्ध"
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* 8. AGRI SERVICES FORM */}
          {postType === 'agri_services' && (
            <>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  कृषी सेवेचा प्रकार <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {AGRI_SERVICES_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  तंत्रज्ञान / मशिनरी / सेवा तपशील
                </label>
                <input
                  type="text"
                  value={equipmentDetails}
                  onChange={(e) => setEquipmentDetails(e.target.value)}
                  placeholder="उदा. १० लिटर शेती ड्रोन, प्रति एकर १० मिनिटांत अचूक फवारणी, ऑपरेटरसह"
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Common: Rate and Rate Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                दर / मजुरी (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  value={rate}
                  onChange={(e) => setRate(e.target.value ? Number(e.target.value) : '')}
                  placeholder="उदा. ३५०"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <DollarSign className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                दराचा प्रकार <span className="text-red-500">*</span>
              </label>
              <select
                value={rateType}
                onChange={(e) => setRateType(e.target.value as RateType)}
                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {RATE_TYPES.map((rt) => (
                  <option key={rt} value={rt}>{rt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Common: Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                उपलब्ध / कामाची तारीख <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={workDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setWorkDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <Calendar className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                गावाचे नाव <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={postVillage}
                  onChange={(e) => setPostVillage(e.target.value)}
                  placeholder="उदा. दोंदुडा, वडगाव, राहुरी..."
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs font-bold text-zinc-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
              </div>
              <div className="mt-1 flex flex-wrap gap-1 items-center">
                <span className="text-[10px] text-zinc-400">सुचवलेली:</span>
                {POPULAR_VILLAGES.slice(0, 4).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setPostVillage(v.split(' ')[0])}
                    className={`text-[10px] px-2 py-0.5 rounded-md border ${
                      postVillage === v.split(' ')[0]
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
                शेताचे ठिकाण / शिवार
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="उदा. गावठाण, गट नं. १२, कालव्याजवळ..."
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              अतिरिक्त माहिती व नियम (ऐच्छिक)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="उदा. पिण्याचे पाणी व चहाची सोय आहे. मजुरांनी सकाळी वेळेवर पोहोचावे..."
              rows={2}
              maxLength={450}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-3 px-4 border border-zinc-300 text-zinc-700 font-bold rounded-2xl text-sm hover:bg-zinc-100 transition-colors"
            >
              रद्द करा
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm shadow-md transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'पोस्ट प्रसिद्ध करा'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
