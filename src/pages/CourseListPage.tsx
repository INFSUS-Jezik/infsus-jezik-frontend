import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getCourses, createCourse, updateCourse, deleteCourse } from "../api/courseApi";
import { getProfessorsList } from "../api/professorApi";
import type { Course, CourseCreateDTO, CourseUpdateDTO } from "../models/course";
import type { ProfessorListDTO } from "../models/professor";
import Button from "../components/UI/Button";
import InputField from "../components/UI/InputField";
import SelectDropdown from "../components/UI/SelectDropdown";
import Modal from "../components/UI/Modal";
import ConfirmationDialog from "../components/UI/ConfirmationDialog";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import ErrorMessage from "../components/UI/ErrorMessage";
import { validateCourse } from "../validation/courseValidation";
import { getErrorMessage } from "../utils/errorUtils";

// Define a type for form errors
interface CourseFormErrors {
    name?: string;
    description?: string;
    price?: string;
    professorId?: string;
}

const CourseListPage: React.FC = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [professors, setProfessors] = useState<ProfessorListDTO[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");

    const initialFormState: CourseCreateDTO = {
        name: "",
        description: "",
        price: 0,
        professorId: 0,
    };

    const [currentFormData, setCurrentFormData] = useState<CourseCreateDTO | CourseUpdateDTO>(initialFormState);
    const [editingCourseId, setEditingCourseId] = useState<number | null>(null);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [courseToDeleteId, setCourseToDeleteId] = useState<number | null>(null);
    const [formErrors, setFormErrors] = useState<CourseFormErrors>({}); // Added for validation errors

    const fetchCoursesData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getCourses();
            setCourses(data);
        } catch (err: unknown) {
            const backendMessage = getErrorMessage(err, "Unknown error");
            setError(`Failed to fetch courses. Please try again later. ${backendMessage}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProfessorsData = async () => {
        try {
            const data = await getProfessorsList();
            setProfessors(data);
        } catch (err: unknown) {
            const backendMessage = getErrorMessage(err, "Unknown error");
            setError(`Failed to fetch professors list. Please try again later. ${backendMessage}`);
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCoursesData();
        fetchProfessorsData();
    }, []);

    const filteredCourses = useMemo(() => {
        return courses.filter(
            course =>
                course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                false ||
                `${course.professor?.fullName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                false
        );
    }, [courses, searchTerm]);

    const handleOpenAddModal = () => {
        setModalMode("add");
        setCurrentFormData(initialFormState);
        setEditingCourseId(null);
        setFormErrors({}); // Clear errors
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (course: Course) => {
        setModalMode("edit");
        setCurrentFormData({
            name: course.name,
            description: course.description || "",
            price: course.price,
            professorId: course?.professor?.id ?? 0,
        });
        setEditingCourseId(course.id);
        setFormErrors({}); // Clear errors
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentFormData(initialFormState);
        setEditingCourseId(null);
        setFormErrors({}); // Clear errors on modal close
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentFormData(prev => ({
            ...prev,
            [name]: name === "price" ? parseFloat(value) || 0 : value,
        }));
        if (formErrors[name as keyof CourseFormErrors]) {
            // Clear error for this field on change
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentFormData(prev => ({
            ...prev,
            [name]: parseInt(value, 10),
        }));
        if (formErrors[name as keyof CourseFormErrors]) {
            // Clear error for this field on change
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validateCourse(currentFormData);
        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            return;
        }
        setFormErrors({}); // Clear errors before submission

        // Original validation (can be removed or kept as a fallback)
        // if (!currentFormData.name || !currentFormData.professorId) {
        //     setError("Name and Professor are required fields.");
        //     return;
        // }
        // if (currentFormData.price < 0) {
        //     setError("Price cannot be negative.");
        //     return;
        // }

        setError(null);
        setIsLoading(true);
        try {
            if (modalMode === "add") {
                await createCourse(currentFormData as CourseCreateDTO);
            } else if (modalMode === "edit" && editingCourseId !== null) {
                await updateCourse(editingCourseId, currentFormData as CourseUpdateDTO);
            }
            await fetchCoursesData(); // Refresh list
            handleCloseModal();
        } catch (err: unknown) {
            const backendMessage = getErrorMessage(err, "Unknown error");
            setError(`Failed to ${modalMode === "add" ? "create" : "update"} course. ${backendMessage}`);
            console.error(err);
            handleCloseModal();
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDeleteDialog = (id: number) => {
        setCourseToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setCourseToDeleteId(null);
    };

    const handleConfirmDelete = async () => {
        if (courseToDeleteId === null) return;
        setIsLoading(true);
        setError(null);
        try {
            await deleteCourse(courseToDeleteId);
            await fetchCoursesData(); // Refresh list
            handleCloseDeleteDialog();
        } catch (err: unknown) {
            const backendMessage = getErrorMessage(err, "Unknown error");
            setError(`Failed to delete course. ${backendMessage}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetails = (courseId: number) => {
        navigate(`/courses/${courseId}`);
    };

    const formatScheduleSummary = (course: Course) => {
        if (!course.schedules || course.schedules.length === 0) {
            return "No schedules";
        }

        return `${course.schedules.length} schedule(s)`;
    };

    const formatEnrollmentSummary = (course: Course) => {
        if (!course.enrollments || course.enrollments.length === 0) {
            return "No enrollments";
        }

        return `${course.enrollments.length} student(s) enrolled`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800">Courses</h1>
                <Button onClick={handleOpenAddModal} variant="primary">
                    Add New Course
                </Button>
            </div>

            <div className="flex items-center space-x-4">
                <div className="flex-1 max-w-md">
                    <InputField
                        type="text"
                        placeholder="Search by name, description, or professor..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="mb-0"
                    />
                </div>
            </div>

            {isLoading && <LoadingSpinner />}

            {error && !isLoading && <ErrorMessage message={error} />}

            {!isLoading && !error && filteredCourses.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No courses found.</p>
                </div>
            )}

            {!isLoading && !error && filteredCourses.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Professor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Schedule Summary
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Enrollment Summary
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCourses.map(course => (
                                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                                        {course.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-48 truncate">
                                        {course.description || "—"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        ${course.price.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {course.professor ? `${course.professor?.fullName}` : "—"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {formatScheduleSummary(course)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {formatEnrollmentSummary(course)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2 min-w-max">
                                            <Button
                                                variant="primary"
                                                onClick={() => handleViewDetails(course.id)}
                                                className="text-xs px-3 py-1.5"
                                            >
                                                Details
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleOpenEditModal(course)}
                                                className="text-xs px-3 py-1.5"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => handleOpenDeleteDialog(course.id)}
                                                className="text-xs px-3 py-1.5"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={modalMode === "add" ? "Add New Course" : "Edit Course"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <InputField
                            label="Name"
                            id="courseName"
                            name="name"
                            value={currentFormData.name}
                            onChange={handleInputChange}
                            required
                        />
                        {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                    </div>
                    <div>
                        <InputField
                            label="Description"
                             id="courseDescription"
                            name="description"
                            value={currentFormData.description || ""}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <InputField
                            label="Price"
                            id="coursePrice"
                            name="price"
                            type="number"
                            step="0.01"
                            value={currentFormData.price.toString()}
                            onChange={handleInputChange}
                            required
                        />
                        {formErrors.price && <p className="text-red-500 text-sm">{formErrors.price}</p>}
                    </div>
                    <div>
                        <SelectDropdown
                            label="Professor"
                            id="courseProfessor"
                            name="professorId"
                            value={currentFormData.professorId || ""}
                            onChange={handleSelectChange}
                            required
                            options={[
                                { value: "", label: "Select a professor" },
                                ...professors.map(professor => ({
                                    value: professor.id,
                                    label: professor.fullName,
                                })),
                            ]}
                        />
                        {formErrors.professorId && <p className="text-red-500 text-sm">{formErrors.professorId}</p>}
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {modalMode === "add" ? "Add Course" : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
                title="Delete Course"
                message="Are you sure you want to delete this course? This action cannot be undone."
            />
        </div>
    );
};

export default CourseListPage;
