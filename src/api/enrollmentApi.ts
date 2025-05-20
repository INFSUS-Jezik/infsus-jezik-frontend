import apiClient from "./axiosConfig";
import type { Enrollment, EnrollmentCreateDTO, EnrollmentUpdateDTO } from "../models/enrollment";

export const createEnrollment = async (courseId: number, enrollmentData: EnrollmentCreateDTO): Promise<Enrollment> => {
    try {
        const response = await apiClient.post<Enrollment>(`/courses/${courseId}/enrollments`, enrollmentData);
        return response.data;
    } catch (error) {
        console.error(`Error creating enrollment for course id ${courseId}:`, error);
        throw error;
    }
};

export const updateEnrollment = async (id: number, enrollmentData: EnrollmentUpdateDTO): Promise<Enrollment> => {
    try {
        const response = await apiClient.put<Enrollment>(`/enrollments/${id}`, enrollmentData);
        return response.data;
    } catch (error) {
        console.error(`Error updating enrollment with id ${id}:`, error);
        throw error;
    }
};

export const deleteEnrollment = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`/enrollments/${id}`);
    } catch (error) {
        console.error(`Error deleting enrollment with id ${id}:`, error);
        throw error;
    }
};
