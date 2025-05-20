import apiClient from "./axiosConfig";
import type { Course, CourseCreateDTO, CourseUpdateDTO } from "../models/course";

export const getCourses = async (): Promise<Course[]> => {
    try {
        const response = await apiClient.get<Course[]>("/courses");
        return response.data;
    } catch (error) {
        console.error("Error fetching courses:", error);
        throw error;
    }
};

export const getCourseById = async (id: number): Promise<Course> => {
    try {
        const response = await apiClient.get<Course>(`/courses/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching course with id ${id}:`, error);
        throw error;
    }
};

export const createCourse = async (courseData: CourseCreateDTO): Promise<Course> => {
    try {
        const response = await apiClient.post<Course>("/courses", courseData);
        return response.data;
    } catch (error) {
        console.error("Error creating course:", error);
        throw error;
    }
};

export const updateCourse = async (id: number, courseData: CourseUpdateDTO): Promise<Course> => {
    try {
        const response = await apiClient.put<Course>(`/courses/${id}`, courseData);
        return response.data;
    } catch (error) {
        console.error(`Error updating course with id ${id}:`, error);
        throw error;
    }
};

export const deleteCourse = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`/courses/${id}`);
    } catch (error) {
        console.error(`Error deleting course with id ${id}:`, error);
        throw error;
    }
};
