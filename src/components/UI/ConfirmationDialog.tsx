import React from "react";
import Modal from "./Modal";
import Button from "./Button";

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message,
    confirmButtonText = "Confirm",
    cancelButtonText = "Cancel",
}) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="text-center">
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-center space-x-3">
                    <Button variant="secondary" onClick={onClose}>
                        {cancelButtonText}
                    </Button>
                    <Button variant="danger" onClick={onConfirm}>
                        {confirmButtonText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationDialog;
