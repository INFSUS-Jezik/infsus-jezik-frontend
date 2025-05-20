import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById, updateCourse } from "../api/courseApi";
import { createSchedule, updateSchedule, deleteSchedule } from "../api/scheduleApi";
import { createEnrollment, updateEnrollment, deleteEnrollment } from "../api/enrollmentApi";
import { getClassrooms } from "../api/classroomApi";
import { getProfessorsList } from "../api/professorApi";
import { getStudentsList } from "../api/studentApi"; // Assuming StudentListDTO is an array
import type { Course, CourseUpdateDTO } from "../models/course";
import type { Schedule, ScheduleCreateDTO, ScheduleUpdateDTO } from "../models/schedule";
import type { Enrollment, EnrollmentCreateDTO, EnrollmentStatus, EnrollmentUpdateDTO } from "../models/enrollment";
import type { Classroom } from "../models/classroom";
import type { ProfessorListDTO } from "../models/professor";
import type { Student } from "../models/student"; // Assuming Student model for list
import Button from "../components/UI/Button";
import InputField from "../components/UI/InputField";
import SelectDropdown from "../components/UI/SelectDropdown";
import Modal from "../components/UI/Modal";
import ConfirmationDialog from "../components/UI/ConfirmationDialog";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import ErrorMessage from "../components/UI/ErrorMessage";

// Interface for the enrollment modal's form data
interface EnrollmentModalFormData {
    studentId: number;
    status: EnrollmentStatus;
    grade1?: number;
    grade2?: number;
    grade3?: number;
    finalGrade?: number;
}

const CourseDetailPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();

    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Master Edit State
    const [isEditingMaster, setIsEditingMaster] = useState<boolean>(false);
    const [masterFormData, setMasterFormData] = useState<CourseUpdateDTO | null>(null);
    const [professors, setProfessors] = useState<ProfessorListDTO[]>([]);

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

    // Enrollment Modal State
    const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState<boolean>(false);
    const [enrollmentModalMode, setEnrollmentModalMode] = useState<"add" | "edit">("add");
    const [currentEnrollmentFormData, setCurrentEnrollmentFormData] = useState<EnrollmentModalFormData>({
        studentId: 0, // Will be set properly when modal opens
        status: "active",
        // grade fields will be initially undefined
    });
    const [editingEnrollmentId, setEditingEnrollmentId] = useState<number | null>(null);
    const [students, setStudents] = useState<Student[]>([]); // Assuming StudentListDTO is Student[]

    // Delete Confirmation Dialog State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: "schedule" | "enrollment"; id: number } | null>(null);

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!courseId) return;
            setIsLoading(true);
            try {
                const numericCourseId = parseInt(courseId, 10);
                const [courseData, professorsData, classroomsData, studentsData] = await Promise.all([
                    getCourseById(numericCourseId),
                    getProfessorsList(),
                    getClassrooms(),
                    getStudentsList(), // Make sure this returns Student[]
                ]);
                setCourse(courseData);
                setMasterFormData({
                    name: courseData.name,
                    description: courseData.description || "",
                    price: courseData.price,
                    professorId: courseData.professorId,
                });
                setProfessors(professorsData);
                setClassrooms(classroomsData);
                setStudents(studentsData as unknown as Student[]); // Adjust if StudentListDTO is not Student[]
                setError(null);
            } catch (err) {
                setError("Failed to fetch course details. " + (err instanceof Error ? err.message : String(err)));
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourseData();
    }, [courseId]);

    const handleMasterEditToggle = () => {
        if (isEditingMaster && course && masterFormData) {
            // Save
            handleUpdateCourse();
        } else if (course) {
            // Enter edit mode
            setMasterFormData({
                name: course.name,
                description: course.description || "",
                price: course.price,
                professorId: course.professorId,
            });
        }
        setIsEditingMaster(!isEditingMaster);
    };

    const handleMasterFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        if (!masterFormData) return;
        const { name, value } = e.target;
        setMasterFormData(prev => ({
            ...prev!,
            [name]: name === "price" || name === "professorId" ? parseFloat(value) : value,
        }));
    };

    const handleUpdateCourse = async () => {
        if (!courseId || !masterFormData) return;
        setIsLoading(true);
        try {
            const numericCourseId = parseInt(courseId, 10);
            const updatedCourse = await updateCourse(numericCourseId, masterFormData);
            setCourse(updatedCourse);
            setIsEditingMaster(false);
            setError(null);
        } catch (err) {
            setError("Failed to update course. " + (err instanceof Error ? err.message : String(err)));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Schedule Handlers
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
            setCurrentScheduleFormData({
                classroomId: classrooms[0]?.id || 0,
                dayOfWeek: 0,
                startTime: "09:00",
                endTime: "11:00",
            });
            setEditingScheduleId(null);
        }
        setIsScheduleModalOpen(true);
    };

    const handleScheduleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentScheduleFormData(prev => ({
            ...prev,
            [name]: name === "classroomId" || name === "dayOfWeek" ? parseInt(value, 10) : value,
        }));
    };

    const handleSaveSchedule = async () => {
        if (!courseId) return;
        setIsLoading(true);
        try {
            const numericCourseId = parseInt(courseId, 10);
            if (scheduleModalMode === "add") {
                await createSchedule(numericCourseId, currentScheduleFormData as ScheduleCreateDTO);
            } else if (editingScheduleId) {
                await updateSchedule(editingScheduleId, currentScheduleFormData as ScheduleUpdateDTO);
            }
            const updatedCourseData = await getCourseById(numericCourseId); // Refetch course to get updated schedules
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

    const handleDeleteSchedule = async (scheduleId: number) => {
        setDeleteTarget({ type: "schedule", id: scheduleId });
        setIsDeleteDialogOpen(true);
    };

    // Enrollment Handlers
    const handleOpenEnrollmentModal = (mode: "add" | "edit", enrollment?: Enrollment) => {
        setEnrollmentModalMode(mode);
        if (mode === "edit" && enrollment) {
            setCurrentEnrollmentFormData({
                studentId: enrollment.studentId,
                status: enrollment.status,
                grade1: enrollment.grade1,
                grade2: enrollment.grade2,
                grade3: enrollment.grade3,
                finalGrade: enrollment.finalGrade,
            });
            setEditingEnrollmentId(enrollment.id);
        } else {
            setCurrentEnrollmentFormData({ studentId: students[0]?.id || 0, status: "active" });
            setEditingEnrollmentId(null);
        }
        setIsEnrollmentModalOpen(true);
    };

    const handleEnrollmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentEnrollmentFormData(prev => ({
            ...prev,
            [name]: (name.startsWith("grade") || name === "studentId") && value !== "" ? parseInt(value, 10) : value,
        }));
    };

    const handleSaveEnrollment = async () => {
        if (!courseId) return;
        setIsLoading(true);
        try {
            const numericCourseId = parseInt(courseId, 10);
            if (enrollmentModalMode === "add") {
                await createEnrollment(numericCourseId, currentEnrollmentFormData as EnrollmentCreateDTO);
            } else if (editingEnrollmentId) {
                await updateEnrollment(editingEnrollmentId, currentEnrollmentFormData as EnrollmentUpdateDTO);
            }
            const updatedCourseData = await getCourseById(numericCourseId); // Refetch course
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

    const handleDeleteEnrollment = async (enrollmentId: number) => {
        setDeleteTarget({ type: "enrollment", id: enrollmentId });
        setIsDeleteDialogOpen(true);
        // console.warn(`Simulating delete for enrollment ID: ${enrollmentId}. API endpoint not yet implemented or specified for frontend.`); // Corrected
        // // To make it seem like it worked for now:
        // if (course) {
        //     setCourse(prev => ({
        //         ...prev!,
        //         enrollments: prev!.enrollments?.filter(enr => enr.id !== enrollmentId)
        //     }));
        // }
    };

    const confirmDelete = async () => {
        if (!deleteTarget || !courseId) return;
        setIsLoading(true);
        try {
            const numericCourseId = parseInt(courseId, 10);
            if (deleteTarget.type === "schedule") {
                await deleteSchedule(deleteTarget.id);
            } else if (deleteTarget.type === "enrollment") {
                await deleteEnrollment(deleteTarget.id);
            }
            const updatedCourseData = await getCourseById(numericCourseId); // Refetch
            setCourse(updatedCourseData);
            setError(null);
        } catch (err) {
            setError(`Failed to delete ${deleteTarget.type}. ` + (err instanceof Error ? err.message : String(err))); // Corrected
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsDeleteDialogOpen(false);
            setDeleteTarget(null);
        }
    };

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    if (isLoading && !course) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!course) return <ErrorMessage message="Course not found." />;

    return (
        <div className="container mx-auto p-4">
            <Button onClick={() => navigate("/courses")} variant="secondary" className="mb-4">
                Back to Courses
            </Button>
            <h1 className="text-3xl font-bold mb-6">Course Details: {course.name}</h1>

            {/* Master Section */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Course Information</h2>
                    <Button onClick={handleMasterEditToggle} variant={isEditingMaster ? "primary" : "secondary"}>
                        {isEditingMaster ? "Save Course" : "Edit Course"}
                    </Button>
                </div>
                {isEditingMaster && masterFormData ? (
                    <div className="space-y-4">
                        <InputField
                            label="Course Name"
                            name="name"
                            value={masterFormData.name}
                            onChange={handleMasterFormChange}
                        />
                        <InputField
                            label="Description"
                            name="description"
                            value={masterFormData.description || ""}
                            onChange={handleMasterFormChange}
                            type="textarea"
                        />
                        <InputField
                            label="Price"
                            name="price"
                            type="number"
                            value={masterFormData.price}
                            onChange={handleMasterFormChange}
                        />
                        <SelectDropdown
                            label="Professor"
                            name="professorId"
                            value={masterFormData.professorId}
                            onChange={handleMasterFormChange}
                            options={professors.map(p => ({ value: p.id, label: p.fullName }))}
                        />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p>
                            <strong>Name:</strong> {course.name}
                        </p>
                        <p>
                            <strong>Description:</strong> {course.description || "N/A"}
                        </p>
                        <p>
                            <strong>Price:</strong> ${course?.price.toFixed(2)}
                        </p>
                        <p>
                            <strong>Professor:</strong>{" "}
                            {professors.find(p => p.id === course.professorId)?.fullName || "N/A"}
                        </p>
                    </div>
                )}
            </div>

            {/* Schedules Section */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Schedules</h2>
                    <Button onClick={() => handleOpenScheduleModal("add")} variant="primary">
                        Add Schedule
                    </Button>
                </div>
                {course.schedules && course.schedules.length > 0 ? (
                    <ul className="space-y-3">
                        {course.schedules.map(schedule => (
                            <li key={schedule.id} className="p-3 border rounded-md flex justify-between items-center">
                                <div>
                                    <p>
                                        <strong>Day:</strong> {daysOfWeek[schedule.dayOfWeek]}
                                    </p>
                                    <p>
                                        <strong>Time:</strong> {schedule.startTime} - {schedule.endTime}
                                    </p>
                                    <p>
                                        <strong>Classroom:</strong> {schedule.classroomName}
                                    </p>
                                </div>
                                <div className="space-x-2">
                                    <Button
                                        onClick={() => handleOpenScheduleModal("edit", schedule)}
                                        variant="secondary"
                                    >
                                        Edit
                                    </Button>
                                    <Button onClick={() => handleDeleteSchedule(schedule.id)} variant="danger">
                                        Delete
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No schedules found for this course.</p>
                )}
            </div>

            {/* Enrollments Section */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Enrollments</h2>
                    <Button onClick={() => handleOpenEnrollmentModal("add")} variant="primary">
                        Add Enrollment
                    </Button>
                </div>
                {course.enrollments && course.enrollments.length > 0 ? (
                    <ul className="space-y-3">
                        {course.enrollments.map(enrollment => (
                            <li key={enrollment.id} className="p-3 border rounded-md">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p>
                                            <strong>Student:</strong> {enrollment.studentName}
                                        </p>
                                        <p>
                                            <strong>Status:</strong> {enrollment.status}
                                        </p>
                                        <p>
                                            <strong>Enrollment Date:</strong>{" "}
                                            {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="space-x-2">
                                        <Button
                                            onClick={() => handleOpenEnrollmentModal("edit", enrollment)}
                                            variant="secondary"
                                        >
                                            Edit
                                        </Button>
                                        <Button onClick={() => handleDeleteEnrollment(enrollment.id)} variant="danger">
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                                {(enrollment.grade1 !== null ||
                                    enrollment.grade2 !== null ||
                                    enrollment.grade3 !== null ||
                                    enrollment.finalGrade !== null) && (
                                    <div className="mt-2 pt-2 border-t">
                                        <p className="text-sm">
                                            <strong>Grades:</strong>
                                        </p>
                                        <ul className="list-disc list-inside ml-4 text-sm">
                                            {enrollment.grade1 !== null && <li>Grade 1: {enrollment.grade1}</li>}
                                            {enrollment.grade2 !== null && <li>Grade 2: {enrollment.grade2}</li>}
                                            {enrollment.grade3 !== null && <li>Grade 3: {enrollment.grade3}</li>}
                                            {enrollment.finalGrade !== null && (
                                                <li>Final Grade: {enrollment.finalGrade}</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No enrollments found for this course.</p>
                )}
            </div>

            {/* Schedule Modal */}
            <Modal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                title={scheduleModalMode === "add" ? "Add Schedule" : "Edit Schedule"}
            >
                <div className="space-y-4">
                    <SelectDropdown
                        label="Classroom"
                        name="classroomId"
                        value={currentScheduleFormData.classroomId}
                        onChange={handleScheduleFormChange}
                        options={classrooms.map(c => ({ value: c.id, label: `${c.name} (${c.abbreviation})` }))}
                    />
                    <SelectDropdown
                        label="Day of Week"
                        name="dayOfWeek"
                        value={currentScheduleFormData.dayOfWeek}
                        onChange={handleScheduleFormChange}
                        options={daysOfWeek.map((day, index) => ({ value: index, label: day }))}
                    />
                    <InputField
                        label="Start Time"
                        name="startTime"
                        type="time"
                        value={currentScheduleFormData.startTime}
                        onChange={handleScheduleFormChange}
                    />
                    <InputField
                        label="End Time"
                        name="endTime"
                        type="time"
                        value={currentScheduleFormData.endTime}
                        onChange={handleScheduleFormChange}
                    />
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button onClick={() => setIsScheduleModalOpen(false)} variant="secondary">
                            Cancel
                        </Button>
                        <Button onClick={handleSaveSchedule} variant="primary">
                            Save Schedule
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Enrollment Modal */}
            <Modal
                isOpen={isEnrollmentModalOpen}
                onClose={() => setIsEnrollmentModalOpen(false)}
                title={enrollmentModalMode === "add" ? "Add Enrollment" : "Edit Enrollment"}
            >
                <div className="space-y-4">
                    {enrollmentModalMode === "add" && (
                        <SelectDropdown
                            label="Student"
                            name="studentId"
                            value={(currentEnrollmentFormData as EnrollmentCreateDTO).studentId}
                            onChange={handleEnrollmentFormChange}
                            options={students.map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }))}
                        />
                    )}
                    <SelectDropdown
                        label="Status"
                        name="status"
                        value={currentEnrollmentFormData.status || "active"}
                        onChange={handleEnrollmentFormChange}
                        options={[
                            { value: "active", label: "Active" },
                            { value: "completed", label: "Completed" },
                        ]}
                    />
                    <InputField
                        label="Grade 1 (Optional)"
                        name="grade1"
                        type="number"
                        value={currentEnrollmentFormData.grade1 ?? ""}
                        onChange={handleEnrollmentFormChange}
                        min="1"
                        max="5"
                    />
                    <InputField
                        label="Grade 2 (Optional)"
                        name="grade2"
                        type="number"
                        value={currentEnrollmentFormData.grade2 ?? ""}
                        onChange={handleEnrollmentFormChange}
                        min="1"
                        max="5"
                    />
                    <InputField
                        label="Grade 3 (Optional)"
                        name="grade3"
                        type="number"
                        value={currentEnrollmentFormData.grade3 ?? ""}
                        onChange={handleEnrollmentFormChange}
                        min="1"
                        max="5"
                    />
                    <InputField
                        label="Final Grade (Optional)"
                        name="finalGrade"
                        type="number"
                        value={currentEnrollmentFormData?.finalGrade ?? ""}
                        onChange={handleEnrollmentFormChange}
                        min="1"
                        max="5"
                    />
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button onClick={() => setIsEnrollmentModalOpen(false)} variant="secondary">
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEnrollment} variant="primary">
                            Save Enrollment
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Confirmation Dialog for Deletion */}
            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete this ${deleteTarget?.type}? This action cannot be undone.`} // Corrected
                confirmButtonText="Delete"
            />
            {isLoading && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
                    <LoadingSpinner />
                </div>
            )}
        </div>
    );
};

export default CourseDetailPage;
