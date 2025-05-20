import type { CourseCreateDTO, CourseUpdateDTO } from "../models/course";

interface CourseValidationErrors {
    name?: string;
    price?: string;
    professorId?: string;
}

export const validateCourse = (formData: CourseCreateDTO | CourseUpdateDTO): CourseValidationErrors => {
    const errors: CourseValidationErrors = {};

    if (!formData.name.trim()) {
        errors.name = "Course name is required.";
    }
    if (formData.price === null || formData.price === undefined || formData.price < 0) {
        errors.price = "Price must be a non-negative number.";
    }
    if (!formData.professorId) {
        errors.professorId = "Professor is required.";
    }

    return errors;
};
