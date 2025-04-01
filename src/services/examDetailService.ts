import { ExamDetail } from "../models/examDetail";

const API_URL = "http://localhost:5000/api/exams";

/**
 * Lấy chi tiết đề thi. Nếu `expired = true` thì yêu cầu random lại đề.
 */
export const fetchExamDetail = async (examId: number, expired = true): Promise<ExamDetail> => {
    try {
        // Build the API URL with query string for expired flag
        const url = `${API_URL}/${examId}/questions${expired ? "?expired=true" : ""}`;

        // Make the API request
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Check if the response status is OK (200-299)
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        // Parse the response JSON
        const result = await response.json();

        // Ensure that the response data is in the expected format
        if (!result || !result.data) {
            throw new Error("Invalid API response: missing 'data'");
        }

        return result.data; // Return the exam details
    } catch (error) {
        // Log error for debugging purposes
        console.error("Error fetching exam details:", error);

        // Rethrow the error for higher level handling
        throw error;
    }
};
