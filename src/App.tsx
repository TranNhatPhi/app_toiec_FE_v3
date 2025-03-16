import "./assets/styles/global.css";

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ExamResults from "./pages/ExamResult"; // ✅ Trang hiển thị kết quả bài thi
import ExamDetail from "./pages/ExamDetail";

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
      </Routes>
    </Router>
  );
};

export default App;
