import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, expect, afterEach, beforeEach, describe, test } from "vitest";
import CourseListPage from "../pages/CourseListPage";
import * as courseApi from "../api/courseApi";
import * as professorApi from "../api/professorApi";

vi.mock("../api/courseApi");
vi.mock("../api/professorApi");

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockCourses = [
    {
        id: 1,
        name: "Introduction to Programming",
        description: "Learn basic programming concepts",
        price: 299.99,
        professorId: 1,
        professor: { id: 1, fullName: "John Doe" },
        schedules: [],
        enrollments: [],
    },
    {
        id: 2,
        name: "Advanced Mathematics",
        description: "Advanced mathematical topics",
        price: 399.99,
        professorId: 2,
        professor: { id: 2, fullName: "Jane Smith" },
        schedules: [],
        enrollments: [],
    },
];

const mockProfessors = [
    { id: 1, fullName: "John Doe" },
    { id: 2, fullName: "Jane Smith" },
];

beforeEach(() => {
    vi.mocked(courseApi.getCourses).mockResolvedValue(mockCourses);
    vi.mocked(professorApi.getProfessorsList).mockResolvedValue(mockProfessors);
    vi.mocked(courseApi.createCourse).mockResolvedValue({
        id: 3,
        name: "New Course",
        description: "New course description",
        price: 199.99,
        professorId: 1,
        professor: { id: 1, fullName: "John Doe" },
        schedules: [],
        enrollments: [],
    });
    vi.mocked(courseApi.updateCourse).mockResolvedValue({
        id: 1,
        name: "Updated Course",
        description: "Updated description",
        price: 349.99,
        professorId: 1,
        professor: { id: 1, fullName: "John Doe" },
        schedules: [],
        enrollments: [],
    });
    vi.mocked(courseApi.deleteCourse).mockResolvedValue(undefined);
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
});

describe("CourseListPage", () => {
    test("renders course list page", async () => {
        render(
            <MemoryRouter>
                <CourseListPage />
            </MemoryRouter>
        );

        expect(screen.getByText("Courses")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Add New Course" })).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText("Introduction to Programming")).toBeInTheDocument();
            expect(screen.getByText("Advanced Mathematics")).toBeInTheDocument();
        });
    });

    test("search input filters courses", async () => {
        render(
            <MemoryRouter>
                <CourseListPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Introduction to Programming")).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText("Search by name, description, or professor...");
        fireEvent.change(searchInput, { target: { value: "Programming" } });

        expect(screen.getByText("Introduction to Programming")).toBeInTheDocument();
        expect(screen.queryByText("Advanced Mathematics")).not.toBeInTheDocument();
    });

    test("opens add course modal", async () => {
        render(
            <MemoryRouter>
                <CourseListPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Introduction to Programming")).toBeInTheDocument();
        });

        const addButton = screen.getByRole("button", { name: "Add New Course" });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText(/Add New Course/i, { selector: "h3" })).toBeInTheDocument();
        });

        // FIX: Changed from getByLabelText to getByRole('textbox', { name: /Name/i })
        // Based on the DOM: <input name="name" ... />
        expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();
    });

    test("handles API errors gracefully", async () => {
        vi.mocked(courseApi.getCourses).mockRejectedValue(new Error("API Error"));

        render(
            <MemoryRouter>
                <CourseListPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            // The error message from getErrorMessage is "API Error" in this mock
            expect(screen.getByText(/Failed to fetch courses. Please try again later. API Error/i)).toBeInTheDocument();
        });
    });
});
