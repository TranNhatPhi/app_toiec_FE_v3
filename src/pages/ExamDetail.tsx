import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import useExamDetail from "../hooks/useExamDetail"; // Custom hook that fetches exam details
import { submitExamResult } from "../services/examResultService";
import "../assets/styles/examDetail.css";

const ExamDetail: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const [expired, setExpired] = useState(false);  // Track if the exam is expired (initially set to false)
    const { examDetail, loading, error } = useExamDetail(Number(examId), expired); // Fetch exam details with expired state

    const LOCAL_STORAGE_KEY_TIME = `exam_time_${examId}`;
    const LOCAL_STORAGE_KEY_ANSWERS = `exam_answers_${examId}`;
    const LOCAL_STORAGE_KEY_START = `exam_start_${examId}`;

    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        // Lấy câu trả lời từ localStorage và cập nhật state
        const savedAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_ANSWERS);
        if (savedAnswers) {
            setAnswers(JSON.parse(savedAnswers));
        }
    }, []); // Chạy chỉ một lần khi component load lần đầu
    useEffect(() => {
        const isSubmitted = localStorage.getItem(`exam_submitted_${examId}`);
        if (isSubmitted === "true") {

            alert("✅ Bài thi đã được nộp hoặc hết thời gian. Bạn không thể làm lại bài này.");
            window.location.href = "/exam-results";
            localStorage.setItem(`exam_submitted_${examId}`, "false"); // ✅ Đánh dấu đã vào thi
        }
    }, [examId]);
    // Track time left
    useEffect(() => {
        if (examDetail?.duration) {
            const now = Date.now();
            let startTime = Number(localStorage.getItem(LOCAL_STORAGE_KEY_START));

            if (!startTime) {
                startTime = now;
                localStorage.setItem(LOCAL_STORAGE_KEY_START, String(startTime));
            }

            const timePassed = Math.floor((now - startTime) / 1000);
            const remaining = examDetail.duration * 60 - timePassed;

            setTimeLeft(remaining > 0 ? remaining : 0);
        }
    }, [examDetail]);

    useEffect(() => {
        if (timeLeft === null) return;

        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(prevTime => (prevTime !== null ? prevTime - 1 : null));
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            alert("⏳ Hết thời gian! Bài thi sẽ được tự động nộp.");
            setExpired(true); // Set expired when time is up
            handleSubmitExam(true); // Automatically submit when time expires
        }
    }, [timeLeft]);

    const handleSelectAnswer = (questionIndex: number, option: string) => {
        setAnswers((prevAnswers) => {
            const updatedAnswers = { ...prevAnswers, [questionIndex]: option };
            localStorage.setItem(LOCAL_STORAGE_KEY_ANSWERS, JSON.stringify(updatedAnswers));
            return updatedAnswers;
        });
    };

    const formatTime = (seconds: number | null) => {
        if (seconds === null) return "Đang tải...";
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const scrollToQuestion = (index: number) => {
        questionRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
    };


    const handleSubmitExam = async (expired = false) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        if (!examDetail) {
            alert("❌ Lỗi: Không thể nộp bài vì dữ liệu bài thi chưa được tải.");
            setIsSubmitting(false);
            return;
        }

        const confirmSubmit = window.confirm("🚀 Bạn có chắc chắn muốn nộp bài?");
        if (!confirmSubmit) {
            setIsSubmitting(false);
            return;
        }

        // Set expired to true when time is up or user submits
        if (!expired) {
            setExpired(true);
        }

        const startTime = Number(localStorage.getItem(LOCAL_STORAGE_KEY_START));
        const now = Date.now();
        const completedTime = Math.floor((now - startTime) / 60000);

        const userAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
            question_id: Number(questionId),
            selected_answer: selectedAnswer,
        }));


        try {
            const result = await submitExamResult(Number(examId), userAnswers, completedTime);

            alert(
                `✅ Nộp bài thành công!\n` +
                `✔️ Số câu đúng: ${result.correct_answers}\n` +
                `❌ Số câu sai: ${result.wrong_answers}\n` +
                `❓ Câu chưa trả lời: ${result.unanswered_questions}\n` +
                `🏆 Điểm tổng: ${result.total_score}\n` +
                `⏳ Thời gian hoàn thành: ${completedTime} phút`
            );
            localStorage.setItem(`exam_submitted_${examId}`, "true"); // ✅ Đánh dấu đã nộp
            const resetDuration = examDetail.duration * 60;
            setTimeLeft(resetDuration);
            localStorage.setItem(LOCAL_STORAGE_KEY_TIME, String(resetDuration));

            setAnswers({});
            localStorage.removeItem(LOCAL_STORAGE_KEY_ANSWERS);
            localStorage.removeItem(LOCAL_STORAGE_KEY_START);

            setTimeout(() => {
                window.location.href = "/exam-results";
            }, 500);
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(`❌ Lỗi khi nộp bài: ${error.message}`);
            } else {
                alert("❌ Đã xảy ra lỗi không xác định.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Start Exam Button: Will trigger expired=true and fetch data
    const handleStartExam = async () => {
        setExpired(true); // Set expired to true when the user clicks on start exam
    };

    if (loading) return <p>Loading exam...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!examDetail) return <p>No exam data available.</p>;

    return (
        <div className="exam-page">
            <aside className="sidebar">
                <h3>Danh sách câu hỏi</h3>
                {examDetail.parts.map((part, partIndex) => (
                    <div key={part.part_id} className="question-group">
                        <h4>Phần {part.part_number}</h4>
                        <div className="question-grid">
                            {part.questions.map((_, index) => {
                                const questionIndex = examDetail.parts
                                    .slice(0, partIndex)
                                    .reduce((acc, p) => acc + p.questions.length, 0) + index;

                                return (
                                    <button
                                        key={questionIndex}
                                        className={`question-button ${answers[questionIndex] ? "answered" : ""}`}
                                        onClick={() => scrollToQuestion(questionIndex)}
                                    >
                                        {questionIndex + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
                <button className="submit-button" onClick={() => handleSubmitExam(false)} disabled={isSubmitting || timeLeft === 0}>
                    {isSubmitting ? "Đang nộp..." : "📝 Nộp bài"}
                </button>

            </aside>

            <div className="exam-container">
                <h2>{examDetail.title}</h2>

                <div className="audio-player">
                    <strong>Nghe đoạn hội thoại:</strong>
                    <audio controls>
                        <source src={`http://localhost:3000/listen/${examDetail.audio}`} type="audio/mpeg" />
                        Trình duyệt của bạn không hỗ trợ phát audio.
                    </audio>
                </div>

                <div className="timer">
                    <strong>Thời gian còn lại:</strong> {formatTime(timeLeft)}
                </div>

                {examDetail.parts.map((part) => (
                    <div key={part.part_id} className="exam-part">
                        <h3>Phần {part.part_number}</h3>
                        {part.questions.map((q, index) => {
                            const questionIndex = examDetail.parts
                                .slice(0, part.part_id - 1)
                                .reduce((acc, p) => acc + p.questions.length, 0) + index;


                            return (
                                <div
                                    key={questionIndex}
                                    className="question"
                                    ref={(el) => {
                                        questionRefs.current[questionIndex] = el;
                                    }}
                                >
                                    {q.image_filename && (
                                        <div className="question-image">
                                            <img
                                                src={`http://localhost:3000/listen/part1/${q.image_filename}`}
                                                alt={`Question ${questionIndex + 1}`}
                                            />
                                        </div>
                                    )}
                                    <p>{questionIndex + 1}. {q.question_text}</p>
                                    <ul>
                                        {["A", "B", "C", "D"]
                                            .filter(option => q[`option${option}` as keyof typeof q])
                                            .map((option) => (
                                                <li key={option} onClick={() => handleSelectAnswer(questionIndex, option)}>
                                                    <label className="radio-container">
                                                        <input type="radio" name={`q${questionIndex}`} value={option} checked={answers[questionIndex] === option} />
                                                        <span>{option}. {q[`option${option}` as keyof typeof q]}</span>
                                                    </label>
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExamDetail;
