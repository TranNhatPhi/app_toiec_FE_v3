import { useState, useEffect } from "react";
import { ExamDetail } from "../models/examDetail";
import { fetchExamDetail } from "../services/examDetailService"; // Assuming this is your API call

const useExamDetail = (examId: number, expired: boolean) => {
    const [examDetail, setExamDetail] = useState<ExamDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getExamDetail = async () => {
            try {
                setLoading(true);
                const data = await fetchExamDetail(examId, expired); // Pass expired state to the API call
                if (!data) {
                    setError("Dữ liệu không hợp lệ hoặc không có bài thi");
                    setExamDetail(null);
                } else {
                    setExamDetail(data);
                }
            } catch (error) {
                setError("Lỗi khi tải dữ liệu bài thi");
                setExamDetail(null);
            } finally {
                setLoading(false);
            }
        };

        getExamDetail();
    }, [examId, expired]); // Trigger the effect whenever examId or expired changes

    return { examDetail, loading, error };
};

export default useExamDetail;
