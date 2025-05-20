import apiClient from "./axiosConfig";
import type { ProfessorListDTO } from "../models/professor";

export const getProfessorsList = async (): Promise<ProfessorListDTO[]> => {
    try {
        const response = await apiClient.get<ProfessorListDTO[]>("/professors/list");
        return response.data;
    } catch (error) {
        console.error("Error fetching professors list:", error);
        throw error;
    }
};
