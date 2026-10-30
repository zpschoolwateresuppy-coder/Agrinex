import React, { useState } from 'react';
import {
  CalendarCheck2,
  Clock,
  Phone,
  CheckCircle2,
  XCircle,
  Play,
  Award,
  Star,
  AlertCircle,
  MapPin,
  RefreshCw,
  Users,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Booking, BookingStatus } from '../types';
import { bookingService } from '../services/bookingService';

interface BookingsPageProps {
  bookingsAsRequester: Booking[];
  bookingsAsPoster: Booking[];
  loading: boolean;
  onRefresh: () => void;
  onOpenReviewModal: (booking: Booking) => void;
}

export const BookingsPage: React.FC<BookingsPageProps> = ({
  bookingsAsRequester,
  bookingsAsPoster,
  loading,
  onRefresh,
  onOpenReviewModal,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Confirmation Modal state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    bookingId: string;
    newStatus: BookingStatus;
    title: string;
    message: string;
    confirmText: string;
    danger?: boolean;
  } | null>(null);

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'प्रलंबित (Pending)', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'accepted':
        return { label: 'स्वीकारली (Accepted)', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'rejected':
        return { label: 'नाकारली (Rejected)', bg: 'bg-rose-100 text-rose-900 border-rose-300' };
      case 'cancelled':
        return { label: 'रद्द (Cancelled)', bg: 'bg-zinc-100 text-zinc-700 border-zinc-300' };
      case 'in_progress':
        return { label: 'काम सुरू (In Progress)', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'completed':
        return { label: 'काम पूर्ण (Completed)', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
    }
  };

  const handleExecuteStatusChange = async () => {
    if (!confirmDialog || !currentUser) return;
    const { bookingId, newStatus } = confirmDialog;
    setActionLoading(bookingId);
    setErrorMessage(null);
    setConfirmDialog(null);

    try {
      await bookingService.updateBookingStatus(bookingId, newStatus, currentUser.uid);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err?.message || 'स्थिती बदलताना अडचण आली.');
    } finally {
      setActionLoading(null);
    }
  };

  const currentBookings = activeTab === 'received' ? bookingsAsPoster : bookingsAsRequester;

  return (
    <div className="space-y-5 pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-emerald-800 text-white rounded-3xl p-5 shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">शेती सेवा बुकिंग्ज</h2>
          <p className="text-xs text-emerald-200 mt-0.5">
            तुमच्या शेती कामांच्या व सेवांच्या सर्व विनंत्यांचा ताळेबंद
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
          title="रिफ्रेश करा"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1 bg-zinc-200/80 rounded-2xl">
        <button
          onClick={() => setActiveTab('received')}
          className={`py-3 text-xs sm:text-sm font-bold rounded-xl transition-all relative ${
            activeTab === 'received'
              ? 'bg-white text-emerald-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <span>१. माझ्या पोस्टवरील विनंत्या ({bookingsAsPoster.length})</span>
          {bookingsAsPoster.some((b) => b.status === 'pending') && (
            <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-2 right-2 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`py-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === 'sent'
              ? 'bg-white text-emerald-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <span>२. मी मागवलेल्या सेवा ({bookingsAsRequester.length})</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500 font-medium">बुकिंग्ज लोड होत आहेत...</p>
          </div>
        ) : currentBookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200 p-10 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
              <CalendarCheck2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-zinc-800">
              {activeTab === 'received'
                ? 'तुमच्या पोस्टवर अजून कोणतीही विनंती आलेली नाही.'
                : 'तुम्ही अजून कोणालाही बुकिंग विनंती पाठवलेली नाही.'}
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {activeTab === 'received'
                ? 'नवीन पोस्ट तयार करा जेणेकरून गावातील शेतकरी व मजूर तुम्हाला संपर्क करू शकतील.'
                : 'होम स्क्रीनवरील पोस्ट्स पाहून "विनंती पाठवा" बटणावर क्लिक करा.'}
            </p>
          </div>
        ) : (
          currentBookings.map((b) => {
            const badge = getStatusBadge(b.status);
            const isPoster = b.posterId === currentUser?.uid;
            const otherPartyName = isPoster ? b.requesterName : b.posterName;
            const otherPartyPhone = isPoster ? b.requesterPhone : b.posterPhone;
            const canViewPhone = ['accepted', 'in_progress', 'completed'].includes(b.status);
            const hasUserRated = isPoster ? b.hasPosterRated : b.hasRequesterRated;

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-xs space-y-3.5 relative overflow-hidden"
              >
                {/* Header status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                    <h4 className="text-base font-extrabold text-zinc-900">
                      {b.postTitle || 'शेती सेवा'}
                    </h4>
                  </div>

                  <div className="text-right bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 shrink-0">
                    <span className="text-xs font-bold text-emerald-900 block">
                      ठरलेला दर
                    </span>
                    <span className="text-sm font-black text-emerald-700">
                      ₹{b.agreedRate} /{b.rateType || 'काम'}
                    </span>
                  </div>
                </div>

                {/* Details summary */}
                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 bg-zinc-50/70 p-3 rounded-2xl border border-zinc-100">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>तारीख: <strong>{b.workDate || 'तातडीने'}</strong></span>
                  </div>
                  {b.requestedWorkersCount && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>संख्या: <strong>{b.requestedWorkersCount} मजूर</strong></span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>गाव: {b.village}</span>
                  </div>
                </div>

                {/* Note if provided */}
                {b.note && (
                  <p className="text-xs text-zinc-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200 italic">
                    निरोप: "{b.note}"
                  </p>
                )}

                {/* Participant card & direct phone contact */}
                <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="text-zinc-400 block text-[10px]">
                      {isPoster ? 'विनंती करणारी व्यक्ती:' : 'सेवा देणारे शेतकरी/मालक:'}
                    </span>
                    <span className="font-bold text-zinc-900 text-sm">
                      {otherPartyName || 'गावातील नागरिक'}
                    </span>
                  </div>

                  {canViewPhone && otherPartyPhone ? (
                    <a
                      href={`tel:${otherPartyPhone}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{otherPartyPhone} वर कॉल करा</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-lg">
                      🔒 स्वीकार झाल्यावर नंबर दिसेल
                    </span>
                  )}
                </div>

                {/* Status Action Buttons */}
                <div className="pt-2 flex flex-wrap gap-2 justify-end">
                  {/* Poster Actions on Pending */}
                  {isPoster && b.status === 'pending' && (
                    <>
                      <button
                        onClick={() =>
                          setConfirmDialog({
                            isOpen: true,
                            bookingId: b.id,
                            newStatus: 'rejected',
                            title: 'विनंती नाकारावी का?',
                            message: 'तुम्ही ही विनंती नाकारू इच्छिता का? समोरील व्यक्तीला याची सूचना दिली जाईल.',
                            confirmText: 'हो, नाकारा',
                            danger: true,
                          })
                        }
                        disabled={actionLoading === b.id}
                        className="px-3.5 py-2 border border-rose-300 text-rose-700 font-bold rounded-xl text-xs hover:bg-rose-50 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>नकार द्या</span>
                      </button>

                      <button
                        onClick={() =>
                          setConfirmDialog({
                            isOpen: true,
                            bookingId: b.id,
                            newStatus: 'accepted',
                            title: 'विनंती स्वीकार करावी का?',
                            message: `तुम्ही ${otherPartyName} यांची विनंती स्वीकारू इच्छिता का? यानंतर तुमचा फोन नंबर त्यांना दिसेल.`,
                            confirmText: 'हो, स्वीकार करा',
                          })
                        }
                        disabled={actionLoading === b.id}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>स्वीकार करा</span>
                      </button>
                    </>
                  )}

                  {/* Requester Actions on Pending */}
                  {!isPoster && b.status === 'pending' && (
                    <button
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          bookingId: b.id,
                          newStatus: 'cancelled',
                          title: 'विनंती रद्द करावी का?',
                          message: 'तुम्ही पाठवलेली विनंती रद्द करू इच्छिता का?',
                          confirmText: 'हो, रद्द करा',
                          danger: true,
                        })
                      }
                      disabled={actionLoading === b.id}
                      className="px-3.5 py-2 border border-zinc-300 text-zinc-700 font-semibold rounded-xl text-xs hover:bg-zinc-100 transition-colors"
                    >
                      विनंती रद्द करा
                    </button>
                  )}

                  {/* Start Work Action on Accepted */}
                  {b.status === 'accepted' && (
                    <>
                      <button
                        onClick={() =>
                          setConfirmDialog({
                            isOpen: true,
                            bookingId: b.id,
                            newStatus: 'in_progress',
                            title: 'कामास सुरुवात झाली आहे का?',
                            message: 'काम सुरू झाल्याची नोंद करायची आहे का?',
                            confirmText: 'हो, काम सुरू झाले',
                          })
                        }
                        disabled={actionLoading === b.id}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>काम सुरू झाले</span>
                      </button>
                    </>
                  )}

                  {/* Mark Completed on In Progress */}
                  {b.status === 'in_progress' && (
                    <button
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          bookingId: b.id,
                          newStatus: 'completed',
                          title: 'काम पूर्ण झाल्याची खात्री करा',
                          message: 'काम यशस्वीरीत्या पूर्ण झाले आहे का? यानंतर दोघांनाही एकमेकांना रेटिंग देता येईल.',
                          confirmText: 'हो, काम पूर्ण झाले',
                        })
                      }
                      disabled={actionLoading === b.id}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>काम पूर्ण झाले ✔</span>
                    </button>
                  )}

                  {/* Give Rating on Completed */}
                  {b.status === 'completed' && (
                    <>
                      {hasUserRated ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>तुम्ही रेटिंग दिली आहे</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onOpenReviewModal(b)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>रेटिंग व अभिप्राय द्या</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Dialog Modal */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-extrabold text-zinc-900">
              {confirmDialog.title}
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-2.5 px-4 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-100"
              >
                रद्द करा
              </button>
              <button
                type="button"
                onClick={handleExecuteStatusChange}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-sm transition-all ${
                  confirmDialog.danger
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
