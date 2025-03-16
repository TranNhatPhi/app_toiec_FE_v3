import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import useExamDetail from "../hooks/useExamDetail";
import { submitExamResult } from "../services/examResultService";
import "../assets/styles/examDetail.css"; // Import CSS

const ExamDetail: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const { examDetail, loading, error } = useExamDetail(Number(examId));

    const LOCAL_STORAGE_KEY_TIME = `exam_time_${examId}`;
    const LOCAL_STORAGE_KEY_ANSWERS = `exam_answers_${examId}`;

    // ✅ Lấy thời gian làm bài từ `localStorage`
    const [timeLeft, setTimeLeft] = useState<number | null>(() => {
        return Number(localStorage.getItem(LOCAL_STORAGE_KEY_TIME)) || null;
    });

    // ✅ Lấy danh sách đáp án đã chọn từ `localStorage`
    const [answers, setAnswers] = useState<{ [key: number]: string }>(() => {
        const savedAnswers = localStorage.getItem(LOCAL_STORAGE_KEY_ANSWERS);
        return savedAnswers ? JSON.parse(savedAnswers) : {};
    });

    const [isSubmitting, setIsSubmitting] = useState(false); // ✅ Trạng thái đang nộp bài
    const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (examDetail?.duration && timeLeft === null) {
            const savedTime = Number(localStorage.getItem(LOCAL_STORAGE_KEY_TIME)) || examDetail.duration * 60;
            setTimeLeft(savedTime);
        }
    }, [examDetail]);

    // ✅ Giảm thời gian mỗi giây và lưu vào `localStorage`
    useEffect(() => {
        if (timeLeft === null) return;

        if (timeLeft > 0) {
            localStorage.setItem(LOCAL_STORAGE_KEY_TIME, String(timeLeft));
            const timer = setTimeout(() => {
                setTimeLeft((prevTime) => (prevTime !== null ? prevTime - 1 : null));
            }, 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            alert("⏳ Hết thời gian! Bài thi sẽ được tự động nộp.");
            handleSubmitExam();
        }
    }, [timeLeft]);

    // ✅ Hàm xử lý khi chọn đáp án (lưu vào state + localStorage)
    const handleSelectAnswer = (questionIndex: number, option: string) => {
        setAnswers((prevAnswers) => {
            const updatedAnswers = { ...prevAnswers, [questionIndex]: option };
            localStorage.setItem(LOCAL_STORAGE_KEY_ANSWERS, JSON.stringify(updatedAnswers));
            return updatedAnswers;
        });
    };

    // ✅ Định dạng thời gian
    const formatTime = (seconds: number | null) => {
        if (seconds === null) return "Đang tải...";
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    // ✅ Hàm cuộn đến câu hỏi được chọn
    const scrollToQuestion = (index: number) => {
        questionRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    // ✅ Hàm nộp bài thi
    const handleSubmitExam = async () => {
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

        // ✅ Công thức đúng để tính thời gian hoàn thành
        const completedTime = examDetail.duration - Math.floor((timeLeft || 0) / 60);

        // ✅ Chuẩn bị dữ liệu gửi lên API
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

            // ✅ Reset thời gian về mặc định
            const resetDuration = examDetail.duration * 60; // Chuyển phút -> giây
            setTimeLeft(resetDuration);
            localStorage.setItem(LOCAL_STORAGE_KEY_TIME, String(resetDuration));

            // ✅ Xóa đáp án đã chọn
            setAnswers({});
            localStorage.removeItem(LOCAL_STORAGE_KEY_ANSWERS);

            // ✅ Reload trang hoặc chuyển hướng đến trang kết quả
            setTimeout(() => {
                window.location.href = "/exam-results";
            }, 500); // Đợi 0.5s trước khi chuyển trang

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




    if (loading) return <p>Loading exam...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!examDetail) return <p>No exam data available.</p>;

    return (
        <div className="exam-page">
            {/* ✅ Sidebar chứa danh sách câu hỏi theo dạng lưới (grid) */}
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
                {/* ✅ Nút Nộp bài (Di chuyển sang bên phải) */}
                <button className="submit-button" onClick={handleSubmitExam} disabled={isSubmitting || timeLeft === 0}>
                    {isSubmitting ? "Đang nộp..." : "📝 Nộp bài"}
                </button>
            </aside>

            {/* ✅ Nội dung chính */}
            <div className="exam-container">
                <h2>{examDetail.title}</h2>

                {/* ✅ Audio nghe bài thi */}
                <div className="audio-player">
                    <strong>Nghe đoạn hội thoại:</strong>
                    <audio controls>
                        <source src={`http://localhost:3000/listen/${examDetail.audio}`}
                            type="audio/mpeg" />
                        Trình duyệt của bạn không hỗ trợ phát audio.
                    </audio>
                </div>

                {/* ✅ Hiển thị thời gian làm bài */}
                <div className="timer">
                    <strong>Thời gian còn lại:</strong> {formatTime(timeLeft)}
                </div>

                {/* ✅ Danh sách câu hỏi */}
                {examDetail.parts.map((part) => (
                    <div key={part.part_id} className="exam-part">
                        <h3>Phần {part.part_number}</h3>
                        {part.questions.map((q, index) => {
                            const questionIndex = examDetail.parts
                                .slice(0, part.part_id - 1)
                                .reduce((acc, p) => acc + p.questions.length, 0) + index;

                            // ✅ Nếu `image_filename` tồn tại, sử dụng nó làm URL ảnh; nếu không thì để null
                            const imageUrl = q.image_filename ? `${q.image_filename}` : null;
                            // console.log('hình ảnh:', imageUrl);
                            return (
                                <div
                                    key={questionIndex}
                                    className="question"
                                    ref={(el) => {
                                        questionRefs.current[questionIndex] = el;
                                    }}
                                >
                                    {imageUrl && (
                                        <div className="question-image">
                                            <img src={imageUrl} alt={`Question ${questionIndex + 1}`} />
                                        </div>
                                    )}
                                    <p>{questionIndex + 1}. {q.question_text}</p>
                                    <ul>
                                        {["A", "B", "C", "D"].map((option) => (
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
