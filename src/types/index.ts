export type PostType =
  | 'workers_needed'
  | 'work_wanted'
  | 'tractor_service'
  | 'bullock_service'
  | 'seeds'
  | 'fertilizers'
  | 'agri_tools'
  | 'agri_services';

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'in_progress' | 'completed';

export type RateType =
  | 'प्रतिदिन'
  | 'प्रतितास'
  | 'प्रतिएकर'
  | 'कामानुसार'
  | 'प्रति बॅग'
  | 'प्रति किलो'
  | 'प्रति नग'
  | 'दर चर्चेनुसार';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  village: string;
  occupation?: string;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhone?: string;
  village: string;
  postType: PostType;
  title: string;
  category?: string;
  requiredWorkers?: number;
  acceptedWorkersCount?: number;
  cropName?: string;
  workDate?: string;
  workTime?: string;
  duration?: string;
  rate: number;
  rateType: RateType;
  location?: string;
  description?: string;
  equipmentDetails?: string;
  // For 'work_wanted'
  isGroup?: boolean;
  groupCount?: number;
  experience?: string;
  availableSkills?: string[];
  status: 'active' | 'filled' | 'cancelled' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  postId: string;
  postTitle?: string;
  postType: PostType;
  posterId: string;
  posterName?: string;
  posterPhone?: string;
  requesterId: string;
  requesterName?: string;
  requesterPhone?: string;
  village: string;
  workDate?: string;
  agreedRate: number;
  rateType?: string;
  requestedWorkersCount?: number;
  status: BookingStatus;
  note?: string;
  hasPosterRated?: boolean;
  hasRequesterRated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  reviewerName?: string;
  targetUserId: string;
  rating: number; // 1 to 5
  workQuality?: string;
  punctuality?: string;
  behavior?: string;
  comment?: string;
  createdAt?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  bookingId?: string;
  read: boolean;
  createdAt?: string;
}
