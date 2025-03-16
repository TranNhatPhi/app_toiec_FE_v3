import React, { useState } from "react";
import "../assets/styles/AuthModal.css";
import { registerUser, loginUser } from "../services/authService";

interface AuthModalProps {
    closeModal: () => void;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ closeModal, setIsLoggedIn }) => {
    const [isRegisterTab, setIsRegisterTab] = useState(false);
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        password: "",
        retype_password: "",
        address: "",
        phone: "",
        date_of_birth: "",  // ✅ Sửa lỗi: đúng với backend
    });
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            setError("Email và mật khẩu không được để trống!");
            return false;
        }
        if (isRegisterTab) {
            if (!formData.fullname || !formData.address || !formData.phone || !formData.date_of_birth) {
                setError("Vui lòng điền đầy đủ thông tin!");
                return false;
            }
            if (formData.password !== formData.retype_password) {
                setError("Mật khẩu và xác nhận mật khẩu không khớp!");
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) return;

        try {
            if (isRegisterTab) {
                await registerUser(formData);
                alert("Đăng ký thành công!");
            } else {
                const response = await loginUser({ email: formData.email, password: formData.password });
                alert("Đăng nhập thành công!"); 
                localStorage.setItem("token", response.token);
                setIsLoggedIn(true);
            }
            closeModal();
        } catch (error: any) {
            setError(error.error || "Đã xảy ra lỗi!");
        }
    };

    return (
        <div className="auth-modal-overlay" onClick={closeModal}>
            <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="auth-modal-header">{isRegisterTab ? "Đăng ký" : "Đăng nhập"}</div>
                <div className="auth-modal-content">
                    <form onSubmit={handleSubmit}>
                        {isRegisterTab && (
                            <>
                                <input type="text" name="fullname" placeholder="Họ và tên" value={formData.fullname} onChange={handleChange} required />
                                <input type="text" name="address" placeholder="Địa chỉ" value={formData.address} onChange={handleChange} required />
                                <input type="text" name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} required />
                                <input type="date" name="date_of_birth" placeholder="Ngày sinh" value={formData.date_of_birth} onChange={handleChange} required />
                            </>
                        )}
                        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                        <input type="password" name="password" placeholder="Mật khẩu" value={formData.password} onChange={handleChange} required />
                        {isRegisterTab && (
                            <input type="password" name="retype_password" placeholder="Nhập lại mật khẩu" value={formData.retype_password} onChange={handleChange} required />
                        )}
                        {error && <p className="auth-error-text">{error}</p>}
                        <button type="submit" className="btn-primary">{isRegisterTab ? "Đăng ký" : "Đăng nhập"}</button>
                    </form>
                    <p className="auth-switch-text">
                        {isRegisterTab ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
                        <span onClick={() => setIsRegisterTab(!isRegisterTab)}>
                            {isRegisterTab ? "Đăng nhập" : "Đăng ký"}
                        </span>
                    </p>
                    <button className="auth-modal-close" onClick={closeModal}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
