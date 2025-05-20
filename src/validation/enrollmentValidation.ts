import type { EnrollmentValidationInput } from "../pages/CourseDetailPage";

interface EnrollmentValidationErrors {
    studentId?: string;
    status?: string;
    grade1?: string;
    grade2?: string;
    grade3?: string;
    finalGrade?: string;
}

const isValidGrade = (grade: number | undefined): boolean => {
    if (grade === undefined || grade === null) return true; // Optional grades are valid if not provided
    return grade >= 1 && grade <= 5;
};

export const validateEnrollment = (formData: EnrollmentValidationInput): EnrollmentValidationErrors => {
    const errors: EnrollmentValidationErrors = {};

    // For EnrollmentCreateDTO, studentId is required.
    // For EnrollmentUpdateDTO, studentId is not part of the DTO.
    if ("studentId" in formData && !formData.studentId) {
        errors.studentId = "Student is required.";
    }

    if (formData.status && !["active", "completed"].includes(formData.status)) {
        errors.status = "Status must be either 'active' or 'completed'.";
    }

    if (!isValidGrade(formData.grade1)) {
        errors.grade1 = "Grade 1 must be between 1 and 5.";
    }
    if (!isValidGrade(formData.grade2)) {
        errors.grade2 = "Grade 2 must be between 1 and 5.";
    }
    if (!isValidGrade(formData.grade3)) {
        errors.grade3 = "Grade 3 must be between 1 and 5.";
    }
    if (!isValidGrade(formData.finalGrade)) {
        errors.finalGrade = "Final Grade must be between 1 and 5.";
    }

    return errors;
};
