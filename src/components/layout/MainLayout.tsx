import type { FC, ReactNode } from "react";
import { Link } from "react-router-dom";

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="flex !min-w-fit min-h-screen bg-gray-50">
            {/* Navigation sidebar */}
            <nav className="w-64 bg-white shadow-md p-6">
                <div className="mb-8">
                    <h2 className="font-bold text-xl text-blue-600">INFSUS - Jezik</h2>
                </div>

                <ul className="space-y-4">
                    <li>
                        <Link
                            to="/courses"
                            className="flex items-center p-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                        >
                            Courses
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/classrooms"
                            className="flex items-center p-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                        >
                            Classrooms
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* Main content area */}
            <main className="flex-1 p-8">{children}</main>
        </div>
    );
};

export default MainLayout;
