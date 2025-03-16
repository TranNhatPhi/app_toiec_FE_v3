import React, { useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import CourseCard from "../components/CourseCard";
import useExams from "../hooks/useExams";

const Home: React.FC = () => {
    const { exams, loading, error } = useExams(); // Lấy dữ liệu từ custom hook

    // Log dữ liệu để kiểm tra
    useEffect(() => {
        console.log("Loading:", loading);
        console.log("Error:", error);
        console.log("Exams data:", exams);
    }, [loading, error, exams]);

    return (
        <MainLayout>
            {/* ✅ Phần Giới Thiệu TOEIC */}
            <div className="toeic-intro">
                {/* ✅ Hình ảnh TOEIC Banner */}
                <img
                    src="/logoAppToeic1.png"
                    alt="TOEIC Exam Banner"
                    className="toeic-banner"
                />

                {/* ✅ Nội dung bên phải */}
                <div className="toeic-content">
                    <h1>📘 Welcome to TOEIC Practice!</h1>
                    <p>
                        The TOEIC (Test of English for International Communication) is a globally recognized English proficiency test designed for professionals and students.
                        Our platform provides the latest TOEIC practice tests to help you prepare efficiently and improve your listening and reading skills.
                    </p>
                    <p>✔ Practice with real exam-like questions.</p>
                    <p>✔ Track your progress and improve daily.</p>
                    <p>✔ Get ready for success in the TOEIC test!</p>
                </div>
            </div>

            {/* ✅ Tiêu Đề Danh Sách Đề Thi */}
            <h2 className="section-title">📝 Đề thi mới nhất</h2>

            {/* ✅ Danh Sách Đề Thi */}
            {loading && <p>Loading exams...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div className="exam-list">
                {exams && exams.length > 0 ? (
                    exams.map((exam, index) => (
                        <CourseCard key={index} {...exam} />
                    ))
                ) : (
                    <p>No exams available.</p>
                )}
            </div>
        </MainLayout>
    );
};

export default Home;
