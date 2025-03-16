import { useState, useEffect } from "react";
import { ExamDetail } from "../models/examDetail";
import { fetchExamDetail } from "../services/examDetailService";

const useExamDetail = (examId: number) => {
    const [examDetail, setExamDetail] = useState<ExamDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getExamDetail = async () => {
            try {
                const data = await fetchExamDetail(examId);
                setExamDetail(data);
                setLoading(false);
            } catch (error) {
                setError("Failed to load exam details");
                setLoading(false);
            }
        };
        getExamDetail();
    }, [examId]);

    return { examDetail, loading, error };
};

export default useExamDetail;
