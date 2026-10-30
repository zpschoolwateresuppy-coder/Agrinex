import React from 'react';
import { Sprout, Bell, User as UserIcon, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onNavigateProfile: () => void;
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNotifications,
  unreadNotificationsCount,
  onNavigateProfile,
  onNavigateHome,
}) => {
  const { userProfile } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-md">
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={onNavigateHome}
          className="flex items-center space-x-2 text-left focus:outline-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform border border-white/20">
            <span className="text-xl">🌿</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              AgriNex
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium border border-white/30 hidden xs:inline">
                Smart Agri
              </span>
            </h1>
            <p className="text-[11px] text-emerald-100 font-medium leading-tight">
              शेतीच्या प्रत्येक गरजेला, डिजिटल जोडणी!
            </p>
          </div>
        </button>

        {/* Right Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">


          {/* Village Badge */}
          <div className="hidden sm:flex items-center space-x-1 bg-emerald-800/80 px-2.5 py-1 rounded-full text-xs text-emerald-100 border border-emerald-600/50">
            <MapPin className="w-3.5 h-3.5 text-emerald-300" />
            <span className="font-medium">
              {userProfile?.village ? userProfile.village.split(' ')[0] : 'महाराष्ट्र'}
            </span>
          </div>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white focus:outline-none"
            title="सूचना"
            aria-label="सूचना"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-emerald-700 animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Profile Shortcut */}
          <button
            onClick={onNavigateProfile}
            className="flex items-center space-x-1.5 p-1.5 pl-2 pr-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white text-xs font-medium focus:outline-none"
            title="प्रोफाइल"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-900 flex items-center justify-center text-xs font-bold text-emerald-200">
              {userProfile?.name ? userProfile.name.charAt(0) : <UserIcon className="w-3.5 h-3.5" />}
            </div>
            <span className="hidden xs:inline max-w-[80px] truncate">
              {userProfile?.name?.split(' ')[0] || 'प्रोफाइल'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
