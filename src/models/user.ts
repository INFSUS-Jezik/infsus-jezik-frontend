// User status type based on database enum
export type UserStatus = "active" | "inactive" | "unconfirmed" | "rejected";

// Base interface for users (both professors and students)
export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    userStatus: UserStatus;
    registrationDate: string; // ISO format date string
}
