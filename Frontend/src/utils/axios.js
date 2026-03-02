import axios from 'axios';
import { isJwtToken } from './authToken';
import { getBackendUrl } from './networkConfig';

// Configuring Base URL
const BASE_URL = getBackendUrl();


// const BASE_URL = "https://707e82ada361.ngrok-free.app";
const axiosInstance = axios.create({
    baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const authHeader = config?.headers?.authorization || config?.headers?.Authorization;

        if (typeof authHeader === "string") {
            const tokenFromHeader = authHeader.replace(/^bearer\s+/i, "").trim();

            if (isJwtToken(tokenFromHeader)) {
                config.headers.authorization = `bearer ${tokenFromHeader}`;
            } else {
                delete config.headers.authorization;
                delete config.headers.Authorization;
            }
        }

        return config;
    },
    (error) => Promise.reject((error.response && error.response.data) || "Something Went Wrong")
)

export default axiosInstance;
