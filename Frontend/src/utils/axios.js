import axios from 'axios';

// Configuring Base URL
const BASE_URL = "http://localhost:8000/";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
    (response) => response,
    (error) =>{
        Promise.reject((error.response && error.response.data) || "Something Went Wrong");
    }
)

export default axiosInstance;