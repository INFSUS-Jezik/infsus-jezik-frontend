import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById, updateCourse } from "../api/courseApi";
import { createSchedule, updateSchedule, deleteSchedule } from "../api/scheduleApi";
import { createEnrollment, updateEnrollment, deleteEnrollment } from "../api/enrollmentApi";
import { getClassrooms } from "../api/classroomApi";
import { getProfessorsList } from "../api/professorApi";
import { getStudentsList } from "../api/studentApi";
import type { Course, CourseUpdateDTO } from "../models/course";
import type { Schedule, ScheduleCreateDTO, ScheduleUpdateDTO } from "../models/schedule";
import type { Enrollment, EnrollmentCreateDTO, EnrollmentStatus, EnrollmentUpdateDTO } from "../models/enrollment";
import type { Classroom } from "../models/classroom";
import type { ProfessorListDTO } from "../models/professor";
import type { Student } from "../models/student";

import { validateCourse } from "../validation/courseValidation";
import { validateSchedule } from "../validation/scheduleValidation";
import { validateEnrollment } from "../validation/enrollmentValidation";

// Import UI Components
import Button from "../components/UI/Button";
import Modal from "../components/UI/Modal";
import InputField from "../components/UI/InputField";
import SelectDropdown from "../components/UI/SelectDropdown";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import ErrorMessage from "../components/UI/ErrorMessage";
import ConfirmationDialog from "../components/UI/ConfirmationDialog";

// Interface for the enrollment modal's form data
interface EnrollmentModalFormData {
    studentId: number;
    status: EnrollmentStatus;
    grade1?: number;
    grade2?: number;
    grade3?: number;
    finalGrade?: number;
}

// Interface for data passed to validateEnrollment
export interface EnrollmentValidationInput {
    studentId?: number;
    status: EnrollmentStatus;
    grade1?: number;
    grade2?: number;
    grade3?: number;
    finalGrade?: number;
}

// Define error types for each form
interface MasterFormErrors {
    name?: string;
    description?: string;
    price?: string;
    professorId?: string;
}

interface ScheduleFormErrors {
    classroomId?: string;
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
    timeOrder?: string;
}

interface EnrollmentFormErrors {
    studentId?: string;
    status?: string;
    grade1?: string;
    grade2?: string;
    grade3?: string;
    finalGrade?: string;
}

const CourseDetailPage: React.FC = () => {
    const { courseId: courseIdParam } = useParams<{ courseId: string }>(); // Renamed to avoid conflict
    const navigate = useNavigate();

    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Master Edit State
    const [isEditingMaster, setIsEditingMaster] = useState<boolean>(false);
    const [masterFormData, setMasterFormData] = useState<CourseUpdateDTO | null>(null);
    const [professors, setProfessors] = useState<ProfessorListDTO[]>([]);
    const [masterFormErrors, setMasterFormErrors] = useState<MasterFormErrors>({});

    // Schedule Modal State
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
    const [scheduleModalMode, setScheduleModalMode] = useState<"add" | "edit">("add");
    const [currentScheduleFormData, setCurrentScheduleFormData] = useState<ScheduleCreateDTO | ScheduleUpdateDTO>({
        classroomId: 0,
        dayOfWeek: 0,
        startTime: "",
        endTime: "",
    });
    const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [scheduleFormErrors, setScheduleFormErrors] = useState<ScheduleFormErrors>({});

    // Enrollment Modal State
    const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState<boolean>(false);
    const [enrollmentModalMode, setEnrollmentModalMode] = useState<"add" | "edit">("add");
    const [currentEnrollmentFormData, setCurrentEnrollmentFormData] = useState<EnrollmentModalFormData>({
        studentId: 0,
        status: "active",
    });
    const [editingEnrollmentId, setEditingEnrollmentId] = useState<number | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [enrollmentFormErrors, setEnrollmentFormErrors] = useState<EnrollmentFormErrors>({});

    // Delete Confirmation Dialog State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: "schedule" | "enrollment"; id: number } | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!courseIdParam) {
                setError("Course ID is missing.");
                setIsLoading(false);
                return;
            }
            const numericCourseId = parseInt(courseIdParam, 10);
            if (isNaN(numericCourseId)) {
                setError("Invalid Course ID format.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const courseData = await getCourseById(numericCourseId);
                setCourse(courseData);
                setMasterFormData({
                    name: courseData.name,
                    description: courseData.description || "",
                    price: courseData.price,
                    professorId: courseData.professorId,
                });

                const profData = await getProfessorsList();
                setProfessors(profData);

                const classData = await getClassrooms();
                setClassrooms(classData);

                const studData = await getStudentsList();
                setStudents(studData);
            } catch (err) {
                setError(
                    "Failed to fetch course details or related data. " +
                        (err instanceof Error ? err.message : String(err))
                );
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, [courseIdParam]);

    const handleMasterEditToggle = () => {
        if (isEditingMaster && course) {
            setMasterFormData({
                name: course.name,
                description: course.description || "",
                price: course.price,
                professorId: course.professorId,
            });
        }
        setMasterFormErrors({});
        setIsEditingMaster(!isEditingMaster);
    };

    const handleMasterFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setMasterFormData(prev => {
            if (!prev) return null;
            const updatedValue =
                name === "price" ? parseFloat(value) || 0 : name === "professorId" ? parseInt(value, 10) || 0 : value;
            const newFormData = { ...prev, [name]: updatedValue };
            if (masterFormErrors[name as keyof MasterFormErrors]) {
                setMasterFormErrors(prevErr => ({ ...prevErr, [name]: undefined }));
            }
            return newFormData;
        });
    };

    const handleUpdateCourse = async () => {
        if (!masterFormData || !course || !courseIdParam) return;
        const numericCourseId = parseInt(courseIdParam, 10);

        const validationErrors = validateCourse(masterFormData);
        if (Object.keys(validationErrors).length > 0) {
            setMasterFormErrors(validationErrors);
            return;
        }
        setMasterFormErrors({});

        setIsLoading(true);
        try {
            const updatedCourse = await updateCourse(numericCourseId, masterFormData);
            setCourse(updatedCourse); // Update local course state
            setMasterFormData({
                // Also update masterFormData to reflect saved changes
                name: updatedCourse.name,
                description: updatedCourse.description || "",
                price: updatedCourse.price,
                professorId: updatedCourse.professorId,
            });
            setIsEditingMaster(false);
            setError(null);
        } catch (err) {
            setError("Failed to update course. " + (err instanceof Error ? err.message : String(err)));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenScheduleModal = (mode: "add" | "edit", schedule?: Schedule) => {
        setScheduleModalMode(mode);
        if (mode === "edit" && schedule) {
            setCurrentScheduleFormData({
                classroomId: schedule.classroomId,
                dayOfWeek: schedule.dayOfWeek,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
            });
            setEditingScheduleId(schedule.id);
        } else {
            setCurrentScheduleFormData({ classroomId: 0, dayOfWeek: 0, startTime: "", endTime: "" });
            setEditingScheduleId(null);
        }
        setScheduleFormErrors({});
        setIsScheduleModalOpen(true);
    };

    const handleScheduleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentScheduleFormData(prev => ({
            ...prev,
            [name]: name === "classroomId" || name === "dayOfWeek" ? parseInt(value, 10) : value,
        }));
        if (scheduleFormErrors[name as keyof ScheduleFormErrors]) {
            setScheduleFormErrors(prevErr => ({ ...prevErr, [name]: undefined }));
        }
    };

    const handleSaveSchedule = async () => {
        if (!courseIdParam) return;
        const numericCourseId = parseInt(courseIdParam, 10);

        const validationErrors = validateSchedule(currentScheduleFormData);
        if (Object.keys(validationErrors).length > 0) {
            setScheduleFormErrors(validationErrors);
            return;
        }
        setScheduleFormErrors({});

        setIsLoading(true);
        try {
            if (scheduleModalMode === "add") {
                await createSchedule(numericCourseId, currentScheduleFormData as ScheduleCreateDTO);
            } else if (editingScheduleId) {
                await updateSchedule(editingScheduleId, currentScheduleFormData as ScheduleUpdateDTO);
            }
            const updatedCourseData = await getCourseById(numericCourseId);
            setCourse(updatedCourseData);
            setIsScheduleModalOpen(false);
            setError(null);
        } catch (err) {
            setError("Failed to save schedule. " + (err instanceof Error ? err.message : String(err)));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEnrollmentModal = (mode: "add" | "edit", enrollment?: Enrollment) => {
        setEnrollmentModalMode(mode);
        if (mode === "edit" && enrollment) {
            setCurrentEnrollmentFormData({
                studentId: enrollment.studentId, // studentId is part of Enrollment, not EnrollmentUpdateDTO
                status: enrollment.status,
                grade1: enrollment.grade1,
                grade2: enrollment.grade2,
                grade3: enrollment.grade3,
                finalGrade: enrollment.finalGrade,
            });
            setEditingEnrollmentId(enrollment.id);
        } else {
            setCurrentEnrollmentFormData({ studentId: 0, status: "active" });
            setEditingEnrollmentId(null);
        }
        setEnrollmentFormErrors({});
        setIsEnrollmentModalOpen(true);
    };

    const handleEnrollmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentEnrollmentFormData(prev => {
            const updatedValue =
                name === "studentId"
                    ? parseInt(value, 10)
                    : name.startsWith("grade") || name === "finalGrade"
                    ? value === ""
                        ? undefined
                        : parseInt(value, 10)
                    : value;
            const newFormData = { ...prev, [name]: updatedValue };
            if (enrollmentFormErrors[name as keyof EnrollmentFormErrors]) {
                setEnrollmentFormErrors(prevErr => ({ ...prevErr, [name]: undefined }));
            }
            return newFormData;
        });
    };

    const handleSaveEnrollment = async () => {
        if (!courseIdParam) return;
        const numericCourseId = parseInt(courseIdParam, 10);

        let dataToValidateAndSave: EnrollmentCreateDTO | EnrollmentUpdateDTO;
        let validationData: EnrollmentValidationInput; // Changed from any

        if (enrollmentModalMode === "add") {
            dataToValidateAndSave = {
                studentId: currentEnrollmentFormData.studentId,
                enrollmentDate: new Date().toISOString(),
                status: currentEnrollmentFormData.status,
            };
            validationData = {
                studentId: currentEnrollmentFormData.studentId,
                status: currentEnrollmentFormData.status,
            };
        } else {
            dataToValidateAndSave = {
                status: currentEnrollmentFormData.status,
                grade1: currentEnrollmentFormData.grade1,
                grade2: currentEnrollmentFormData.grade2,
                grade3: currentEnrollmentFormData.grade3,
                finalGrade: currentEnrollmentFormData.finalGrade,
            };
            validationData = {
                status: currentEnrollmentFormData.status,
                grade1: currentEnrollmentFormData.grade1,
                grade2: currentEnrollmentFormData.grade2,
                grade3: currentEnrollmentFormData.grade3,
                finalGrade: currentEnrollmentFormData.finalGrade,
            };
        }

        const validationErrors = validateEnrollment(validationData);
        if (Object.keys(validationErrors).length > 0) {
            setEnrollmentFormErrors(validationErrors);
            return;
        }
        setEnrollmentFormErrors({});

        setIsLoading(true);
        try {
            if (enrollmentModalMode === "add") {
                await createEnrollment(numericCourseId, dataToValidateAndSave as EnrollmentCreateDTO);
            } else if (editingEnrollmentId) {
                await updateEnrollment(editingEnrollmentId, dataToValidateAndSave as EnrollmentUpdateDTO);
            }
            const updatedCourseData = await getCourseById(numericCourseId);
            setCourse(updatedCourseData);
            setIsEnrollmentModalOpen(false);
            setError(null);
        } catch (err) {
            setError("Failed to save enrollment. " + (err instanceof Error ? err.message : String(err)));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAction = (type: "schedule" | "enrollment", id: number) => {
        setDeleteTarget({ type, id });
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget || !courseIdParam) return;
        const numericCourseId = parseInt(courseIdParam, 10);
        setIsLoading(true);
        try {
            if (deleteTarget.type === "schedule") {
                await deleteSchedule(deleteTarget.id);
            } else if (deleteTarget.type === "enrollment") {
                await deleteEnrollment(deleteTarget.id);
            }
            const updatedCourseData = await getCourseById(numericCourseId);
            setCourse(updatedCourseData);
            setError(null);
        } catch (err) {
            setError(`Failed to delete ${deleteTarget.type}. ` + (err instanceof Error ? err.message : String(err)));
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsDeleteDialogOpen(false);
            setDeleteTarget(null);
        }
    };

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const renderMasterFormField = (
        name: keyof MasterFormErrors,
        label: string,
        type: string = "text",
        options?: { value: string | number; label: string }[]
    ) => {
        const value = masterFormData?.[name as keyof CourseUpdateDTO] ?? (type === "number" ? 0 : "");
        return (
            <div className="mb-4">
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
                {type === "select" ? (
                    <SelectDropdown
                        name={name}
                        value={value as string | number}
                        onChange={handleMasterFormChange}
                        options={[{ value: "", label: `Select a ${label.toLowerCase()}` }, ...(options || [])]}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                ) : type === "textarea" ? (
                    <textarea
                        id={name}
                        name={name}
                        value={value as string}
                        onChange={handleMasterFormChange}
                        rows={3}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
                    />
                ) : (
                    <InputField
                        type={type}
                        name={name}
                        value={value as string | number}
                        onChange={handleMasterFormChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        step={type === "number" ? "0.01" : undefined}
                    />
                )}
                {masterFormErrors[name] && <p className="text-red-500 text-xs mt-1">{masterFormErrors[name]}</p>}
            </div>
        );
    };

    const renderScheduleFormField = (
        name: keyof ScheduleFormErrors,
        label: string,
        type: string = "text",
        options?: { value: string | number; label: string }[]
    ) => {
        const value =
            currentScheduleFormData[name as keyof (ScheduleCreateDTO | ScheduleUpdateDTO)] ??
            (type === "number" ? 0 : "");
        return (
            <div className="mb-4">
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
                {type === "select" ? (
                    <SelectDropdown
                        name={name}
                        value={value as string | number}
                        onChange={handleScheduleFormChange}
                        options={[{ value: "", label: `Select a ${label.toLowerCase()}` }, ...(options || [])]}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                ) : (
                    <InputField
                        type={type}
                        name={name}
                        value={value as string | number}
                        onChange={handleScheduleFormChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                )}
                {scheduleFormErrors[name] && <p className="text-red-500 text-xs mt-1">{scheduleFormErrors[name]}</p>}
                {name === "endTime" && scheduleFormErrors.timeOrder && (
                    <p className="text-red-500 text-xs mt-1">{scheduleFormErrors.timeOrder}</p>
                )}
            </div>
        );
    };

    const renderEnrollmentFormField = (
        name: keyof EnrollmentFormErrors,
        label: string,
        type: string = "text",
        options?: { value: string | number; label: string }[]
    ) => {
        const value = currentEnrollmentFormData[name as keyof EnrollmentModalFormData] ?? (type === "number" ? "" : ""); // Grades can be empty string for undefined
        return (
            <div className="mb-4">
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
                {type === "select" ? (
                    <SelectDropdown
                        name={name}
                        value={value as string | number}
                        onChange={handleEnrollmentFormChange}
                        options={[{ value: "", label: `Select a ${label.toLowerCase()}` }, ...(options || [])]}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                ) : (
                    <InputField
                        type={type}
                        name={name}
                        value={value as string | number}
                        onChange={handleEnrollmentFormChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        min={name.includes("grade") ? 1 : undefined}
                        max={name.includes("grade") ? 5 : undefined}
                        step={name.includes("grade") ? 1 : undefined}
                    />
                )}
                {enrollmentFormErrors[name] && (
                    <p className="text-red-500 text-xs mt-1">{enrollmentFormErrors[name]}</p>
                )}
            </div>
        );
    };

    if (isLoading && !course)
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );
    if (error && !isLoading)
        return (
            <div className="p-4">
                <ErrorMessage message={error} />
            </div>
        ); // Show error only if not loading
    if (!course && !isLoading) return <div className="p-4 text-center">Course not found or ID is invalid.</div>; // More specific message

    // Ensure course is loaded before rendering dependent UI
    if (!course)
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="mb-6 flex items-center justify-between">
                <Button variant="secondary" onClick={() => navigate("/courses")}>
                    &larr; Back to Courses
                </Button>
                <h1 className="text-3xl font-bold text-gray-800">Course Details</h1>
                <div>{/* Spacer */}</div>
            </div>

            {/* Master Section */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-semibold text-gray-700">Course Information</h2>
                    <Button
                        onClick={handleMasterEditToggle}
                        variant={isEditingMaster ? "secondary" : "primary"}
                        className="ml-auto"
                    >
                        {isEditingMaster ? "Cancel" : "Edit Course"}
                    </Button>
                </div>

                {isEditingMaster && masterFormData ? (
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            handleUpdateCourse();
                        }}
                    >
                        {renderMasterFormField("name", "Course Name")}
                        {renderMasterFormField("description", "Description", "textarea")}
                        {renderMasterFormField("price", "Price", "number")}
                        {renderMasterFormField(
                            "professorId",
                            "Professor",
                            "select",
                            professors.map(p => ({ value: p.id, label: p.fullName }))
                        )}
                        <div className="mt-6 flex justify-end space-x-3">
                            <Button type="submit" variant="primary">
                                Save Changes
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                        <p>
                            <strong className="font-medium text-gray-600">Name:</strong> {course.name}
                        </p>
                        <p>
                            <strong className="font-medium text-gray-600">Price:</strong> ${course.price.toFixed(2)}
                        </p>
                        <p className="md:col-span-2">
                            <strong className="font-medium text-gray-600">Description:</strong>{" "}
                            {course.description || "N/A"}
                        </p>
                        <p>
                            <strong className="font-medium text-gray-600">Professor:</strong>{" "}
                            {professors.find(p => p.id === course.professorId)?.fullName || "N/A"}
                        </p>
                    </div>
                )}
            </div>

            {/* Schedules Section */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">Schedules</h2>
                    <Button onClick={() => handleOpenScheduleModal("add")} variant="primary">
                        Add Schedule
                    </Button>
                </div>
                {course.schedules && course.schedules.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {course.schedules.map(schedule => (
                            <li key={schedule.id} className="py-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-800">
                                        {daysOfWeek[schedule.dayOfWeek]} from {schedule.startTime} to {schedule.endTime}
                                    </p>
                                    <p className="text-sm text-gray-500">Classroom: {schedule.classroomName}</p>
                                </div>
                                <div className="space-x-2">
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleOpenScheduleModal("edit", schedule)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleDeleteAction("schedule", schedule.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 italic">No schedules defined for this course.</p>
                )}
            </div>

            {/* Enrollments Section */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">Enrollments</h2>
                    <Button onClick={() => handleOpenEnrollmentModal("add")} variant="primary">
                        Add Enrollment
                    </Button>
                </div>
                {course.enrollments && course.enrollments.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {course.enrollments.map(enrollment => (
                            <li key={enrollment.id} className="py-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-gray-800">Student: {enrollment.studentName}</p>
                                        <p className="text-sm text-gray-500">
                                            Status:{" "}
                                            <span
                                                className={`capitalize px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                    enrollment.status === "active"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-blue-100 text-blue-700"
                                                }`}
                                            >
                                                {enrollment.status}
                                            </span>
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="space-x-2 flex-shrink-0">
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleOpenEnrollmentModal("edit", enrollment)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleDeleteAction("enrollment", enrollment.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                                {(enrollment.grade1 !== undefined ||
                                    enrollment.grade2 !== undefined ||
                                    enrollment.grade3 !== undefined ||
                                    enrollment.finalGrade !== undefined) && (
                                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
                                        Grades: G1: {enrollment.grade1 ?? "–"}, G2: {enrollment.grade2 ?? "–"}, G3:{" "}
                                        {enrollment.grade3 ?? "–"}, Final: {enrollment.finalGrade ?? "–"}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 italic">No students enrolled in this course.</p>
                )}
            </div>

            {/* Schedule Modal */}
            <Modal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                title={scheduleModalMode === "add" ? "Add Schedule" : "Edit Schedule"}
            >
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        handleSaveSchedule();
                    }}
                >
                    {renderScheduleFormField(
                        "dayOfWeek",
                        "Day of Week",
                        "select",
                        daysOfWeek.map((day, i) => ({ value: i, label: day }))
                    )}
                    {renderScheduleFormField("startTime", "Start Time", "time")}
                    {renderScheduleFormField("endTime", "End Time", "time")}
                    {renderScheduleFormField(
                        "classroomId",
                        "Classroom",
                        "select",
                        classrooms.map(c => ({ value: c.id, label: `${c.name} (${c.abbreviation})` }))
                    )}
                    <div className="mt-6 flex justify-end space-x-3">
                        <Button type="button" variant="secondary" onClick={() => setIsScheduleModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {scheduleModalMode === "add" ? "Add Schedule" : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Enrollment Modal */}
            <Modal
                isOpen={isEnrollmentModalOpen}
                onClose={() => setIsEnrollmentModalOpen(false)}
                title={enrollmentModalMode === "add" ? "Add Enrollment" : "Edit Enrollment"}
            >
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        handleSaveEnrollment();
                    }}
                >
                    {enrollmentModalMode === "add" &&
                        renderEnrollmentFormField(
                            "studentId",
                            "Student",
                            "select",
                            students.map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }))
                        )}
                    {renderEnrollmentFormField("status", "Status", "select", [
                        { value: "active", label: "Active" },
                        { value: "completed", label: "Completed" },
                    ])}
                    {/* Grades are typically for edit mode; for create, they are usually not set or are optional */}
                    {enrollmentModalMode === "edit" && (
                        <>
                            {renderEnrollmentFormField("grade1", "Grade 1 (Optional)", "number")}
                            {renderEnrollmentFormField("grade2", "Grade 2 (Optional)", "number")}
                            {renderEnrollmentFormField("grade3", "Grade 3 (Optional)", "number")}
                            {renderEnrollmentFormField("finalGrade", "Final Grade (Optional)", "number")}
                        </>
                    )}
                    <div className="mt-6 flex justify-end space-x-3">
                        <Button type="button" variant="secondary" onClick={() => setIsEnrollmentModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {enrollmentModalMode === "add" ? "Add Enrollment" : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Confirmation Dialog for Deletes */}
            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title={`Delete ${deleteTarget?.type === "schedule" ? "Schedule" : "Enrollment"}`}
                message={`Are you sure you want to delete this ${deleteTarget?.type}? This action cannot be undone.`}
            />
        </div>
    );
};

export default CourseDetailPage;
