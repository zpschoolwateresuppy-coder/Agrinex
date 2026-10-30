import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav, NavTab } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { CreatePostPage } from './pages/CreatePostPage';
import { BookingsPage } from './pages/BookingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import { BookingModal } from './components/BookingModal';
import { ReviewModal } from './components/ReviewModal';
import { NotificationsModal } from './components/NotificationsModal';
import { Post, Booking, AppNotification, PostType } from './types';
import { postService } from './services/postService';
import { bookingService } from './services/bookingService';
import { notificationService } from './services/notificationService';
import { DEFAULT_VILLAGE } from './config/village';

function MainApp() {
  const { currentUser, userProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Posts State
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [createPostInitialType, setCreatePostInitialType] = useState<PostType>('workers_needed');

  // Bookings State
  const [bookingsAsRequester, setBookingsAsRequester] = useState<Booking[]>([]);
  const [bookingsAsPoster, setBookingsAsPoster] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Modals
  const [bookingModalPost, setBookingModalPost] = useState<Post | null>(null);
  const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(null);

  // Fetch posts across all villages
  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const data = await postService.getVillagePosts();
      setPosts(data);

      // If empty and current user is present, seed initial authentic posts
      if (data.length === 0 && currentUser && userProfile) {
        await postService.seedVillagePostsIfEmpty(
          currentUser.uid,
          userProfile.name,
          userProfile.phone
        );
        const seeded = await postService.getVillagePosts();
        setPosts(seeded);
      }
    } catch (err) {
      console.warn('Error loading village posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  }, [currentUser, userProfile]);

  // Fetch bookings
  const loadBookings = useCallback(async () => {
    if (!currentUser) return;
    setLoadingBookings(true);
    try {
      const { asRequester, asPoster } = await bookingService.getUserBookings(currentUser.uid);
      setBookingsAsRequester(asRequester);
      setBookingsAsPoster(asPoster);
    } catch (err) {
      console.warn('Error loading bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  }, [currentUser]);

  // Fetch notifications
  const loadNotifications = useCallback(async () => {
    if (!currentUser) return;
    try {
      const notifs = await notificationService.getUserNotifications(currentUser.uid);
      setNotifications(notifs);
    } catch (err) {
      console.warn('Error loading notifications:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadPosts();
      loadBookings();
      loadNotifications();
    }
  }, [currentUser, loadPosts, loadBookings, loadNotifications]);

  const handleMarkNotificationRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleSelectCategoryFilter = (type: PostType) => {
    // When clicking one of the four big buttons, optionally open create post or filter
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-black text-emerald-950 flex items-center gap-1.5">
          <span>🌿</span>
          <span>AgriNex सुरू होत आहे...</span>
        </h2>
        <p className="text-xs font-semibold text-emerald-800 mt-1">Smart Agriculture Service Network</p>
        <p className="text-[11px] text-emerald-700 mt-0.5">शेतीच्या प्रत्येक गरजेला, डिजिटल जोडणी!</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pendingRequestsCount = bookingsAsPoster.filter((b) => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col text-zinc-900 font-sans selection:bg-emerald-200">
      {/* Top Navbar */}
      <Navbar
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onNavigateHome={() => setActiveTab('home')}
        onNavigateProfile={() => setActiveTab('profile')}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 pt-4">
        {activeTab === 'home' && (
          <HomePage
            posts={posts}
            loadingPosts={loadingPosts}
            onRefreshPosts={loadPosts}
            onOpenBookingModal={(p) => setBookingModalPost(p)}
            onNavigateTab={(tab) => {
              if (tab === 'create_post') setCreatePostInitialType('workers_needed');
              setActiveTab(tab);
            }}
            onSelectCategoryFilter={(type) => {
              setCreatePostInitialType(type);
            }}
          />
        )}

        {activeTab === 'create_post' && (
          <CreatePostPage
            initialType={createPostInitialType}
            onPostCreated={() => {
              loadPosts();
              setActiveTab('home');
            }}
            onCancel={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'bookings' && (
          <BookingsPage
            bookingsAsRequester={bookingsAsRequester}
            bookingsAsPoster={bookingsAsPoster}
            loading={loadingBookings}
            onRefresh={loadBookings}
            onOpenReviewModal={(b) => setReviewModalBooking(b)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            onNavigateToCreatePost={() => setActiveTab('create_post')}
            onNavigateToBookings={() => setActiveTab('bookings')}
          />
        )}
      </main>

      {/* Mobile-First Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'create_post') setCreatePostInitialType('workers_needed');
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        pendingBookingsCount={pendingRequestsCount}
      />

      {/* Booking Request Modal */}
      <BookingModal
        post={bookingModalPost}
        isOpen={Boolean(bookingModalPost)}
        onClose={() => setBookingModalPost(null)}
        onSuccess={() => {
          loadBookings();
          setActiveTab('bookings');
        }}
      />

      {/* Review Modal */}
      <ReviewModal
        booking={reviewModalBooking}
        isOpen={Boolean(reviewModalBooking)}
        onClose={() => setReviewModalBooking(null)}
        onSuccess={() => {
          loadBookings();
        }}
      />

      {/* Notifications Tray Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onNavigateToBookings={() => setActiveTab('bookings')}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
