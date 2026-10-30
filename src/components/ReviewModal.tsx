import React, { useState } from 'react';
import { X, Star, ThumbsUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { reviewService } from '../services/reviewService';

interface ReviewModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [workQuality, setWorkQuality] = useState<string>('उत्कृष्ट (Excellent)');
  const [punctuality, setPunctuality] = useState<string>('अगदी वेळेवर (On Time)');
  const [behavior, setBehavior] = useState<string>('अतिशय नम्र व आदरयुक्त (Respectful)');
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen || !booking || !currentUser) return null;

  const isPoster = booking.posterId === currentUser.uid;
  const targetUserId = isPoster ? booking.requesterId : booking.posterId;
  const targetUserName = isPoster ? booking.requesterName || 'मजूर/सेवा प्रदाता' : booking.posterName || 'शेतकरी';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await reviewService.submitReview({
        bookingId: booking.id,
        reviewerId: currentUser.uid,
        reviewerName: userProfile?.name || 'गावातील नागरिक',
        targetUserId,
        rating,
        workQuality,
        punctuality,
        behavior,
        comment: comment.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'रिव्ह्यू सेव्ह करताना अडचण आली.');
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
            <h2 className="text-lg font-bold">काम पूर्ण झाले — रेटिंग व अभिप्राय द्या</h2>
            <p className="text-xs text-emerald-100">
              {targetUserName} यांच्या कामाबद्दलचा तुमचा अनुभव
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
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>तुमचे रेटिंग व अभिप्राय यशस्वीरीत्या जतन झाले! धन्यवाद.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1-5 Star Rating */}
            <div className="text-center py-2 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <label className="block text-xs font-semibold text-zinc-700 mb-2">
                एकूण अनुभव (स्टार निवडा)
              </label>
              <div className="flex items-center justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform active:scale-125"
                  >
                    <Star
                      className={`w-9 h-9 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                          : 'text-zinc-300 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold text-amber-700 mt-1">
                {rating === 5 && '🌟 ५ स्टार - उत्कृष्ट'}
                {rating === 4 && '👍 ४ स्टार - खूप चांगले'}
                {rating === 3 && '👌 ३ स्टार - समाधानकारक'}
                {rating === 2 && '⚠️ २ स्टार - सुधारणा आवश्यक'}
                {rating === 1 && '❌ १ स्टार - असमाधानकारक'}
              </p>
            </div>

            {/* कामाचा दर्जा (Work Quality) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                १. कामाचा दर्जा (Work Quality)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'उत्कृष्ट (Excellent)',
                  'खूप चांगले (Good)',
                  'मध्यम (Average)',
                  'असमाधानकारक (Poor)',
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setWorkQuality(opt)}
                    className={`py-2 px-3 text-xs rounded-xl border font-medium text-left transition-all ${
                      workQuality === opt
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* वेळेवर उपस्थिती (Punctuality) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                २. वेळेवर उपस्थिती (Punctuality)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  'अगदी वेळेवर (On Time)',
                  'थोडा उशीर (Slight Delay)',
                  'खूप उशीर (Late)',
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setPunctuality(opt)}
                    className={`py-2 px-2.5 text-[11px] rounded-xl border font-medium text-center transition-all ${
                      punctuality === opt
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* वागणूक (Behavior) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                ३. वागणूक व संवाद (Behavior)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  'अतिशय नम्र व आदरयुक्त',
                  'चांगली व सहकार्यपूर्ण',
                  'सामान्य',
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setBehavior(opt)}
                    className={`py-2 px-2 text-[11px] rounded-xl border font-medium text-center transition-all ${
                      behavior === opt
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* संक्षिप्त टिप्पणी (Comment) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                तुमचे मत किंवा अनुभव (ऐच्छिक)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="उदा. खूप मेहनती व प्रामाणिक काम केले, वेळेची शिस्त पाळली..."
                rows={2}
                maxLength={400}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Submit */}
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
                  <>
                    <ThumbsUp className="w-4 h-4" />
                    <span>रिव्ह्यू सबमिट करा</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
