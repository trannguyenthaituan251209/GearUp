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
  status: a.status
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
  status: a.status
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
  createdAt: b.created_at
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
  created_at: b.createdAt
});

const mapMessageFromDB = (m) => ({
  id: m.id,
  assetId: m.asset_id,
  assetTitle: m.asset_title,
  senderName: m.sender_name,
  text: m.text,
  timestamp: m.timestamp,
  createdAt: m.created_at
});

const mapMessageToDB = (m) => ({
  id: m.id,
  asset_id: m.assetId,
  asset_title: m.assetTitle,
  sender_name: m.senderName,
  text: m.text,
  timestamp: m.timestamp,
  created_at: m.createdAt
});

export const StoreProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);

  // Auth States
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);



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
            studioName: (useCache ? cachedUser.studioName : null) || metadata.studioName || ''
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
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();
            
            if (!error && data) {
              setUser(prev => {
                if (!prev || prev.id !== user.id) return prev;
                const merged = {
                  ...prev,
                  name: data.name || prev.name,
                  avatar: data.avatar || prev.avatar,
                  isPartner: data.is_partner !== undefined ? data.is_partner : prev.isPartner,
                  partnerStatus: data.partner_status || (data.is_partner ? 'approved' : prev.partnerStatus),
                  phone: data.phone || prev.phone,
                  citizenId: data.citizen_id || prev.citizenId,
                  studioName: data.studio_name || prev.studioName
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
          const { data: assetsData, error: assetsError } = await supabase.from('assets').select('*');
          if (!assetsError && assetsData) {
            // Filter out old simulated mock assets by ensuring owner_id is a valid UUID
            assetsFetched = assetsData.map(mapAssetFromDB).filter(a => a.ownerId && a.ownerId.length === 36);
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
    fetchDB();
  }, [user]);



  // Auth Functions
  const signUpUser = async (email, password, name, phone = '') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
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
        await supabase.from('profiles').update({
          phone,
          citizen_id: citizenId,
          studio_name: studioName || `${user.name} Studio`,
          is_partner: false
        }).eq('id', user.id);
        console.log('[Supabase Profiles] Successfully updated partner status to pending in DB');
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
        await supabase.from('profiles').update({
          is_partner: true
        }).eq('id', userId);
        console.log('[Supabase Profiles] Approved partner in database:', userId);
      } catch (err) {
        console.warn('[Supabase Profiles] Failed to approve partner in DB:', err);
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
        await supabase.from('profiles').update({
          is_partner: false
        }).eq('id', userId);
        console.log('[Supabase Profiles] Rejected partner in database:', userId);
      } catch (err) {
        console.warn('[Supabase Profiles] Failed to reject partner in DB:', err);
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

  const addBooking = async (newBooking) => {
    const bookingRecord = {
      id: `booking-${Date.now()}`,
      status: 'pending',
      renterId: user?.id || 'guest',
      createdAt: new Date().toISOString(),
      ...newBooking
    };
    
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        await supabase.from('bookings').insert([mapBookingToDB(bookingRecord)]);
      } catch (err) {
        console.warn('[Supabase] Failed to insert booking:', err);
      }
    }
    setBookings(prev => [bookingRecord, ...prev]);
  };

  const updateBookingStatus = async (bookingId, status) => {
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        await supabase.from('bookings').update({ status }).eq('id', bookingId);
      } catch (err) {
        console.warn('[Supabase] Failed to update booking status:', err);
      }
    }
    setBookings(prev => prev.map((b) => b.id === bookingId ? { ...b, status } : b));
  };

  const addMessage = async (assetId, assetTitle, senderName, text) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      assetId,
      assetTitle,
      senderName: user?.name || senderName,
      text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
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

  return (
    <StoreContext.Provider
      value={{
        assets,
        bookings,
        messages,
        user,
        showAuthModal,
        setShowAuthModal,
        showPartnerModal,
        setShowPartnerModal,
        signUpUser,
        loginUser,
        logoutUser,
        registerPartner,
        approvePartner,
        rejectPartner,
        addAsset,
        updateAssetStatus,
        addBooking,
        updateBookingStatus,
        addMessage
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
