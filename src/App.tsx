import "./assets/styles/global.css";

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ExamResults from "./pages/ExamResult"; // ✅ Trang hiển thị kết quả bài thi
import ExamDetail from "./pages/ExamDetail";
import Dashboard from "./pages/dashboard/Dashboard"; // ✅ Trang hiển thị kết quả bài thi

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exam/:examId" element={<ExamDetail />} />
        <Route
          path="/exam-results"
          element={
            <ExamResults />
          }
        />
        {/* ✅ Khi gõ /admin sẽ chuyển hướng sang /admin/home */}
        <Route path="/admin" element={<Navigate to="/admin/home" replace />} />

        {/* ✅ Giao diện admin chính với layout */}
        <Route path="/admin/home" element={<Dashboard />} />

      </Routes>
    </Router>
  );
};

export default App;
