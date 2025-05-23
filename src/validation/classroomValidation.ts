import type { Classroom, ClassroomCreateDTO, ClassroomUpdateDTO } from "../models/classroom";

interface ClassroomValidationErrors {
    name?: string;
    abbreviation?: string;
}

export const validateClassroom = (
    formData: ClassroomCreateDTO | ClassroomUpdateDTO,
    existingClassrooms: Classroom[] = [],
    editingClassroomId?: number | null
): ClassroomValidationErrors => {
    const errors: ClassroomValidationErrors = {};

    if (!formData.name.trim()) {
        errors.name = "Classroom name is required.";
    }
    if (!formData.abbreviation.trim()) {
        errors.abbreviation = "Classroom abbreviation is required.";
    } else {
        // Check for unique abbreviation
        const duplicateClassroom = existingClassrooms.find(
            classroom =>
                classroom.abbreviation.toLowerCase() === formData.abbreviation.toLowerCase() &&
                classroom.id !== editingClassroomId
        );

        if (duplicateClassroom) {
            errors.abbreviation = "This abbreviation is already in use by another classroom.";
        }
    }

    return errors;
};
