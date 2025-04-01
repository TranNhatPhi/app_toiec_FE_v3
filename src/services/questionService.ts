export const getTotalquestion = async () => {
    const res = await fetch("http://localhost:5000/api/questions/countallquestion");
    const json = await res.json();
    return json.data; // Trả về mảng [{date, count}]
};