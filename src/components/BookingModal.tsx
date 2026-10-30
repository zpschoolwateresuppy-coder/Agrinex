import React, { useState } from 'react';
import { X, Calendar, DollarSign, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';

interface BookingModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  post,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { userProfile, currentUser } = useAuth();
  const [workDate, setWorkDate] = useState<string>(
    post?.workDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [requestedWorkersCount, setRequestedWorkersCount] = useState<number>(1);
  const [agreedRate, setAgreedRate] = useState<number>(post?.rate || 300);
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile) {
      setError('कृपया विनंती पाठवण्यासाठी प्रथम लॉगिन करा.');
      return;
    }

    if (post.authorId === currentUser.uid) {
      setError('तुम्ही तुमच्या स्वतःच्या पोस्टसाठी विनंती करू शकत नाही.');
      return;
    }

    if (!workDate) {
      setError('कृपया कामाची तारीख निवडा.');
      return;
    }

    if (!agreedRate || agreedRate <= 0) {
      setError('कृपया मजुरी / दर भरा.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await bookingService.createBooking({
        postId: post.id,
        postTitle: post.title,
        postType: post.postType,
        posterId: post.authorId,
        posterName: post.authorName,
        posterPhone: post.authorPhone,
        requesterId: currentUser.uid,
        requesterName: userProfile.name,
        requesterPhone: userProfile.phone,
        village: post.village,
        workDate,
        agreedRate: Number(agreedRate),
        rateType: post.rateType,
        requestedWorkersCount: Number(requestedWorkersCount),
        note: note.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'विनंती पाठवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="bg-emerald-700 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">बुकिंग विनंती पाठवा</h2>
            <p className="text-xs text-emerald-100">
              {post.authorName} यांच्या सेवेसाठी विनंती
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-100 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Post Summary Box */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5">
            <h3 className="font-semibold text-emerald-950 text-sm">{post.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-emerald-800">
              <span className="bg-white px-2.5 py-1 rounded-md border border-emerald-200 font-semibold text-emerald-700">
                दर: ₹{post.rate} / {post.rateType}
              </span>
              {post.cropName && (
                <span className="bg-white px-2 py-1 rounded-md border border-emerald-200">
                  पीक: {post.cropName}
                </span>
              )}
              {post.location && (
                <span className="bg-white px-2 py-1 rounded-md border border-emerald-200">
                  ठिकाण: {post.location}
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>तुमची विनंती यशस्वीरीत्या पाठवली गेली आहे!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Work Date */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                कामाची तारीख <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={workDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setWorkDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <Calendar className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* If Workers Needed or Work Wanted, allow worker count */}
            {(post.postType === 'workers_needed' || post.postType === 'work_wanted') && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {post.postType === 'workers_needed' ? 'तुम्ही किती मजूर पुरवू शकता?' : 'तुम्हाला किती मजूर पाहिजेत?'}
                </label>
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={requestedWorkersCount}
                      onChange={(e) => setRequestedWorkersCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <Users className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 5, 10].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setRequestedWorkersCount(num)}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border ${
                          requestedWorkersCount === num
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Agreed Rate */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                मान्य केलेला दर (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  value={agreedRate}
                  onChange={(e) => setAgreedRate(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-semibold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <DollarSign className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                प्रकार: {post.rateType} (दोन्ही पक्षांच्या संमतीने ठरलेला दर)
              </p>
            </div>

            {/* Optional Note */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                शेताचा पत्ता किंवा अतिरिक्त निरोप (ऐच्छिक)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="उदा. पिण्याच्या पाण्याची सोय आहे, सकाळी ७ वाजता शेतात पोहोचणे आवश्यक आहे..."
                rows={2}
                maxLength={300}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Note about contact info privacy */}
            <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              💡 टीप: समोरील व्यक्तीने ही विनंती <strong>स्वीकारल्यानंतर</strong> दोघांनाही एकमेकांचा मोबाईल नंबर थेट संभाषणासाठी दिसेल.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 px-4 border border-zinc-300 text-zinc-700 font-semibold rounded-xl text-sm hover:bg-zinc-100 transition-colors"
              >
                रद्द करा
              </button>
              <button
                type="submit"
                disabled={loading || success}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'विनंती पाठवा'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
