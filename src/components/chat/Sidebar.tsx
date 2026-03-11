import Link from "next/link";

export default function Sidebar() {
    return (
        <nav className="w-64 bg-sidebar border-r border-gray-800 flex flex-col h-full shrink-0">
            {/* Logo Section */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-brand text-black rounded">
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                        />
                    </svg>
                </div>
                <Link href="/" className="text-xl font-bold tracking-tight text-white">
                    LexMind
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 px-4 mt-4 space-y-2 overflow-y-auto">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-white bg-gray-800 rounded transition-colors hover:bg-gray-700">
                    <svg
                        className="h-5 w-5 text-brand"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12 4v16m8-8H4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                        />
                    </svg>
                    New Chat
                </button>

                <div className="pt-6 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Recent Cases
                </div>
                <div className="space-y-1">
                    <a
                        className="block px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-all"
                        href="#"
                    >
                        Contract Review - V4
                    </a>
                    <a
                        className="block px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-all"
                        href="#"
                    >
                        IP Infringement Analysis
                    </a>
                    <a
                        className="block px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-all"
                        href="#"
                    >
                        Non-Disclosure Agreement
                    </a>
                </div>

                <div className="pt-6 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Management
                </div>
                <a
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-all"
                    href="#"
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                        />
                        <path
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                        />
                    </svg>
                    Settings
                </a>
            </div>

            {/* Bottom Auth Actions */}
            <div className="p-4 border-t border-gray-800 space-y-2">
                <Link
                    href="/login"
                    className="block w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white transition-all"
                >
                    Login
                </Link>
                <button className="w-full text-left px-3 py-2 text-sm text-red-500 hover:text-red-400 transition-all">
                    Logout
                </button>
            </div>
        </nav>
    );
}
