import type { ScheduleCreateDTO, ScheduleUpdateDTO } from "../models/schedule";

interface ScheduleValidationErrors {
    classroomId?: string;
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
    timeOrder?: string; // For endTime > startTime validation
}

const isValidTimeFormat = (time: string): boolean => {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
};

export const validateSchedule = (formData: ScheduleCreateDTO | ScheduleUpdateDTO): ScheduleValidationErrors => {
    const errors: ScheduleValidationErrors = {};

    if (!formData.classroomId) {
        errors.classroomId = "Classroom is required.";
    }
    if (
        formData.dayOfWeek === null ||
        formData.dayOfWeek === undefined ||
        formData.dayOfWeek < 0 ||
        formData.dayOfWeek > 6
    ) {
        errors.dayOfWeek = "Day of the week is required and must be valid.";
    }
    if (!formData.startTime) {
        errors.startTime = "Start time is required.";
    } else if (!isValidTimeFormat(formData.startTime)) {
        errors.startTime = "Start time must be in HH:MM format.";
    }
    if (!formData.endTime) {
        errors.endTime = "End time is required.";
    } else if (!isValidTimeFormat(formData.endTime)) {
        errors.endTime = "End time must be in HH:MM format.";
    }

    if (
        formData.startTime &&
        formData.endTime &&
        isValidTimeFormat(formData.startTime) &&
        isValidTimeFormat(formData.endTime)
    ) {
        if (formData.endTime <= formData.startTime) {
            errors.timeOrder = "End time must be after start time.";
        }
    }

    return errors;
};
