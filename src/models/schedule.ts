// Schedule model based on API responses
import type {Classroom} from "./classroom.ts";

export interface Schedule {
    id: number;
    courseId: number;
    classroom: Classroom;
    dayOfWeek: number; // INTEGER in backend
    startTime: string; // TIME format, e.g. "09:00"
    endTime: string; // TIME format, e.g. "11:00"
}

// DTO for creating a new schedule (POST /api/courses/{courseId}/schedules)
export interface ScheduleCreateDTO {
    classroomId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

// DTO for updating an existing schedule (PUT /api/schedules/{id})
export interface ScheduleUpdateDTO {
    classroomId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}
