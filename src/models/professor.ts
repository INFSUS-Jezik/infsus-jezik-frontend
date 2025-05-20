import type { User } from "./user";

// Professor model based on database schema
export interface Professor extends User {
    bio?: string;
}

// DTO for professor list (used in dropdowns, GET /api/professors/list)
export interface ProfessorListDTO {
    id: number;
    fullName: string;
}
