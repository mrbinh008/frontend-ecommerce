import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 1000,
  headers: {
    'Accept': 'application/json'
  }
});

instance.interceptors.request.use(function (config) {
  // Get the access token from local storage
  const token = localStorage.getItem('access_token');

  // If the token is present, set it on the request headers
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, function (error) {
  // Làm gì đó với lỗi request
  return Promise.reject(error);
});

// Thêm một bộ đón chặn response
instance.interceptors.response.use(function (response) {
  // Bất kì mã trạng thái nào nằm trong tầm 2xx đều khiến hàm này được trigger
  // Làm gì đó với dữ liệu response

  return response.data;
},async function (error) {
  const originalRequest = error.config;

  // If the server responds with a 401 unauthorized error and this is not a retry request
  if (error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    // Get the refresh token from local storage
    const refreshToken = localStorage.getItem('access_token');

    // If the refresh token is present, try to refresh the access token
    if (refreshToken) {
      try {
        // Replace '/refresh' with your refresh endpoint
        const response = await instance.post('auth/refresh', { refresh_token: refreshToken });

        // Save the new access token in local storage
        localStorage.setItem('access_token', response.data.access_token);

        // Set the Authorization header with the new access token
        originalRequest.headers['Authorization'] = 'Bearer ' + response.data.access_token;

        // Retry the original request
        return instance(originalRequest);
      } catch (err) {
        // Handle the error (e.g., redirect to login page)
        console.error(err);
      }
    }
  }
  return Promise.reject(error);
});

export default instance;