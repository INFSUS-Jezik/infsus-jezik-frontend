import type { ClassroomCreateDTO, ClassroomUpdateDTO } from "../models/classroom";

interface ClassroomValidationErrors {
    name?: string;
    abbreviation?: string;
}

export const validateClassroom = (formData: ClassroomCreateDTO | ClassroomUpdateDTO): ClassroomValidationErrors => {
    const errors: ClassroomValidationErrors = {};

    if (!formData.name.trim()) {
        errors.name = "Classroom name is required.";
    }
    if (!formData.abbreviation.trim()) {
        errors.abbreviation = "Classroom abbreviation is required.";
    }

    return errors;
};
