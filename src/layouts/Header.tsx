import React, { useState, useEffect } from "react";
import AuthModal from "../components/AuthModal";

const Header: React.FC = () => {
    // Giả lập trạng thái đăng nhập bằng localStorage
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
        return localStorage.getItem("isLoggedIn") === "true";
    });
    const [showModal, setShowModal] = useState(false);

    // Khi đăng nhập / đăng xuất, lưu trạng thái vào localStorage
    useEffect(() => {
        localStorage.setItem("isLoggedIn", isLoggedIn.toString());
    }, [isLoggedIn]);

    // Giả lập đăng xuất
    const handleLogout = () => {
        setIsLoggedIn(false);
        alert("Bạn đã đăng xuất!");
    };

    return (
        <header className="header">
            <div className="logo">TOEiC APP</div>

            {/* 🟢 Navbar với hiệu ứng hover */}
            <nav>
                <ul className="nav-links">
                    <li><a href="#">My Courses</a></li>
                    <li><a href="#">Study Program</a></li>
                    <li><a href="#">Online Tests</a></li>
                    <li><a href="#">Flashcards</a></li>
                    <li><a href="#">Blog</a></li>
                    <li><a href="#">Activate Account</a></li>
                </ul>
            </nav>

            {/* 🟢 Nút đăng nhập/đăng xuất */}
            <div className="auth-section">
                {isLoggedIn ? (
                    <button className="auth-btn logout" onClick={handleLogout}>Logout</button>
                ) : (
                    <button className="auth-btn login" onClick={() => setShowModal(true)}>Login</button>
                )}
            </div>

            {/* 🟢 Modal đăng nhập */}
            {showModal && <AuthModal closeModal={() => setShowModal(false)} setIsLoggedIn={setIsLoggedIn} />}
        </header>
    );
};

export default Header;
