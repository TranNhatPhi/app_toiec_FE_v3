export const fetchUserCount = async (): Promise<number> => {
    try {
        const response = await fetch("http://localhost:5000/api/users/count");

        if (!response.ok) {
            throw new Error("Lỗi khi gọi API user count");
        }

        const data = await response.json();

        // Đảm bảo đúng key
        return data.total;
    } catch (err) {
        console.error("❌ Lỗi khi fetch tổng số người dùng:", err);
        return 0;
    }
};
