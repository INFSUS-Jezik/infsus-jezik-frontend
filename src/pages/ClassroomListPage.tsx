import React, { useState, useEffect, useMemo } from "react";
import { getClassrooms, createClassroom, updateClassroom, deleteClassroom } from "../api/classroomApi";
import type { Classroom, ClassroomCreateDTO, ClassroomUpdateDTO } from "../models/classroom";
import Button from "../components/UI/Button";
import InputField from "../components/UI/InputField";
import Modal from "../components/UI/Modal";
import ConfirmationDialog from "../components/UI/ConfirmationDialog";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import ErrorMessage from "../components/UI/ErrorMessage";
import { validateClassroom } from "../validation/classroomValidation";
import { getErrorMessage } from "../utils/errorUtils";

// Define a type for form errors to allow undefined values for fields without errors
interface FormErrorsType {
    name?: string;
    abbreviation?: string;
    // Add other potential field names here if needed for other forms in this component
}

const ClassroomListPage: React.FC = () => {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");

    const initialFormState: ClassroomCreateDTO = { name: "", abbreviation: "" };
    const [currentFormData, setCurrentFormData] = useState<ClassroomCreateDTO | ClassroomUpdateDTO>(initialFormState);
    const [editingClassroomId, setEditingClassroomId] = useState<number | null>(null);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [classroomToDeleteId, setClassroomToDeleteId] = useState<number | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrorsType>({}); // Use the new FormErrorsType

    const fetchClassroomsData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getClassrooms();
            setClassrooms(data);
        } catch (err: unknown) {
            const backendMessage = getErrorMessage(err, "Unknown error");
            setError(`Failed to fetch classrooms. Please try again later. ${backendMessage}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClassroomsData();
    }, []);

    const filteredClassrooms = useMemo(() => {
        return classrooms.filter(
            classroom =>
                classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                classroom.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [classrooms, searchTerm]);

    const handleOpenAddModal = () => {
        setModalMode("add");
        setCurrentFormData(initialFormState);
        setEditingClassroomId(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (classroom: Classroom) => {
        setModalMode("edit");
        setCurrentFormData({ name: classroom.name, abbreviation: classroom.abbreviation });
        setEditingClassroomId(classroom.id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentFormData(initialFormState);
        setEditingClassroomId(null);
        setFormErrors({}); // Clear errors on modal close
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name as keyof FormErrorsType]) {
            // Type assertion for safety
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validateClassroom(currentFormData, classrooms, editingClassroomId);
        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            return;
        }
        setFormErrors({}); // Clear errors before submission

        setError(null);
        setIsLoading(true);
        try {
            if (modalMode === "add") {
                await createClassroom(currentFormData as ClassroomCreateDTO);
            } else if (modalMode === "edit" && editingClassroomId !== null) {
                await updateClassroom(editingClassroomId, currentFormData as ClassroomUpdateDTO);
            }
            await fetchClassroomsData(); // Refresh list
            handleCloseModal();
        } catch (err: unknown) {
            const backendMessage = getErrorMessage(err, "Unknown error");
            setError(`Failed to ${modalMode === "add" ? "create" : "update"} classroom. ${backendMessage}`);
            console.error(err);
            handleCloseModal(); // Close modal so user can see the error
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDeleteDialog = (id: number) => {
        setClassroomToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setClassroomToDeleteId(null);
    };

    const handleConfirmDelete = async () => {
        if (classroomToDeleteId === null) return;
        setIsLoading(true);
        setError(null);
        try {
            await deleteClassroom(classroomToDeleteId);
            await fetchClassroomsData(); // Refresh list
            handleCloseDeleteDialog();
        } catch (err: unknown) {
            const backendMessage = getErrorMessage(err, "Unknown error");
            setError(`Failed to delete classroom. ${backendMessage}`);
            console.error(err);
            handleCloseDeleteDialog(); // Close dialog so user can see the error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800">Classrooms</h1>
                <Button onClick={handleOpenAddModal} variant="primary">
                    Add New Classroom
                </Button>
            </div>

            <div className="flex items-center space-x-4">
                <div className="flex-1 max-w-md">
                    <InputField
                        type="text"
                        placeholder="Search by name or abbreviation..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="mb-0"
                    />
                </div>
            </div>

            {isLoading && <LoadingSpinner />}

            {error && !isLoading && <ErrorMessage message={error} />}

            {!isLoading && !error && filteredClassrooms.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No classrooms found.</p>
                </div>
            )}

            {!isLoading && !error && filteredClassrooms.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Abbreviation
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredClassrooms.map(classroom => (
                                <tr key={classroom.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-700">
                                        {classroom.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-600">
                                        {classroom.abbreviation}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2 min-w-max">
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleOpenEditModal(classroom)}
                                                className="text-xs px-3 py-1.5"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => handleOpenDeleteDialog(classroom.id)}
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
                title={modalMode === "add" ? "Add New Classroom" : "Edit Classroom"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <InputField
                            label="Name"
                            id="classroomName"
                            name="name"
                            value={currentFormData.name}
                            onChange={handleFormChange}
                            required
                        />
                        {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                    </div>
                    <div>
                        <InputField
                            label="Abbreviation"
                            id="classroomAbbreviation"
                            name="abbreviation"
                            value={currentFormData.abbreviation}
                            onChange={handleFormChange}
                            required
                        />
                        {formErrors.abbreviation && <p className="text-red-500 text-sm">{formErrors.abbreviation}</p>}
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {modalMode === "add" ? "Add Classroom" : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
                title="Delete Classroom"
                message="Are you sure you want to delete this classroom? This action cannot be undone."
            />
        </div>
    );
};

export default ClassroomListPage;
