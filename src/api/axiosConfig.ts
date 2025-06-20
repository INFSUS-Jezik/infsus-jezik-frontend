import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:8080/api", // As per techContext.md
    headers: {
        "Content-Type": "application/json",
    },
});

export default apiClient;
