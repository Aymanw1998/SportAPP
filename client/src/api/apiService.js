import axios from "axios";

const API_BASE_URL = process.env.URL_S || "https://sportapp-server.onrender.com/api";

export const apiService = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// פונקציה להגדרת טוקן בבקשות
export const setAuthToken = (token) => {
  if (token) {
    apiService.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete apiService.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};
// הוספת Interceptor לתשובות מהשרת
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token"); // מחיקת טוקן ישן
      window.location.href = "/"; // הפניה אוטומטית לדף התחברות
    }
    return Promise.reject(error);
  }
);
// הוספת הטוקן לכל הבקשות היוצאות
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);