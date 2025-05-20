import apiClient from "./axiosConfig";
import type { Classroom, ClassroomCreateDTO, ClassroomUpdateDTO } from "../models/classroom";

export const getClassrooms = async (): Promise<Classroom[]> => {
    try {
        const response = await apiClient.get<Classroom[]>("/classrooms");
        return response.data;
    } catch (error) {
        console.error("Error fetching classrooms:", error);
        throw error;
    }
};

export const getClassroomById = async (id: number): Promise<Classroom> => {
    try {
        const response = await apiClient.get<Classroom>(`/classrooms/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching classroom with id ${id}:`, error);
        throw error;
    }
};

export const createClassroom = async (classroomData: ClassroomCreateDTO): Promise<Classroom> => {
    try {
        const response = await apiClient.post<Classroom>("/classrooms", classroomData);
        return response.data;
    } catch (error) {
        console.error("Error creating classroom:", error);
        throw error;
    }
};

export const updateClassroom = async (id: number, classroomData: ClassroomUpdateDTO): Promise<Classroom> => {
    try {
        const response = await apiClient.put<Classroom>(`/classrooms/${id}`, classroomData);
        return response.data;
    } catch (error) {
        console.error(`Error updating classroom with id ${id}:`, error);
        throw error;
    }
};

export const deleteClassroom = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`/classrooms/${id}`);
    } catch (error) {
        console.error(`Error deleting classroom with id ${id}:`, error);
        throw error;
    }
};
