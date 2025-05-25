/* eslint-disable  @typescript-eslint/no-explicit-any */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi, expect, afterEach, beforeEach, describe, test } from "vitest";
import CourseDetailPage from "../pages/CourseDetailPage";
import * as courseApi from "../api/courseApi";
import * as classroomApi from "../api/classroomApi";
import * as professorApi from "../api/professorApi";
import * as studentApi from "../api/studentApi";
import * as scheduleApi from "../api/scheduleApi";
import * as enrollmentApi from "../api/enrollmentApi";

// Mock all API modules
vi.mock("../api/courseApi");
vi.mock("../api/scheduleApi");
vi.mock("../api/enrollmentApi");
vi.mock("../api/classroomApi");
vi.mock("../api/professorApi");
vi.mock("../api/studentApi");

// Mock react-router-dom useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ courseId: "1" }), // Mock useParams directly for this test suite
    };
});

const mockCourseDetail = {
    id: 1,
    name: "Introduction to Programming",
    description: "Learn basic programming concepts",
    price: 299.99,
    professorId: 1,
    professor: { id: 1, fullName: "John Doe" },
    schedules: [
        {
            id: 1,
            courseId: 1,
            dayOfWeek: 1, // Monday
            startTime: "09:00",
            endTime: "11:00",
            classroom: { id: 1, name: "Computer Lab A", abbreviation: "CLA" },
        },
    ],
    enrollments: [
        {
            id: 1,
            student: {
                id: 1,
                firstName: "Alice",
                lastName: "Johnson",
                email: "alice.johnson@example.com",
                additionalContact: "1234567890",
                userStatus: "active" as const,
                registrationDate: "2023-01-01",
            },
            courseId: 1,
            enrollmentDate: "2023-01-15T10:00:00Z",
            status: "ACTIVE" as const,
            grade1: 85,
            grade2: 90,
            grade3: 88,
            finalGrade: 87,
        },
    ],
};

const mockProfessors = [{ id: 1, fullName: "John Doe" }];
const mockClassrooms = [{ id: 1, name: "Computer Lab A", abbreviation: "CLA" }];
const mockStudents = [
    {
        id: 1,
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@example.com",
        additionalContact: "1234567890",
        userStatus: "active" as const,
        registrationDate: "2023-01-01",
    },
];

beforeEach(() => {
    vi.mocked(courseApi.getCourseById).mockResolvedValue(mockCourseDetail);
    vi.mocked(professorApi.getProfessorsList).mockResolvedValue(mockProfessors);
    vi.mocked(classroomApi.getClassrooms).mockResolvedValue(mockClassrooms);
    vi.mocked(studentApi.getStudentsList).mockResolvedValue(mockStudents);
    vi.mocked(courseApi.updateCourse).mockResolvedValue(mockCourseDetail);
    vi.mocked(scheduleApi.createSchedule).mockResolvedValue({} as any);
    vi.mocked(scheduleApi.updateSchedule).mockResolvedValue({} as any);
    vi.mocked(scheduleApi.deleteSchedule).mockResolvedValue(undefined);
    vi.mocked(enrollmentApi.createEnrollment).mockResolvedValue({} as any);
    vi.mocked(enrollmentApi.updateEnrollment).mockResolvedValue({} as any);
    vi.mocked(enrollmentApi.deleteEnrollment).mockResolvedValue(undefined);

    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    vi.clearAllMocks();
});

describe("CourseDetailPage", () => {
    test("renders course detail page for existing course", async () => {
        render(
            <MemoryRouter initialEntries={["/courses/1"]}>
                <Routes>
                    <Route path="/courses/:courseId" element={<CourseDetailPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByText((content, element) => element?.textContent === "Name: Introduction to Programming")
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    (content, element) => element?.textContent === "Description: Learn basic programming concepts"
                )
            ).toBeInTheDocument();
            expect(
                screen.getByText((content, element) => element?.textContent === "Price: $299.99")
            ).toBeInTheDocument();
        });

        expect(screen.getByText("Schedules")).toBeInTheDocument();
        expect(screen.getByText("Enrollments")).toBeInTheDocument();
    });

    test("displays schedules section", async () => {
        render(
            <MemoryRouter initialEntries={["/courses/1"]}>
                <Routes>
                    <Route path="/courses/:courseId" element={<CourseDetailPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Schedules")).toBeInTheDocument();
            expect(screen.getByText(/Monday from 09:00 to 11:00/i)).toBeInTheDocument();
            expect(screen.getByText(/Classroom: Computer Lab A/i)).toBeInTheDocument();
        });
    });

    test("displays enrollments section", async () => {
        render(
            <MemoryRouter initialEntries={["/courses/1"]}>
                <Routes>
                    <Route path="/courses/:courseId" element={<CourseDetailPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Enrollments")).toBeInTheDocument();
            expect(screen.getByText(/Student: Alice Johnson/i)).toBeInTheDocument();
            expect(screen.getByText("ACTIVE", { selector: "span" })).toBeInTheDocument();
        });
    });

    test("handles API errors gracefully", async () => {
        vi.mocked(courseApi.getCourseById).mockRejectedValueOnce(new Error("Course not found"));

        render(
            <MemoryRouter initialEntries={["/courses/999"]}>
                <Routes>
                    <Route path="/courses/:courseId" element={<CourseDetailPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByText(/Failed to fetch course details or related data. Course not found/i)
            ).toBeInTheDocument();
        });
    });

    test("navigates back to courses list", async () => {
        render(
            <MemoryRouter initialEntries={["/courses/1"]}>
                <Routes>
                    <Route path="/courses/:courseId" element={<CourseDetailPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByText((content, element) => element?.textContent === "Name: Introduction to Programming")
            ).toBeInTheDocument();
        });

        const backButton = screen.getByRole("button", { name: "← Back to Courses" });
        fireEvent.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith("/courses");
    });
});
