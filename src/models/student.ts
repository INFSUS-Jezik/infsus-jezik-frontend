import type { User } from "./user";

// Student model based on database schema
export interface Student extends User {
    additionalContact?: string;
}

// For GET /api/students/list endpoint that returns full student objects
export type StudentListDTO = Student[];
