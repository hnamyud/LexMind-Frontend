"use client";

import { useEffect, useRef } from "react";

export default function ChatPage() {
    const chatStreamRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatStreamRef.current) {
            chatStreamRef.current.scrollTop = chatStreamRef.current.scrollHeight;
        }
    }, []);

    return (
        <main className="flex-1 flex flex-col relative">
            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="max-w-max">
                    <h1 className="typing-effect text-3xl md:text-4xl font-bold text-white tracking-tight">
                        LexMind: Advanced Legal Intelligence.
                    </h1>
                </div>
                <p className="mt-4 text-gray-500 text-sm md:text-base font-medium">
                    Sophisticated legal reasoning at your fingertips.
                </p>
            </div>

            {/* Chat Stream */}
            <section
                ref={chatStreamRef}
                className="chat-stream flex-1 overflow-y-auto px-6 py-4 space-y-8 max-w-4xl mx-auto w-full"
            >
                {/* User Message */}
                <div className="flex flex-col items-end">
                    <div className="bg-user-bubble text-gray-200 px-4 py-3 rounded max-w-[80%] text-sm leading-relaxed border border-gray-700">
                        Can you summarize the implications of the landmark ruling in{" "}
                        <em>Anderson v. City of Portland</em> regarding municipal liability
                        for private contractor negligence?
                    </div>
                    <span className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest mr-1">
                        User
                    </span>
                </div>

                {/* AI Response */}
                <div className="flex flex-col items-start">
                    <div className="ai-glow bg-ai-bubble text-gray-200 px-5 py-4 rounded max-w-[90%] text-sm leading-relaxed border border-gray-800">
                        <h4 className="text-brand font-semibold mb-2">
                            Legal Analysis: Anderson v. City of Portland
                        </h4>
                        <p className="mb-3">
                            The ruling in <em>Anderson v. City of Portland</em> significantly
                            clarified the scope of the{" "}
                            <strong>Non-Delegable Duty Doctrine</strong> within municipal law.
                            The court held that while a city may delegate the{" "}
                            <em>performance</em> of a public works project to a private
                            contractor, it cannot delegate the <em>liability</em> associated
                            with maintaining safe public thoroughfares.
                        </p>
                        <ul className="list-disc ml-5 space-y-2 text-gray-400">
                            <li>
                                <span className="text-gray-200 font-medium">
                                    Duty of Care:
                                </span>{" "}
                                The municipality retains a primary duty of care to the public
                                that remains intact regardless of contractual indemnity clauses.
                            </li>
                            <li>
                                <span className="text-gray-200 font-medium">
                                    Supervision Requirements:
                                </span>{" "}
                                The decision necessitates stricter oversight protocols for
                                municipal engineering departments when supervising third-party
                                construction.
                            </li>
                            <li>
                                <span className="text-gray-200 font-medium">
                                    Tort Threshold:
                                </span>{" "}
                                Plaintiffs no longer need to prove the city had &quot;actual
                                notice&quot; of the specific hazard if the hazard was created by
                                a contractor performing a non-delegable municipal function.
                            </li>
                        </ul>
                        <p className="mt-4 text-xs italic text-gray-500">
                            Disclaimer: This analysis is provided for informational purposes
                            and does not constitute formal legal advice.
                        </p>
                    </div>
                    <span className="text-[10px] text-brand mt-1 uppercase tracking-widest ml-1 font-bold">
                        LexMind
                    </span>
                </div>

                {/* User Message 2 */}
                <div className="flex flex-col items-end">
                    <div className="bg-user-bubble text-gray-200 px-4 py-3 rounded max-w-[80%] text-sm leading-relaxed border border-gray-700">
                        How does this impact sovereign immunity defenses in similar
                        jurisdictions?
                    </div>
                    <span className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest mr-1">
                        User
                    </span>
                </div>
            </section>

            {/* Input Area */}
            <div className="p-6 bg-main">
                <div className="max-w-4xl mx-auto relative group">
                    <input
                        className="w-full bg-[#161616] border border-gray-800 text-gray-200 text-sm py-4 pl-5 pr-14 focus:outline-none focus:border-brand focus:ring-0 rounded transition-all"
                        placeholder="Ask LexMind a legal question..."
                        type="text"
                    />
                    <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-brand transition-colors"
                        type="submit"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M13 5l7 7-7 7M5 5l7 7-7 7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                            />
                        </svg>
                    </button>
                </div>
                <div className="text-center mt-3">
                    <p className="text-[10px] text-gray-600 uppercase tracking-tighter">
                        Powered by LexiLLM V2.4 Pro
                    </p>
                </div>
            </div>
        </main>
    );
}
