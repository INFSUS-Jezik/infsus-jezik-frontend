import apiClient from "./axiosConfig";
import type { Schedule, ScheduleCreateDTO, ScheduleUpdateDTO } from "../models/schedule";

export const createSchedule = async (courseId: number, scheduleData: ScheduleCreateDTO): Promise<Schedule> => {
    try {
        const response = await apiClient.post<Schedule>(`/courses/${courseId}/schedules`, scheduleData);
        return response.data;
    } catch (error) {
        console.error(`Error creating schedule for course id ${courseId}:`, error);
        throw error;
    }
};

export const updateSchedule = async (id: number, scheduleData: ScheduleUpdateDTO): Promise<Schedule> => {
    try {
        const response = await apiClient.put<Schedule>(`/schedules/${id}`, scheduleData);
        return response.data;
    } catch (error) {
        console.error(`Error updating schedule with id ${id}:`, error);
        throw error;
    }
};

export const deleteSchedule = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`/schedules/${id}`);
    } catch (error) {
        console.error(`Error deleting schedule with id ${id}:`, error);
        throw error;
    }
};
