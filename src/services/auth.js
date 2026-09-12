import { supabase } from './supabaseClient';

const STORAGE_KEY = 'pantrypulse_auth_user';

export async function getCurrentUser() {
  if (supabase) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user && !error) {
        return {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
          isGuest: false
        };
      }
    } catch (err) {
      console.warn('Supabase auth session check failed:', err);
    }
  }

  // Fallback to local storage session
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) return JSON.parse(local);
  } catch (err) {}

  return null;
}

export async function signInUser(email, password) {
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    if (error) throw error;
    if (data?.user) {
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email.split('@')[0],
        isGuest: false
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return user;
    }
  }

  // Local demo login fallback
  const user = {
    id: 'user-' + btoa(email).slice(0, 8),
    email: email.trim(),
    name: email.split('@')[0],
    isGuest: false
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export async function signUpUser(name, email, password) {
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim() }
      }
    });
    if (error) throw error;
    if (data?.user) {
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: name.trim() || data.user.email.split('@')[0],
        isGuest: false
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return user;
    }
  }

  // Local demo sign up fallback
  const user = {
    id: 'user-' + Date.now(),
    email: email.trim(),
    name: name.trim() || email.split('@')[0],
    isGuest: false
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export async function continueAsGuest() {
  const guestUser = {
    id: 'demo-guest-' + Math.floor(Math.random() * 1000),
    email: 'guest@pantrypulse.ai',
    name: 'Kitchen Chef',
    isGuest: true
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guestUser));
  return guestUser;
}

export async function signOutUser() {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase sign out error:', err);
    }
  }
  localStorage.removeItem(STORAGE_KEY);
  return true;
}
