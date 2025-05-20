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

    const fetchCoursesData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getCourses();
            setCourses(data);
        } catch (err) {
            setError("Failed to fetch courses. Please try again later.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProfessorsData = async () => {
        try {
            const data = await getProfessorsList();
            setProfessors(data);
        } catch (err) {
            setError("Failed to fetch professors list. Please try again later.");
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
                `${course.professor?.firstName} ${course.professor?.lastName}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                false
        );
    }, [courses, searchTerm]);

    const handleOpenAddModal = () => {
        setModalMode("add");
        setCurrentFormData(initialFormState);
        setEditingCourseId(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (course: Course) => {
        setModalMode("edit");
        setCurrentFormData({
            name: course.name,
            description: course.description || "",
            price: course.price,
            professorId: course.professorId,
        });
        setEditingCourseId(course.id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentFormData(initialFormState);
        setEditingCourseId(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentFormData(prev => ({
            ...prev,
            [name]: name === "price" ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentFormData(prev => ({
            ...prev,
            [name]: parseInt(value, 10),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentFormData.name || !currentFormData.professorId) {
            setError("Name and Professor are required fields.");
            return;
        }

        if (currentFormData.price < 0) {
            setError("Price cannot be negative.");
            return;
        }

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
        } catch (err) {
            setError(`Failed to ${modalMode === "add" ? "create" : "update"} course.`);
            console.error(err);
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
        } catch (err) {
            setError("Failed to delete course.");
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
        <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-700">Courses Management</h1>

            <div className="mb-4 flex flex-col sm:flex-row justify-between items-center">
                <InputField
                    type="text"
                    placeholder="Search by name, description, or professor..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full sm:w-1/3 mb-3 sm:mb-0"
                />
                <Button onClick={handleOpenAddModal} variant="primary" className="w-full sm:w-auto">
                    Add New Course
                </Button>
            </div>

            {isLoading && (
                <div className="flex justify-center my-4">
                    <LoadingSpinner />
                </div>
            )}
            {error && !isLoading && (
                <div className="my-4">
                    <ErrorMessage message={error} />
                </div>
            )}

            {!isLoading && !error && filteredCourses.length === 0 && (
                <p className="text-center text-gray-500 py-4">No courses found.</p>
            )}

            {!isLoading && !error && filteredCourses.length > 0 && (
                <div className="shadow overflow-x-auto border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
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
                                <tr key={course.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {course.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                        {course.description || "—"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${course.price.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {course.professor
                                            ? `${course.professor?.firstName} ${course.professor?.lastName}`
                                            : "—"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatScheduleSummary(course)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatEnrollmentSummary(course)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Button
                                            variant="primary"
                                            onClick={() => handleViewDetails(course.id)}
                                            className="text-xs px-2 py-1"
                                        >
                                            Details
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleOpenEditModal(course)}
                                            className="text-xs px-2 py-1"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleOpenDeleteDialog(course.id)}
                                            className="text-xs px-2 py-1"
                                        >
                                            Delete
                                        </Button>
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
                <form onSubmit={handleSubmit}>
                    <InputField
                        label="Name"
                        name="name"
                        value={currentFormData.name}
                        onChange={handleInputChange}
                        required
                        className="mb-3"
                    />
                    <InputField
                        label="Description"
                        name="description"
                        value={currentFormData.description || ""}
                        onChange={handleInputChange}
                        className="mb-3"
                    />
                    <InputField
                        label="Price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={currentFormData.price.toString()}
                        onChange={handleInputChange}
                        required
                        className="mb-3"
                    />
                    <SelectDropdown
                        label="Professor"
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
                        className="mb-4"
                    />
                    <div className="flex justify-end space-x-3 mt-5">
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
