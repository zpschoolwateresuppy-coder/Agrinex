import React from 'react';
import { Home, PlusCircle, CalendarCheck2, User } from 'lucide-react';

export type NavTab = 'home' | 'create_post' | 'bookings' | 'profile' | 'browse';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingBookingsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingBookingsCount = 0,
}) => {
  const tabs = [
    {
      id: 'home' as NavTab,
      label: 'होम',
      icon: Home,
    },
    {
      id: 'create_post' as NavTab,
      label: 'पोस्ट करा',
      icon: PlusCircle,
      highlight: true,
    },
    {
      id: 'bookings' as NavTab,
      label: 'बुकिंग्स',
      icon: CalendarCheck2,
      badge: pendingBookingsCount,
    },
    {
      id: 'profile' as NavTab,
      label: 'प्रोफाइल',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-emerald-100 shadow-lg pb-safe">
      <div className="max-w-3xl mx-auto flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.highlight) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center -mt-5 focus:outline-none group"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                      : 'bg-emerald-700 text-white hover:bg-emerald-600 active:scale-95'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span
                  className={`text-[11px] font-semibold mt-1 ${
                    isActive ? 'text-emerald-700' : 'text-zinc-600 group-hover:text-emerald-700'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 relative transition-colors focus:outline-none ${
                isActive ? 'text-emerald-700 font-bold' : 'text-zinc-500 hover:text-emerald-600 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
