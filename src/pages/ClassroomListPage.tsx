import React, { useState, useEffect, useMemo } from "react";
import { getClassrooms, createClassroom, updateClassroom, deleteClassroom } from "../api/classroomApi";
import type { Classroom, ClassroomCreateDTO, ClassroomUpdateDTO } from "../models/classroom";
import Button from "../components/UI/Button";
import InputField from "../components/UI/InputField";
import Modal from "../components/UI/Modal";
import ConfirmationDialog from "../components/UI/ConfirmationDialog";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import ErrorMessage from "../components/UI/ErrorMessage";

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

    const fetchClassroomsData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getClassrooms();
            setClassrooms(data);
        } catch (err) {
            setError("Failed to fetch classrooms. Please try again later.");
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
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentFormData.name || !currentFormData.abbreviation) {
            setError("Name and Abbreviation cannot be empty.");
            return;
        }
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
        } catch (err) {
            setError(`Failed to ${modalMode === "add" ? "create" : "update"} classroom.`);
            console.error(err);
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
        } catch (err) {
            setError("Failed to delete classroom.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-700">Classrooms Management</h1>

            <div className="mb-4 flex flex-col sm:flex-row justify-between items-center">
                <InputField
                    type="text"
                    placeholder="Search by name or abbreviation..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full sm:w-1/3 mb-3 sm:mb-0"
                />
                <Button onClick={handleOpenAddModal} variant="primary" className="w-full sm:w-auto">
                    Add New Classroom
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

            {!isLoading && !error && filteredClassrooms.length === 0 && (
                <p className="text-center text-gray-500 py-4">No classrooms found.</p>
            )}

            {!isLoading && !error && filteredClassrooms.length > 0 && (
                <div className="shadow overflow-x-auto border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Name
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Abbreviation
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredClassrooms.map(classroom => (
                                <tr key={classroom.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {classroom.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {classroom.abbreviation}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleOpenEditModal(classroom)}
                                            className="text-xs px-2 py-1"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleOpenDeleteDialog(classroom.id)}
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
                title={modalMode === "add" ? "Add New Classroom" : "Edit Classroom"}
            >
                <form onSubmit={handleSubmit}>
                    <InputField
                        label="Name"
                        name="name"
                        value={currentFormData.name}
                        onChange={handleFormChange}
                        required
                        className="mb-3"
                    />
                    <InputField
                        label="Abbreviation"
                        name="abbreviation"
                        value={currentFormData.abbreviation}
                        onChange={handleFormChange}
                        required
                        className="mb-4"
                    />
                    <div className="flex justify-end space-x-3 mt-5">
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
