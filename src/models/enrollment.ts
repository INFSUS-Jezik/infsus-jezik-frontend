// Enrollment status as string literal type based on API
import type {Student} from "./student.ts";

export type EnrollmentStatus = "ACTIVE" | "COMPLETED";

// Enrollment model based on API responses
export interface Enrollment {
    id: number;
    student: Student;
    courseId: number;
    enrollmentDate: string; // TIMESTAMP format
    status: EnrollmentStatus;
    grade1?: number; // SMALLINT, optional
    grade2?: number; // SMALLINT, optional
    grade3?: number; // SMALLINT, optional
    finalGrade?: number; // SMALLINT, optional
}

// DTO for creating a new enrollment (POST /api/courses/{courseId}/enrollments)
export interface EnrollmentCreateDTO {
    studentId: number;
    enrollmentDate?: string; // Optional, server can use current date
    status?: EnrollmentStatus; // Optional, server can use default
}

// DTO for updating an existing enrollment (PUT /api/enrollments/{id})
export interface EnrollmentUpdateDTO {
    status?: EnrollmentStatus;
    grade1?: number;
    grade2?: number;
    grade3?: number;
    finalGrade?: number;
}
