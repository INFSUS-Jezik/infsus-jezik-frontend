// Classroom model based on API responses
export interface Classroom {
    id: number;
    name: string;
    abbreviation: string;
}

// DTO for creating a new classroom (POST /api/classrooms)
export interface ClassroomCreateDTO {
    name: string;
    abbreviation: string;
}

// DTO for updating an existing classroom (PUT /api/classrooms/{id})
export interface ClassroomUpdateDTO {
    name: string;
    abbreviation: string;
}
