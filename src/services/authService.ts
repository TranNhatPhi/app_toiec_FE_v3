import { api } from "./api";

interface RegisterData {
    fullname: string;
    email: string;
    password: string;
    retype_password: string;
    address: string;
    phone: string;
    date_of_birth: string;
}

interface LoginData {
    email: string;
    password: string;
}

// API Đăng ký
export const registerUser = async (userData: RegisterData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
};

// API Đăng nhập
export const loginUser = async (loginData: LoginData) => {
    const response = await api.post("/auth/login", loginData);
    return response.data;
};
