import { ExamDetail } from "../models/examDetail";

const API_URL = "http://localhost:5000/api/exams";

export const fetchExamDetail = async (examId: number): Promise<ExamDetail> => {
    try {
        const response = await fetch(`${API_URL}/${examId}/questions`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
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
        console.error("Error fetching exam details:", error);
        throw error;
    }
};
