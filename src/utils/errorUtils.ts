/**
 * Extracts a user-friendly error message from an error object
 * @param error - The error object (unknown type)
 * @param fallbackMessage - Default message if no specific error message is found
 * @returns A string containing the error message
 */
export function getErrorMessage(error: unknown, fallbackMessage: string = "An unexpected error occurred"): string {
    if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof (error.response.data as { message?: unknown }).message === "string"
    ) {
        return (error.response.data as { message: string }).message;
    }

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
