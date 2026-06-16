import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const StoreContext = createContext();

const initialAssets = [];
const initialBookings = [];
const initialMessages = [];

// Database mapping functions
const mapAssetFromDB = (a) => ({
  id: a.id,
  title: a.title,
  category: a.category,
  pricePerDay: Number(a.price_per_day),
  imageUrl: a.image_url,
  ownerName: a.owner_name,
  ownerAvatar: a.owner_avatar,
  ownerId: a.owner_id,
  rating: Number(a.rating),
  location: a.location,
  description: a.description,
  specs: a.specs,
  status: a.status,
  mount: a.mount || '',
  cameraType: a.camera_type || '',
  sensorType: a.sensor_type || '',
  specificPolicy: a.specific_policy || ''
});

const mapAssetToDB = (a) => ({
  id: a.id,
  title: a.title,
  category: a.category,
  price_per_day: a.pricePerDay,
  image_url: a.imageUrl,
  owner_name: a.ownerName,
  owner_avatar: a.ownerAvatar,
  owner_id: a.ownerId,
  rating: a.rating,
  location: a.location,
  description: a.description,
  specs: a.specs,
  status: a.status,
  mount: a.mount,
  camera_type: a.cameraType,
  sensor_type: a.sensorType,
  specific_policy: a.specificPolicy
});

const mapBookingFromDB = (b) => ({
  id: b.id,
  assetId: b.asset_id,
  assetTitle: b.asset_title,
  assetImage: b.asset_image,
  pricePerDay: Number(b.price_per_day),
  startDate: b.start_date,
  endDate: b.end_date,
  totalPrice: Number(b.total_price),
  renterName: b.renter_name,
  renterContact: b.renter_contact,
  renterId: b.renter_id,
  status: b.status,
  createdAt: b.created_at,
  contractUrl: b.contract_url
});

const mapBookingToDB = (b) => ({
  id: b.id,
  asset_id: b.assetId,
  asset_title: b.assetTitle,
  asset_image: b.assetImage,
  price_per_day: b.pricePerDay,
  start_date: b.startDate,
  end_date: b.endDate,
  total_price: b.totalPrice,
  renter_name: b.renterName,
  renter_contact: b.renterContact,
  renter_id: b.renterId,
  status: b.status,
  created_at: b.createdAt || new Date().toISOString(),
  contract_url: b.contractUrl || null
});

const mapMessageFromDB = (m) => ({
  id: m.id,
  assetId: m.asset_id,
  assetTitle: m.asset_title,
  senderId: m.sender_id,
  receiverId: m.receiver_id,
  customerId: m.customer_id,
  senderName: m.sender_name,
  text: m.text,
  status: m.status || 'sent',
  timestamp: m.timestamp || (m.created_at ? new Date(m.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''),
  createdAt: m.created_at
});

const mapMessageToDB = (m) => {
    const dbMsg = {
      id: m.id,
      asset_id: m.assetId,
      asset_title: m.assetTitle,
      sender_name: m.senderName,
      text: m.text,
      status: m.status || 'sent',
      timestamp: m.timestamp,
      created_at: m.createdAt
    };
    if (m.senderId) dbMsg.sender_id = m.senderId;
    if (m.receiverId) dbMsg.receiver_id = m.receiverId;
    if (m.customerId) dbMsg.customer_id = m.customerId;
    return dbMsg;
  };

const mapBlogFromDB = (b) => ({
  id: b.id,
  title: b.title,
  slug: b.slug,
  content: b.content,
  imageUrl: b.image_url,
  category: b.category,
  createdAt: b.created_at
});

const mapBlogToDB = (b) => ({
  id: b.id,
  title: b.title,
  slug: b.slug,
  content: b.content,
  image_url: b.imageUrl,
  category: b.category,
  created_at: b.createdAt
});

const mapBannerFromDB = (b) => ({
  id: b.id,
  title: b.title,
  imageUrl: b.image_url,
  imageUrl2: b.image_url_2,
  imageUrl3: b.image_url_3,
  linkUrl: b.link_url,
  position: b.position,
  isActive: b.is_active,
  effect: b.effect || 'none',
  effectDuration: b.effect_duration || 3,
  createdAt: b.created_at
});

const mapBannerToDB = (b) => ({
  id: b.id,
  title: b.title,
  image_url: b.imageUrl,
  image_url_2: b.imageUrl2,
  image_url_3: b.imageUrl3,
  link_url: b.linkUrl,
  position: b.position,
  is_active: b.isActive,
  effect: b.effect,
  effect_duration: b.effectDuration,
  created_at: b.createdAt
});

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const StoreProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = React.useState({});
  const typingChannelRef = React.useRef(null);
  const [currentCheckout, setCurrentCheckout] = useState(null);
  
  // Favorites & Notifications States
  const [favorites, setFavorites] = useState(() => {
    try {
      const cached = localStorage.getItem('gearup_favorites');
      const parsedCached = cached ? JSON.parse(cached) : [];
      const userCachedStr = localStorage.getItem('gearup_current_user');
      const userCached = userCachedStr ? JSON.parse(userCachedStr) : null;
      const legacyFavs = userCached?.favorites || [];
      return Array.from(new Set([...parsedCached, ...legacyFavs]));
    } catch {
      return [];
    }
  });
  const [notifications, setNotifications] = useState([]);

  // Auth States
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [banners, setBanners] = useState([]);
  const [isAppLoading, setIsAppLoading] = useState(true);

  const fetchBlogs = async () => {
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        const { data: blogsData, error: blogsError } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
        if (!blogsError && blogsData) {
          setBlogs(blogsData.map(mapBlogFromDB));
        }
      } catch (err) {
        console.warn('[Supabase] Failed to fetch blogs:', err);
      }
    }
  };

  const submitReview = async (reviewData) => {
    if (!user) return { error: { message: 'Not logged in' } };
    const newReview = {
      ...reviewData,
      user_id: user.id
    };
    try {
      const { data, error } = await supabase.from('reviews').insert([newReview]).select();
      return { data, error };
    } catch (err) {
      return { error: { message: err.message } };
    }
  };

  const markMessagesAsSeen = async (threadPartnerId, isCustomer = false) => {
    if (!user) return;
    
    // Update local state immediately
    setMessages(prev => prev.map(m => {
      const isThreadMsg = isCustomer 
        ? (m.senderId === threadPartnerId && m.customerId === user.id)
        : (m.customerId === threadPartnerId);
      if (isThreadMsg && m.status !== 'seen' && m.receiverId === user.id) {
        return { ...m, status: 'seen' };
      }
      return m;
    }));

    // Update DB
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        if (isCustomer) {
           await supabase.from('messages').update({ status: 'seen' }).eq('sender_id', threadPartnerId).eq('customer_id', user.id).eq('receiver_id', user.id).eq('status', 'sent');
        } else {
           await supabase.from('messages').update({ status: 'seen' }).eq('customer_id', threadPartnerId).eq('receiver_id', user.id).eq('status', 'sent');
        }
      } catch (err) {
        console.warn('[Supabase] Failed to mark messages as seen:', err);
      }
    }
  };

  const fetchBanners = async () => {
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        const { data: bannersData, error: bannersError } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
        if (!bannersError && bannersData) {
          setBanners(bannersData.map(mapBannerFromDB));
        }
      } catch (err) {
        console.warn('[Supabase] Failed to fetch banners:', err);
      }
    }
  };



  useEffect(() => {
    const initApp = async () => {
      setIsAppLoading(true);
      await fetchBlogs();
      await fetchBanners();
      // Thêm 1 chút thời gian chờ để hiệu ứng skeleton mượt mà hơn
      setTimeout(() => {
        setIsAppLoading(false);
      }, 1000);
    };
    initApp();
  }, []);

  // Auth state change handler
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      try {
        const activeUser = session?.user || (session?.email ? session : null);
        if (activeUser) {
          const metadata = activeUser.user_metadata || {};
          
          // Retrieve fresh partner status from cached active user first (if it matches)
          const cachedUserStr = localStorage.getItem('gearup_current_user');
          const cachedUser = cachedUserStr ? JSON.parse(cachedUserStr) : null;
          const useCache = cachedUser && (cachedUser.id === activeUser.id || cachedUser.email === activeUser.email);

          const mappedUser = {
            id: activeUser.id || (useCache ? cachedUser.id : 'demo-user-id'),
            email: activeUser.email || '',
            name: (useCache ? cachedUser.name : null) || metadata.name || (activeUser.email ? activeUser.email.split('@')[0] : 'User'),
            avatar: (useCache ? cachedUser.avatar : null) || metadata.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
            isPartner: useCache ? cachedUser.isPartner : (metadata.isPartner || false),
            partnerStatus: useCache ? cachedUser.partnerStatus : (metadata.partnerStatus || null),
            isStaff: (useCache ? cachedUser.isStaff : null) || metadata.isStaff || activeUser.email?.toLowerCase().endsWith('@gearup.vn') || false,
            phone: (useCache ? cachedUser.phone : null) || metadata.phone || '',
            citizenId: (useCache ? cachedUser.citizenId : null) || metadata.citizenId || '',
            studioName: (useCache ? cachedUser.studioName : null) || metadata.studioName || '',
            address: (useCache ? cachedUser.address : null) || metadata.address || '',
            favorites: (useCache ? cachedUser.favorites : null) || metadata.favorites || [],
            subscriptionTier: (useCache ? cachedUser.subscriptionTier : null) || metadata.subscriptionTier || 'free',
            subscriptionEnd: (useCache ? cachedUser.subscriptionEnd : null) || metadata.subscriptionEnd || null,
            contractTemplate: (useCache ? cachedUser.contractTemplate : null) || metadata.contractTemplate || '',
            contractTemplates: (useCache ? cachedUser.contractTemplates : null) || metadata.contractTemplates || []
          };

          // Cache the verified user session details
          localStorage.setItem('gearup_current_user', JSON.stringify(mappedUser));

          setUser(mappedUser);
        } else {
          localStorage.removeItem('gearup_current_user');
          setUser(null);
        }
      } catch (err) {
        console.error('[onAuthStateChange] Fatal error inside auth state change listener:', err);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch real profile details asynchronously when a real user logs in
  useEffect(() => {
    const fetchRealProfile = async () => {
      if (user && user.id && !user.id.startsWith('user-')) {
        const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
        if (isRealSupabase) {
          try {
            const [profileRes, subRes] = await Promise.all([
              supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
              supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle()
            ]);
            
            const data = profileRes.data;
            const subData = subRes.data;

            if (data || subData) {
              setUser(prev => {
                if (!prev || prev.id !== user.id) return prev;
                const merged = {
                  ...prev,
                  name: data?.name || prev.name,
                  avatar: data?.avatar || prev.avatar,
                  isPartner: data?.is_partner !== undefined ? data.is_partner : prev.isPartner,
                  partnerStatus: data?.partner_status || (data?.is_partner ? 'approved' : prev.partnerStatus),
                  phone: data?.phone || prev.phone,
                  citizenId: data?.citizen_id || prev.citizenId,
                  studioName: data?.studio_name || prev.studioName,
                  address: data?.address || prev.address,
                  favorites: prev.favorites || [],
                  generalPolicy: data?.general_policy || prev.generalPolicy,
                  subscriptionTier: subData?.tier || data?.subscription_tier || prev.subscriptionTier || 'free',
                  subscriptionEnd: subData?.current_period_end || data?.subscription_end || prev.subscriptionEnd || null,
                  contractTemplate: data?.contract_template || prev.contractTemplate || '',
                  contractTemplates: data?.contract_templates || prev.contractTemplates || []
                };
                localStorage.setItem('gearup_current_user', JSON.stringify(merged));
                return merged;
              });
            }
          } catch (err) {
            console.warn('[Supabase Profiles] Error fetching real profile:', err);
          }
        }
      }
    };
    fetchRealProfile();
  }, [user?.id]);

  // Fetch / Seed tables on user mount
  useEffect(() => {
    const fetchDB = async () => {
      let assetsFetched = null;
      let bookingsFetched = null;
      let messagesFetched = null;

      // Detect if real Supabase client is configured and try fetching
      const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
      if (isRealSupabase) {
        try {
          const { data: profilesData } = await supabase.from('profiles').select('id, name, studio_name, avatar');
          const profilesMap = {};
          if (profilesData) {
            profilesData.forEach(p => profilesMap[p.id] = p);
          }

          const { data: assetsData, error: assetsError } = await supabase.from('assets').select('*');
          if (!assetsError && assetsData) {
            // Filter out old simulated mock assets by ensuring owner_id is a valid UUID
            assetsFetched = assetsData.map(a => {
              const mappedAsset = mapAssetFromDB(a);
              if (profilesMap[mappedAsset.ownerId]) {
                const profile = profilesMap[mappedAsset.ownerId];
                mappedAsset.ownerName = profile.studio_name || profile.name || mappedAsset.ownerName;
                if (profile.avatar) mappedAsset.ownerAvatar = profile.avatar;
              }
              return mappedAsset;
            }).filter(a => a.ownerId && a.ownerId.length === 36);
          } else if (assetsError) {
            console.log('[Supabase] Failed to fetch assets (schema might not exist yet):', assetsError.message);
          }

          const { data: bookingsData, error: bookingsError } = await supabase.from('bookings').select('*');
          if (!bookingsError && bookingsData) {
            bookingsFetched = bookingsData.map(mapBookingFromDB);
          }

          const { data: messagesData, error: messagesError } = await supabase.from('messages').select('*');
          if (!messagesError && messagesData) {
            messagesFetched = messagesData.map(mapMessageFromDB);
          }
        } catch (err) {
          console.warn('[Supabase] Database fetch error, falling back to LocalStorage:', err);
        }
      }

      // Populate state: real data if fetched, otherwise empty array
      setAssets(assetsFetched || []);
      setBookings(bookingsFetched || []);
      setMessages(messagesFetched || []);
    };
    
    const fetchUserData = async () => {
      const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
      if (isRealSupabase && user) {
        // Fetch Favorites
        try {
          const { data: favData, error: favErr } = await supabase.from('favorites').select('asset_id').eq('user_id', user.email);
          if (!favErr && favData) {
            const fetchedFavs = favData.map(f => f.asset_id);
            setFavorites(fetchedFavs);
           localStorage.setItem('gearup_favorites', JSON.stringify(fetchedFavs));
          }
        } catch (err) { console.warn('Fav fetch error', err); }
        
        // Fetch Notifications
        try {
          const { data: notifData, error: notifErr } = await supabase.from('notifications')
            .select('*')
            .in('user_id', [user.email, user.id, 'all'])
            .order('created_at', { ascending: false });
          if (!notifErr && notifData) {
            setNotifications(notifData.map(n => ({
              id: n.id,
              userId: n.user_id,
              title: n.title,
              message: n.message,
              type: n.type,
              isRead: n.is_read,
              createdAt: n.created_at
            })));
          }
        } catch (err) { console.warn('Notif fetch error', err); }
      } else if (user === null && !localStorage.getItem('gearup_current_user')) {
        // Only clear if explicitly logged out (no cached user)
        setFavorites([]);
        setNotifications([]);
      }
    };

    fetchDB();
    fetchUserData();
  }, [user?.id, user?.email]);

  // Realtime Subscription for Messages
  useEffect(() => {
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (!isRealSupabase) return;

    const channel = supabase.channel('public:messages', { config: { broadcast: { self: true, ack: true } } })
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { threadId, senderName, senderRole, isTyping } = payload.payload || payload;
        setTypingStatus(prev => {
          const next = { ...prev };
          if (!next[threadId]) next[threadId] = {};
          if (isTyping) {
            next[threadId] = { ...next[threadId], [senderRole]: senderName || 'Ai đó' };
          } else {
            const updatedThread = { ...next[threadId] };
            delete updatedThread[senderRole];
            if (Object.keys(updatedThread).length === 0) {
              delete next[threadId];
            } else {
              next[threadId] = updatedThread;
            }
          }
          return next;
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new;
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, mapMessageFromDB(newMsg)];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        const updatedMsg = payload.new;
        setMessages(prev => prev.map(m => m.id === updatedMsg.id ? { ...m, status: updatedMsg.status || m.status } : m));
      })
      .subscribe((status, err) => {
        console.log('[Supabase Realtime] messages channel status:', status, err);
        if (status === 'SUBSCRIBED') {
          typingChannelRef.current = channel;
        }
      });

    const bookingsChannel = supabase.channel('public:bookings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        const newBooking = payload.new;
        setBookings(prev => {
          if (prev.some(b => b.id === newBooking.id)) return prev;
          return [mapBookingFromDB(newBooking), ...prev];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, (payload) => {
        const updatedBooking = payload.new;
        setBookings(prev => prev.map(b => b.id === updatedBooking.id ? mapBookingFromDB(updatedBooking) : b));
      })
      .subscribe((status, err) => {
        console.log('[Supabase Realtime] bookings channel status:', status, err);
      });

    const notifChannel = supabase.channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const newNotif = payload.new;
        if (newNotif.user_id === user?.id || newNotif.user_id === user?.email || newNotif.user_id === 'all') {
          setNotifications(prev => {
            if (prev.some(n => n.id === newNotif.id)) return prev;
            return [{
              id: newNotif.id,
              userId: newNotif.user_id,
              title: newNotif.title,
              message: newNotif.message,
              type: newNotif.type,
              isRead: newNotif.is_read,
              createdAt: newNotif.created_at
            }, ...prev];
          });
        }
      })
      .subscribe((status, err) => {
        console.log('[Supabase Realtime] notifications channel status:', status, err);
      });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(notifChannel);
    };
  }, [user?.id]);

  // Auth Functions
  const signUpUser = async (email, password, name, phone = '', address = '') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            address,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
          }
        }
      });
      if (error) {
        return { data: null, error };
      }
      
      // Immediately insert into public.profiles table to prevent any trigger delays
      if (data?.user) {
        try {
          await supabase.from('profiles').insert([{
            id: data.user.id,
            name,
            phone,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
            is_partner: false,
            citizen_id: '',
            studio_name: ''
          }]);
          console.log('[Supabase Profiles] Immediately synced profile for user:', data.user.id);
        } catch (dbErr) {
          console.warn('[Supabase Profiles] Profile immediate insert error:', dbErr);
        }
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const loginUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        return { data: null, error };
      }
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (err) {
      return { error: err };
    }
  };

  const verifyRecoveryOtp = async (email, token, newPassword) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'recovery'
      });
      if (error) return { error };
      
      // If successful, user is signed in. Update password:
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (updateError) return { error: updateError };
      
      return { data, error: null };
    } catch (err) {
      return { error: err };
    }
  };

  // Check if email exists
  const checkEmailExists = async (email) => {
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        const { data, error } = await supabase.rpc('check_email_exists', { check_email: email });
        if (error) {
          console.warn('[Supabase RPC] Error checking email:', error);
          return { exists: true }; // Fallback to true to prevent blocking if RPC fails
        }
        return { exists: data };
      } catch (err) {
        return { exists: true };
      }
    }
    return { exists: true };
  };

  // Mock OTP flow using Supabase DB to maintain stability across reloads
  const generateAndStoreOtp = async (email) => {
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
       const { error } = await supabase.from('otp_requests').insert([{
         email,
         otp: mockOtp,
         expires_at: expiresAt
       }]);
       if (error) {
         return { otp: null, error };
       }
    }
    return { otp: mockOtp, error: null };
  };

  const verifyMockOtp = async (email, otpInput) => {
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      const { data, error } = await supabase
        .from('otp_requests')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return { isValid: false, error: error || new Error('Không tìm thấy OTP') };
      
      if (new Date() > new Date(data.expires_at)) {
        return { isValid: false, error: new Error('Mã OTP đã hết hạn.') };
      }
      if (data.otp !== otpInput) {
        return { isValid: false, error: new Error('Mã OTP không chính xác.') };
      }
      return { isValid: true, error: null };
    }
    return { isValid: true, error: null }; // Fallback if no supabase
  };

  const logoutUser = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Supabase Auth] SignOut exception:', err);
    }
    localStorage.removeItem('gearup_current_user');
    setUser(null);
    return { error: null };
  };

  const updateUserProfile = async (updatedData) => {
    if (!user) return { error: new Error('Vui lòng đăng nhập trước!') };
    
    const updatedUser = { ...user, ...updatedData };
    
    // Update local state and cache
    setUser(updatedUser);
    localStorage.setItem('gearup_current_user', JSON.stringify(updatedUser));
    
    // Update in Supabase Auth & Profiles
    if (user.id && !user.id.startsWith('user-')) {
      if (supabase.auth.updateUser) {
        // Update auth metadata (optional, but good for sync)
        await supabase.auth.updateUser({
          data: {
            name: updatedUser.name,
            phone: updatedUser.phone,
            avatar: updatedUser.avatar,
            citizenId: updatedUser.citizenId,
            studioName: updatedUser.studioName,
            address: updatedUser.address,
            favorites: updatedUser.favorites,
            generalPolicy: updatedUser.generalPolicy
            // Removed contractTemplate and contractTemplates to avoid 400 Bad Request due to user_metadata size limits
          }
        });
      }
      
      const { error } = await supabase.from('profiles').update({
        name: updatedUser.name,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        citizen_id: updatedUser.citizenId,
        studio_name: updatedUser.studioName,
        general_policy: updatedUser.generalPolicy,
        contract_template: updatedUser.contractTemplate,
        contract_templates: updatedUser.contractTemplates
      }).eq('id', user.id);
      
      if (error) {
        console.warn('[Supabase Profiles] Error updating profile:', error);
        return { error };
      }
    }
    return { data: updatedUser, error: null };
  };

  const registerPartner = async (phone, citizenId, studioName) => {
    try {
      if (!user) return { error: new Error('Vui lòng đăng nhập trước!') };
      
      const updatedUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isPartner: false, // Wait for platform approval
        partnerStatus: 'pending',
        isStaff: user.isStaff,
        phone,
        citizenId,
        studioName: studioName || `${user.name} Studio`
      };

      // Update active session
      localStorage.setItem('gearup_current_user', JSON.stringify(updatedUser));
      
      // If it's a real Supabase client (not mock user), update user metadata
      if (user.id && !user.id.startsWith('user-')) {
        if (supabase.auth.updateUser) {
          await supabase.auth.updateUser({
            data: {
              isPartner: false,
              partnerStatus: 'pending',
              phone,
              citizenId,
              studioName: studioName || `${user.name} Studio`
            }
          });
        }
        // Also update in profiles table on database
        const { error: updateError } = await supabase.from('profiles').update({
          phone,
          citizen_id: citizenId,
          studio_name: studioName || `${user.name} Studio`,
          is_partner: false,
          partner_status: 'pending'
        }).eq('id', user.id);
        if (updateError) {
          console.warn('[Supabase Profiles] Error setting pending status in DB:', updateError);
        } else {
          console.log('[Supabase Profiles] Successfully updated partner status to pending in DB');
        }
      }
      
      setUser(updatedUser);
      return { data: updatedUser, error: null };
    } catch (e) {
      console.error('[registerPartner] Error occurred:', e);
      return { data: null, error: e };
    }
  };

  const approvePartner = async (userId) => {
    // Real Supabase update
    if (userId && !userId.startsWith('user-')) {
      try {
        const { error } = await supabase.from('profiles').update({
          is_partner: true,
          partner_status: 'approved'
        }).eq('id', userId);
        if (error) {
          console.warn('[Supabase Profiles] Failed to approve partner in DB:', error);
          return { error };
        }
        console.log('[Supabase Profiles] Approved partner in database:', userId);
      } catch (err) {
        console.warn('[Supabase Profiles] Exception in DB approve:', err);
        return { error: err };
      }
    }

    if (user && user.id === userId) {
      const approvedUser = {
        ...user,
        isPartner: true,
        partnerStatus: 'approved'
      };
      setUser(approvedUser);
      localStorage.setItem('gearup_current_user', JSON.stringify(approvedUser));
    }

    return { error: null };
  };

  const rejectPartner = async (userId) => {
    // Real Supabase update
    if (userId && !userId.startsWith('user-')) {
      try {
        const { error } = await supabase.from('profiles').update({
          is_partner: false,
          partner_status: 'rejected'
        }).eq('id', userId);
        if (error) {
          console.warn('[Supabase Profiles] Failed to reject partner in DB:', error);
          return { error };
        }
        console.log('[Supabase Profiles] Rejected partner in database:', userId);
      } catch (err) {
        console.warn('[Supabase Profiles] Exception in DB reject:', err);
        return { error: err };
      }
    }

    if (user && user.id === userId) {
      const rejectedUser = {
        ...user,
        isPartner: false,
        partnerStatus: 'rejected'
      };
      setUser(rejectedUser);
      localStorage.setItem('gearup_current_user', JSON.stringify(rejectedUser));
    }

    return { error: null };
  };

  // Database Functions
  const addAsset = async (newAsset) => {
    const assetRecord = {
      id: `asset-${Date.now()}`,
      rating: 5.0,
      ownerName: user?.name || 'Nguyễn Minh Quân',
      ownerAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      ownerId: user?.id || 'demo-user-id',
      status: 'available',
      ...newAsset
    };
    
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        await supabase.from('assets').insert([mapAssetToDB(assetRecord)]);
      } catch (err) {
        console.warn('[Supabase] Failed to insert asset:', err);
      }
    }
    setAssets(prev => [assetRecord, ...prev]);
  };

  const updateAssetStatus = async (assetId, status) => {
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        await supabase.from('assets').update({ status }).eq('id', assetId);
      } catch (err) {
        console.warn('[Supabase] Failed to update asset status:', err);
      }
    }
    setAssets(prev => prev.map((a) => a.id === assetId ? { ...a, status } : a));
  };

  const deleteAsset = async (assetId) => {
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        await supabase.from('assets').delete().eq('id', assetId);
      } catch (err) {
        console.warn('[Supabase] Failed to delete asset:', err);
      }
    }
    setAssets(prev => prev.filter(a => a.id !== assetId));
  };

  const addNotification = async (userId, title, message, type = 'system') => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
      created_at: new Date().toISOString()
    };
    
    setNotifications(prev => [{
      id: newNotif.id,
      userId: newNotif.user_id,
      title: newNotif.title,
      message: newNotif.message,
      type: newNotif.type,
      isRead: newNotif.is_read,
      createdAt: newNotif.created_at
    }, ...prev]);

    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        await supabase.from('notifications').insert([{
          user_id: userId,
          title,
          message,
          type,
          is_read: false
        }]);
      } catch (err) { console.warn('Failed to insert notif', err); }
    }
  };

  const updateAssetDetails = async (assetId, updatedData) => {
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        const dbData = {
          title: updatedData.title,
          category: updatedData.category,
          location: updatedData.location,
          price_per_day: updatedData.pricePerDay,
          image_url: updatedData.imageUrl,
          description: updatedData.description,
          specs: updatedData.specs,
          mount: updatedData.mount,
          camera_type: updatedData.cameraType,
          sensor_type: updatedData.sensorType
        };
        await supabase.from('assets').update(dbData).eq('id', assetId);
      } catch (err) {
        console.warn('[Supabase] Failed to update asset details:', err);
      }
    }
    setAssets(prev => prev.map((a) => a.id === assetId ? { ...a, ...updatedData } : a));
  };

  const addBooking = async (newBooking) => {
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    const bookingRecord = {
      id: `booking-${Date.now()}`,
      status: newBooking.status || 'pending',
      renterId: user?.id || 'guest',
      createdAt: new Date().toISOString(),
      ...newBooking
    };
    
    if (isRealSupabase) {
      try {
        const { data, error } = await supabase.from('bookings').insert([mapBookingToDB(bookingRecord)]).select();
        if (!error && data && data.length > 0) {
          Object.assign(bookingRecord, mapBookingFromDB(data[0]));
        }
      } catch (err) {
        console.warn('[Supabase] Failed to add booking:', err);
      }
    }
    setBookings(prev => [bookingRecord, ...prev]);
    if (newBooking.ownerId) {
      addNotification(newBooking.ownerId, "Đơn thuê mới", `Bạn nhận được yêu cầu thuê mới cho thiết bị: ${newBooking.assetTitle}`, "partner_booking");
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    const booking = bookings.find(b => b.id === bookingId);
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        await supabase.from('bookings').update({ status }).eq('id', bookingId);
      } catch (err) {
        console.warn('[Supabase] Failed to update booking status:', err);
      }
    }
    setBookings(prev => prev.map((b) => b.id === bookingId ? { ...b, status } : b));

    if (booking) {
      if (status === 'cancelled') {
        addNotification(booking.ownerId, "Khách hàng đã hủy đơn", `Đơn thuê ${booking.assetTitle} đã bị khách hàng hủy.`, "partner_alert");
      } else if (status === 'approved') {
        addNotification(booking.renterId, "Đơn thuê được chấp nhận", `Đơn thuê ${booking.assetTitle} đã được đối tác chấp nhận.`, "customer_success");
      } else if (status === 'rejected') {
        addNotification(booking.renterId, "Đơn thuê bị từ chối", `Đơn thuê ${booking.assetTitle} đã bị đối tác từ chối.`, "customer_alert");
      } else if (status === 'returned') {
        addNotification(booking.renterId, "Đơn thuê hoàn thành", `Cảm ơn bạn đã sử dụng ${booking.assetTitle}.`, "customer_success");
      }
    }
  };

  const sendTypingEvent = (threadId, isTyping, senderRole = 'customer') => {
    if (typingChannelRef.current) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { threadId, senderName: senderRole === 'partner' ? (user?.studio_name || user?.name) : user?.name, senderRole, isTyping }
      });
    }
  };

  const addMessage = async (assetId, assetTitle, senderName, text, senderId, receiverId, customerId) => {
    console.log('[addMessage] CALLED with receiverId:', receiverId, 'assetId:', assetId, 'customerId:', customerId);
    if (!receiverId) {
      console.error('[addMessage] ERROR: receiverId is undefined! Message will not reach the partner.');
    }
    const newMessage = {
        id: `msg-${Date.now()}`,
        assetId,
        assetTitle,
        senderName: senderName || user?.studio_name || user?.name,
        text,
        status: 'sent',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
        senderId,
        receiverId,
        customerId
    };
    
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        await supabase.from('messages').insert([mapMessageToDB(newMessage)]);
      } catch (err) {
        console.warn('[Supabase] Failed to insert message:', err);
      }
    }
    setMessages(prev => [...prev, newMessage]);
  };

  const addBlog = async (newBlog) => {
    let blogRecord = {
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      ...newBlog
    };
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        const dbData = mapBlogToDB(blogRecord);
        const { data, error } = await supabase.from('blogs').insert([dbData]).select().single();
        if (!error && data) {
          blogRecord = mapBlogFromDB(data);
        } else if (error) {
          console.warn('[Supabase] Insert blog error:', error);
        }
      } catch (err) {
        console.warn('[Supabase] Failed to insert blog:', err);
      }
    }
    setBlogs(prev => [blogRecord, ...prev]);
  };

  const updateBlog = async (blogId, updatedData) => {
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        const dbData = {};
        if (updatedData.title !== undefined) dbData.title = updatedData.title;
        if (updatedData.slug !== undefined) dbData.slug = updatedData.slug;
        if (updatedData.content !== undefined) dbData.content = updatedData.content;
        if (updatedData.imageUrl !== undefined) dbData.image_url = updatedData.imageUrl;
        if (updatedData.category !== undefined) dbData.category = updatedData.category;
        await supabase.from('blogs').update(dbData).eq('id', blogId);
      } catch (err) {
        console.warn('[Supabase] Failed to update blog:', err);
      }
    }
    setBlogs(prev => prev.map((b) => b.id === blogId ? { ...b, ...updatedData } : b));
  };

  const deleteBlog = async (id) => {
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        await supabase.from('blogs').delete().eq('id', id);
      } catch (err) {
        console.warn('[Supabase] Failed to delete blog:', err);
      }
    }
    setBlogs(prev => prev.filter(b => b.id !== id));
  };

  const addBanner = async (newBanner) => {
    let bannerRecord = {
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      ...newBanner
    };
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        const dbData = mapBannerToDB(bannerRecord);
        const { data, error } = await supabase.from('banners').insert([dbData]).select().single();
        if (!error && data) {
          bannerRecord = mapBannerFromDB(data);
        } else if (error) {
          console.warn('[Supabase] Insert banner error:', error);
        }
      } catch (err) {
        console.warn('[Supabase] Failed to insert banner:', err);
      }
    }
    setBanners(prev => [bannerRecord, ...prev]);
  };

  const updateBanner = async (updatedBanner) => {
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        const dbData = mapBannerToDB(updatedBanner);
        await supabase.from('banners').update(dbData).eq('id', updatedBanner.id);
      } catch (err) {
        console.warn('[Supabase] Failed to update banner:', err);
      }
    }
    setBanners(prev => prev.map(b => b.id === updatedBanner.id ? updatedBanner : b));
  };

  const deleteBanner = async (id) => {
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        await supabase.from('banners').delete().eq('id', id);
      } catch (err) {
        console.warn('[Supabase] Failed to delete banner:', err);
      }
    }
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  const toggleFavorite = async (assetId) => {
    if (!user) {
      alert("Vui lòng đăng nhập để lưu thiết bị yêu thích!");
      setShowAuthModal(true);
      return false;
    }
    
    const isFav = favorites.includes(assetId);
    const newFavorites = isFav ? favorites.filter(id => id !== assetId) : [...favorites, assetId];
    
    setFavorites(newFavorites);
    localStorage.setItem('gearup_favorites', JSON.stringify(newFavorites));

    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        if (isFav) {
          const {error} = await supabase.from('favorites').delete().eq('user_id', user.email).eq('asset_id', assetId);
          if (error) console.warn('DB delete fav error:', error);
        } else {
          const {error} = await supabase.from('favorites').insert([{ user_id: user.email, asset_id: assetId }]);
          if (error) console.warn('DB insert fav error:', error);
        }
      } catch (err) {
        console.warn('[Supabase] Failed to toggle favorite:', err);
      }
    }
    return !isFav;
  };

  const markNotificationAsRead = async (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
      } catch (err) {
        console.warn('[Supabase] Failed to mark notif as read:', err);
      }
    }
  };

  const updateUserSubscription = async (tier) => {
    if (!user) return;
    
    // Set expiry to 30 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const endStr = expiryDate.toISOString();

    const updatedUser = { 
      ...user, 
      subscriptionTier: tier, 
      subscriptionEnd: endStr 
    };

    // Update locally
    setUser(updatedUser);
    localStorage.setItem('gearup_current_user', JSON.stringify(updatedUser));

    // Update DB subscriptions table
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase && user.id && !user.id.startsWith('user-')) {
      try {
        const { data: existingSub } = await supabase.from('subscriptions').select('id').eq('user_id', user.id).maybeSingle();
        if (existingSub) {
          await supabase.from('subscriptions').update({ 
            tier: tier,
            current_period_end: endStr,
            status: 'active'
          }).eq('user_id', user.id);
        } else {
          await supabase.from('subscriptions').insert([{
            user_id: user.id,
            tier: tier,
            current_period_end: endStr,
            status: 'active'
          }]);
        }
      } catch (err) {
        console.log('Skipped DB subscriptions update', err);
      }
    }
  };

  return (
    <StoreContext.Provider
      value={{
        assets,
        bookings,
        messages,
        addMessage,
        markMessagesAsSeen,
        typingStatus,
        sendTypingEvent,
        user,
        favorites,
        notifications,
        toggleFavorite,
        markNotificationAsRead,
        updateUserSubscription,
        showAuthModal,
        setShowAuthModal,
        showPartnerModal,
        setShowPartnerModal,
        signUpUser,
        loginUser,
        logoutUser,
        resetPassword,
        verifyRecoveryOtp,
        checkEmailExists,
        submitReview,
        generateAndStoreOtp,
        verifyMockOtp,
        registerPartner,
        approvePartner,
        rejectPartner,
        addAsset,
        updateAssetStatus,
        deleteAsset,
        addBooking,
        updateBookingStatus,
        addMessage,
        blogs,
        fetchBlogs,
        addBlog,
        updateBlog,
        deleteBlog,
        banners,
        fetchBanners,
        addBanner,
        updateBanner,
        deleteBanner,
        isAppLoading,
        updateAssetDetails,
        currentCheckout,
        setCurrentCheckout,
        updateUserProfile,
        addNotification
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
