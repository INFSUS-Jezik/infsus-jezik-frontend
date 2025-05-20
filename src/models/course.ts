import type { Professor } from "./professor";
import type { Schedule } from "./schedule";
import type { Enrollment } from "./enrollment";

// Course model based on API responses
export interface Course {
    id: number;
    name: string;
    description?: string;
    price: number;
    professorId: number;
    professor?: Professor; // Full Professor object for list view
    schedules?: Schedule[];
    enrollments?: Enrollment[];
}

// DTO for creating a new course (POST /api/courses)
export interface CourseCreateDTO {
    name: string;
    description?: string;
    price: number;
    professorId: number;
}

// DTO for updating an existing course (PUT /api/courses/{id})
export interface CourseUpdateDTO {
    name: string;
    description?: string;
    price: number;
    professorId: number;
}

// Optional: Course detail response might include professorName separately
export interface CourseDetailDTO extends Course {
    professorName?: string;
}
