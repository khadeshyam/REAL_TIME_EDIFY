import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_APP_BACKEND_URL || '/api/v1',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth') 
    ? JSON.parse(localStorage.getItem('auth')).token 
    : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const setLocalStorageWithExpiry = (key, data, expirationMinutes) => {
    const now = new Date();
    const item = {
        data: data,
        expiry: now.getTime() + expirationMinutes * 60 * 1000,
    };
    localStorage.setItem(key, JSON.stringify(item));
}

export const getLocalStorageWithExpiry = (key) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
        return null;
    }
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }
    return item.data;
}


export const login = async (user) => {

    try {


        const { email, password } = user;

        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL || '/api/v1' }/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })

        });
        const data = await res.json();
        if (res.status === 200) {

            setLocalStorageWithExpiry('auth', data, 60); // 60 minutes expiration
            return { status: 200, user: data.user, token: data.token, message: data.message };
        }
        return { status: 500, message: data.message };

    } catch (error) {
        console.log(error);
    }
}

export const register = async (user) => {

    try {

        const { username, email, password } = user;

        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL || '/api/v1' }/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })

        });
        const data = await res.json();
        if (res.status === 201) {
            return { status: 201, message: data.message };
        }
        return { status: 400, message: data.message };
    } catch (error) {
        return { status: 500, message: error.message };
    }
}

export const forgotPassword = async (email) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL || '/api/v1'}/users/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const data = await res.json();
        return {
            status: res.status,
            message: data.message
        };
        
    } catch (error) {
        console.error('Forgot password error:', error);
        return { 
            status: 500, 
            message: 'Failed to send reset instructions' 
        };
    }
};

export const resetPassword = async (token, password) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL || '/api/v1'}/users/reset-password/${token}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        const data = await res.json();
        return {
            status: res.status,
            message: data.message
        };

    } catch (error) {
        console.error('Reset password error:', error);
        return { 
            status: 500, 
            message: 'Password reset failed' 
        };
    }
};

export const exportDocument = async (documentId, format, content) => {
  try {
    const response = await API.post(`/documents/${documentId}/export/${format}`, 
      { content },
      {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Export failed';
  }
};

