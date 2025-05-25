/**
 * Extracts a user-friendly error message from an error object
 * @param error - The error object (unknown type)
 * @param fallbackMessage - Default message if no specific error message is found
 * @returns A string containing the error message
 */
export function getErrorMessage(error: unknown, fallbackMessage: string = "An unexpected error occurred"): string {
    // Check for axios error with response.data.error
    if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "error" in error.response.data &&
        typeof (error.response.data as { error?: unknown }).error === "string"
    ) {
        return (error.response.data as { error: string }).error;
    }

    // Check for direct message property
    if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
    ) {
        return (error as { message: string }).message;
    }

    return fallbackMessage;
}
