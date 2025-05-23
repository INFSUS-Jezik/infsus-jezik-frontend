import type { FC, ReactNode } from "react";
import { Link } from "react-router-dom";

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-white">
            {/* Top Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-8">
                            <h1 className="text-xl font-semibold text-gray-800">INFSUS - Jezik</h1>
                            <div className="flex space-x-6">
                                <Link
                                    to="/courses"
                                    className="text-gray-600 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                                >
                                    Courses
                                </Link>
                                <Link
                                    to="/classrooms"
                                    className="text-gray-600 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                                >
                                    Classrooms
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main content area */}
            <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
        </div>
    );
};

export default MainLayout;
