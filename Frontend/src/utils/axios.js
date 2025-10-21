import axios from 'axios';

// Configuring Base URL
const BASE_URL = "https://samvad-backend-latest.onrender.com";


// const BASE_URL = "https://707e82ada361.ngrok-free.app";
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


