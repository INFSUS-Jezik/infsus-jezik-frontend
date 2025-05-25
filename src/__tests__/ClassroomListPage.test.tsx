import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, expect, beforeEach, afterEach, describe, test } from "vitest";
import ClassroomListPage from "../pages/ClassroomListPage";
import * as classroomApi from "../api/classroomApi";

// Mock the API module
vi.mock("../api/classroomApi");

const mockClassrooms = [
    { id: 1, name: "Computer Lab A", abbreviation: "CLA" },
    { id: 2, name: "Mathematics Room", abbreviation: "MR" },
];

beforeEach(() => {
    vi.mocked(classroomApi.getClassrooms).mockResolvedValue(mockClassrooms);
    vi.mocked(classroomApi.createClassroom).mockResolvedValue({ id: 3, name: "New Room", abbreviation: "NR" });
    vi.mocked(classroomApi.updateClassroom).mockResolvedValue({ id: 1, name: "Updated Room", abbreviation: "UR" });
    vi.mocked(classroomApi.deleteClassroom).mockResolvedValue(undefined);
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
});

describe("ClassroomListPage", () => {
    test("renders classroom list page", async () => {
        render(
            <MemoryRouter>
                <ClassroomListPage />
            </MemoryRouter>
        );

        expect(screen.getByText("Classrooms")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Add New Classroom" })).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText("Computer Lab A")).toBeInTheDocument();
            expect(screen.getByText("Mathematics Room")).toBeInTheDocument();
        });
    });

    test("search input filters classrooms", async () => {
        render(
            <MemoryRouter>
                <ClassroomListPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Computer Lab A")).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText("Search by name or abbreviation...");
        fireEvent.change(searchInput, { target: { value: "Computer" } });

        expect(screen.getByText("Computer Lab A")).toBeInTheDocument();
        expect(screen.queryByText("Mathematics Room")).not.toBeInTheDocument();
    });

    test("opens add classroom modal", async () => {
        render(
            <MemoryRouter>
                <ClassroomListPage />
            </MemoryRouter>
        );

        const addButton = screen.getByRole("button", { name: "Add New Classroom" });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText(/Add New Classroom/i, { selector: "h3" })).toBeInTheDocument();
        });

        expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();
    });

    test("creates new classroom successfully", async () => {
        render(
            <MemoryRouter>
                <ClassroomListPage />
            </MemoryRouter>
        );

        const addButton = screen.getByRole("button", { name: "Add New Classroom" });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText(/Add New Classroom/i, { selector: "h3" })).toBeInTheDocument();
        });

        const nameInput = screen.getByRole("textbox", { name: /name/i }); // targets input with name="name"
        const abbreviationInput = screen.getByRole("textbox", { name: /abbreviation/i }); // targets input with name="abbreviation"

        const submitButton = screen.getByRole("button", { name: "Add Classroom" });

        fireEvent.change(nameInput, { target: { value: "New Room" } });
        fireEvent.change(abbreviationInput, { target: { value: "NR" } });

        await act(async () => {
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(classroomApi.createClassroom).toHaveBeenCalledWith({
                name: "New Room",
                abbreviation: "NR",
            });
            expect(screen.queryByText(/Add New Classroom/i, { selector: "h3" })).not.toBeInTheDocument();
        });
    });

    test("opens edit classroom modal", async () => {
        render(
            <MemoryRouter>
                <ClassroomListPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Computer Lab A")).toBeInTheDocument();
        });

        const editButton = screen.getAllByRole("button", { name: "Edit" })[0];
        fireEvent.click(editButton);

        await waitFor(() => {
            expect(screen.getByText("Edit Classroom", { selector: "h3" })).toBeInTheDocument();
        });
        expect(screen.getByDisplayValue("Computer Lab A")).toBeInTheDocument();
        expect(screen.getByDisplayValue("CLA")).toBeInTheDocument();
    });

    test("opens delete confirmation dialog", async () => {
        render(
            <MemoryRouter>
                <ClassroomListPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Computer Lab A")).toBeInTheDocument();
        });

        const deleteButton = screen.getAllByRole("button", { name: "Delete" })[0];
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText("Delete Classroom", { selector: "h3" })).toBeInTheDocument();
        });
        expect(
            screen.getByText("Are you sure you want to delete this classroom? This action cannot be undone.")
        ).toBeInTheDocument();
    });

    test("handles API errors gracefully", async () => {
        vi.mocked(classroomApi.getClassrooms).mockRejectedValue(new Error("API Error"));

        render(
            <MemoryRouter>
                <ClassroomListPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            // The error message from getErrorMessage is "API Error" in this mock
            expect(
                screen.getByText(/Failed to fetch classrooms. Please try again later. API Error/i)
            ).toBeInTheDocument();
        });
    });
});
