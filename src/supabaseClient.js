import { createClient } from '@supabase/supabase-js';

// Retrieve keys from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect if keys are valid (not empty and not default placeholders)
const isConfigured = 
  supabaseUrl.trim() !== '' && 
  supabaseAnonKey.trim() !== '' && 
  !supabaseUrl.includes('your-supabase-url') &&
  !supabaseAnonKey.includes('your-supabase-anon-key');

let supabaseInstance = null;

try {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  console.log('[Supabase] Initializing real Supabase client.');
} catch (err) {
  console.error('[Supabase] Error initializing client:', err);
}

if (!supabaseInstance) {
  console.log('[Supabase] Using high-fidelity Mock Supabase Client (LocalStorage backed).');
  
  // High-fidelity Mock Supabase client
  const mockAuthListeners = new Set();
  
  const getStoredUsers = () => {
    const data = localStorage.getItem('gearup_users');
    return data ? JSON.parse(data) : [];
  };

  const setStoredUsers = (users) => {
    localStorage.setItem('gearup_users', JSON.stringify(users));
  };

  const getActiveUser = () => {
    const data = localStorage.getItem('gearup_current_user');
    return data ? JSON.parse(data) : null;
  };

  const setActiveUser = (user) => {
    if (user) {
      localStorage.setItem('gearup_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('gearup_current_user');
    }
    // Notify listeners
    mockAuthListeners.forEach((cb) => cb(user ? 'SIGNED_IN' : 'SIGNED_OUT', user));
  };



  // Database helper
  const getTableData = (table) => {
    let storageKey = `gearup_${table}`;
    if (table === 'users') storageKey = 'gearup_users';
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : [];
  };

  const setTableData = (table, data) => {
    let storageKey = `gearup_${table}`;
    if (table === 'users') storageKey = 'gearup_users';
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  const queryBuilder = (table) => {
    let rows = getTableData(table);
    let filters = [];
    let sortColumn = null;
    let sortAscending = true;

    const builder = {
      select: (columns = '*') => {
        // Return builder for chaining
        return builder;
      },
      eq: (column, value) => {
        filters.push((row) => row[column] === value);
        return builder;
      },
      order: (column, { ascending = true } = {}) => {
        sortColumn = column;
        sortAscending = ascending;
        return builder;
      },
      insert: async (newData) => {
        const records = Array.isArray(newData) ? newData : [newData];
        const newRecords = records.map((r) => ({
          id: r.id || `${table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          ...r
        }));
        const currentData = getTableData(table);
        setTableData(table, [...newRecords, ...currentData]);
        return { data: Array.isArray(newData) ? newRecords : newRecords[0], error: null };
      },
      update: async (updates) => {
        const currentData = getTableData(table);
        let updatedRecords = [];
        const updatedData = currentData.map((row) => {
          // Check if filters match this row
          const matches = filters.every((filterFn) => filterFn(row));
          if (matches) {
            const updated = { ...row, ...updates };
            updatedRecords.push(updated);
            return updated;
          }
          return row;
        });
        setTableData(table, updatedData);
        return { data: updatedRecords, error: null };
      },
      delete: async () => {
        const currentData = getTableData(table);
        const keptData = currentData.filter((row) => {
          const matches = filters.every((filterFn) => filterFn(row));
          return !matches;
        });
        setTableData(table, keptData);
        return { data: null, error: null };
      },
      // Terminal execution methods that return results
      then: (resolve, reject) => {
        let filtered = rows.filter((row) => filters.every((filterFn) => filterFn(row)));
        if (sortColumn) {
          filtered.sort((a, b) => {
            if (a[sortColumn] < b[sortColumn]) return sortAscending ? -1 : 1;
            if (a[sortColumn] > b[sortColumn]) return sortAscending ? 1 : -1;
            return 0;
          });
        }
        resolve({ data: filtered, error: null });
      }
    };

    return builder;
  };

  supabaseInstance = {
    auth: {
      signUp: async ({ email, password, options = {} }) => {
        const users = getStoredUsers();
        if (users.some((u) => u.email === email)) {
          return { data: null, error: new Error('Email đã được đăng ký trên hệ thống!') };
        }
        const newUser = {
          id: `user-${Date.now()}`,
          email,
          password, // Store as plaintext in mock local storage
          name: options.data?.name || email.split('@')[0],
          avatar: options.data?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          isPartner: false,
          phone: options.data?.phone || '',
          citizenId: '',
          studioName: ''
        };
        setStoredUsers([...users, newUser]);
        // Auto-login
        setActiveUser(newUser);
        return { data: { user: newUser, session: { access_token: 'mock-session-token' } }, error: null };
      },
      signInWithPassword: async ({ email, password }) => {
        const users = getStoredUsers();
        const user = users.find((u) => u.email === email && u.password === password);
        if (!user) {
          return { data: null, error: new Error('Email hoặc mật khẩu không chính xác!') };
        }
        setActiveUser(user);
        return { data: { user, session: { access_token: 'mock-session-token' } }, error: null };
      },
      signOut: async () => {
        setActiveUser(null);
        return { error: null };
      },
      getUser: async () => {
        return { data: { user: getActiveUser() }, error: null };
      },
      onAuthStateChange: (callback) => {
        mockAuthListeners.add(callback);
        // Fire initial event
        const user = getActiveUser();
        callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                mockAuthListeners.delete(callback);
              }
            }
          }
        };
      }
    },
    from: (table) => {
      return queryBuilder(table);
    }
  };
}

export const supabase = supabaseInstance;
