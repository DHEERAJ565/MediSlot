import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosClient';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('medislot_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [doctorProfile, setDoctorProfile] = useState(() => {
    try {
      const savedDoc = localStorage.getItem('medislot_doc_profile');
      return savedDoc ? JSON.parse(savedDoc) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('medislot_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify and fetch current profile on mount
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('medislot_user', JSON.stringify(data.user));
          if (data.doctorProfile) {
            setDoctorProfile(data.doctorProfile);
            localStorage.setItem('medislot_doc_profile', JSON.stringify(data.doctorProfile));
          }
        }
      } catch (err) {
        console.error('Session expired or invalid:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('medislot_token', data.token);
        localStorage.setItem('medislot_user', JSON.stringify(data.user));

        if (data.doctorProfile) {
          setDoctorProfile(data.doctorProfile);
          localStorage.setItem('medislot_doc_profile', JSON.stringify(data.doctorProfile));
        } else {
          setDoctorProfile(null);
          localStorage.removeItem('medislot_doc_profile');
        }

        toast.success(`Welcome back, ${data.user.name}!`);
        return { success: true, user: data.user };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid email or password.';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('medislot_token', data.token);
        localStorage.setItem('medislot_user', JSON.stringify(data.user));
        toast.success('Registration successful! Welcome to MediSlot.');
        return { success: true, user: data.user };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please check inputs.';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setDoctorProfile(null);
    setToken(null);
    localStorage.removeItem('medislot_token');
    localStorage.removeItem('medislot_user');
    localStorage.removeItem('medislot_doc_profile');
    toast.success('Logged out successfully.');
  };

  // Update profile in state
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('medislot_user', JSON.stringify(updated));
      return updated;
    });
  };

  const updateDoctorProfileState = (updatedFields) => {
    setDoctorProfile((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('medislot_doc_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    doctorProfile,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isPatient: user?.role === 'patient',
    isDoctor: user?.role === 'doctor',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser,
    updateDoctorProfileState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
