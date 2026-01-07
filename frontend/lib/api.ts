import axios from 'axios';
import Cookies from 'js-cookie';

const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const eventApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EVENT_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const orderApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const addAuthInterceptor = (instance: any) => {
  instance.interceptors.request.use(
    (config: any) => {
      const token = Cookies.get('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => Promise.reject(error)
  );
};

addAuthInterceptor(authApi);
addAuthInterceptor(eventApi);
addAuthInterceptor(orderApi);

export { authApi, eventApi, orderApi };
