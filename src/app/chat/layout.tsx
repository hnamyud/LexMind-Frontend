import Sidebar from "@/components/chat/Sidebar";

export default function ChatLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-screen w-full bg-main text-gray-200 font-[family-name:var(--font-inter)] antialiased overflow-hidden">
            <Sidebar />
            {children}
        </div>
    );
}
