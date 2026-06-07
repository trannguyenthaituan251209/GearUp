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
  sensorType: a.sensor_type || ''
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
  sensor_type: a.sensorType
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
        updateAssetDetails
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
