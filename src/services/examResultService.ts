import { ExamResult } from "../models/examResult";

const API_URL = "http://localhost:5000/api/exam-results"; // 🔹 Endpoint chính

/**
 * 📝 Gửi bài thi lên Server
 * @param examId ID của bài thi
 * @param answers Danh sách câu trả lời
 * @param completedTime Thời gian hoàn thành bài thi
 * @returns Kết quả bài thi từ server
 */
const getAccessToken = (): string | null => {
    const token = localStorage.getItem("token"); // Đảm bảo đúng key
    if (!token) {
        alert("❌ Bạn chưa đăng nhập! Vui lòng đăng nhập lại.");
        return null;
    }
    return token;
};
export const submitExamResult = async (examId: number, answers: any[], completedTime: number) => {
    const token = getAccessToken();
    if (!token) throw new Error("Không có accessToken!");

    try {
        const response = await fetch("http://localhost:5000/api/exam-results/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ exam_id: examId, answers, completed_time: completedTime })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.data; // ✅ Trả về kết quả từ API
    } catch (error) {
        console.error("❌ Error submitting exam result:", error);
        throw error;
    }
};


/**
 * 🏆 Lấy kết quả bài thi theo ID
 * @param resultId ID của kết quả bài thi
 * @returns Chi tiết kết quả bài thi
 */
export const getExamResultById = async (resultId: number): Promise<ExamResult> => {
    try {
        const response = await fetch(`${API_URL}/${resultId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.data) {
            throw new Error("Invalid API response: missing 'data'");
        }

        return result.data;
    } catch (error) {
        console.error("❌ Error fetching exam result:", error);
        throw error;
    }
};

/**
 * 📋 Lấy danh sách kết quả bài thi của người dùng
 * @param userId ID của người dùng
 * @returns Danh sách kết quả bài thi của user
 */
export const getExamResultsByUserId = async (userId: number): Promise<ExamResult[]> => {
    try {
        const response = await fetch(`${API_URL}/user/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.data) {
            throw new Error("Invalid API response: missing 'data'");
        }

        return result.data;
    } catch (error) {
        console.error("❌ Error fetching exam results by user ID:", error);
        throw error;
    }
};
