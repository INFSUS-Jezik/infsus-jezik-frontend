import apiClient from "./axiosConfig";
import type { StudentListDTO } from "../models/student";

export const getStudentsList = async (): Promise<StudentListDTO> => {
    try {
        const response = await apiClient.get<StudentListDTO>("/students/list");
        return response.data;
    } catch (error) {
        console.error("Error fetching students list:", error);
        throw error;
    }
};
