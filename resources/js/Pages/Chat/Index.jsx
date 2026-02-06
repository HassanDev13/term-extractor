import { useState, useRef, useEffect } from "react";
import { Head } from "@inertiajs/react";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatIndex() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "مرحباً! أنا هنا لمساعدتك في البحث عن المصطلحات والموارد. عما تبحث اليوم؟",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userContent = input;
        setInput("");
        setLoading(true);

        const newMessages = [
            ...messages,
            { role: "user", content: userContent },
            { role: "assistant", content: "" }, 
        ];
        setMessages(newMessages);

        // Prepare context: previous messages + new user message
        const contextMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        contextMessages.push({ role: "user", content: userContent });

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/x-ndjson",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
                body: JSON.stringify({ messages: contextMessages }),
            });

            if (!response.ok) throw new Error("Network response was not ok");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value);
                const lines = text.split("\n");

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const json = JSON.parse(line);
                        if (json.chunk) {
                            accumulatedContent += json.chunk;
                            
                            // Filter logic: Hide content if it's purely <think>... or internal model markers
                            let displayContent = accumulatedContent;
                            
                            // Remove complete <think> blocks
                            displayContent = displayContent.replace(/<think>[\s\S]*?<\/think>/gi, "");
                            
                            // Remove <|DSML|...> or variations with unicode pipes
                            displayContent = displayContent.replace(/<[\|｜][\s\S]*?[\|｜]>/gu, "");
                            
                            // Remove <dsml>...</dsml>
                            displayContent = displayContent.replace(/<dsml>[\s\S]*?<\/dsml>/gi, "");

                            // Check for incomplete <think> block at start
                            if (displayContent.match(/^<think>/i)) {
                                displayContent = ""; // Still thinking, show placeholder
                            }
                            
                            // Also remove literal "Thinking..." if it appears at start
                            displayContent = displayContent.replace(/^Thinking\.\.\.\s*/i, "");
                            displayContent = displayContent.trim();

                            setMessages((prev) => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    role: "assistant",
                                    content: displayContent,
                                };
                                return updated;
                            });
                        }
                    } catch (e) {
                        console.error("Error parsing JSON chunk", e);
                    }
                }
            }
        } catch (error) {
            console.error(error);
            setMessages((prev) => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg.role === "assistant" && !lastMsg.content) {
                    updated[updated.length - 1] = {
                        role: "assistant",
                        content: "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.\n" + error.message,
                        isError: true,
                    };
                }
                return updated;
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title="المساعد الذكي" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-arabic">
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
                    <div className="container mx-auto flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg dark:bg-blue-900">
                            <Bot className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            المساعد الذكي
                        </h1>
                    </div>
                </header>
                
                <main className="flex-1 container mx-auto p-4 flex flex-col max-w-4xl w-full">
                    <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-3 ${
                                    msg.role === "user"
                                        ? "flex-row-reverse" // User: Avatar Right, Bubble Left
                                        : "flex-row" // Assistant: Avatar Left, Bubble Right
                                }`}
                            >
                                {/* Avatar */}
                                <div
                                    className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                        msg.role === "user"
                                            ? "bg-gray-200 dark:bg-gray-700"
                                            : "bg-blue-100 dark:bg-blue-900"
                                    }`}
                                >
                                    {msg.role === "user" ? (
                                        <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                    ) : (
                                        <Bot className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                                    )}
                                </div>
                                {/* Message Bubble */}
                                <div
                                    className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm sm:text-base ${
                                        msg.role === "user"
                                            ? "bg-blue-600 text-white rounded-tr-none text-left"
                                            : msg.isError
                                            ? "bg-red-50 text-red-600 border border-red-100 rounded-tl-none text-right"
                                            : "bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-tl-none text-right"
                                    }`}
                                >
                                    <div 
                                        className={`leading-relaxed ${msg.role === "assistant" ? "text-right" : "text-left"}`} 
                                        dir={msg.role === "assistant" ? "rtl" : "ltr"}
                                    >
                                        {msg.content ? (
                                            <ReactMarkdown 
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    ul: ({node, ...props}) => <ul className={`list-disc ${msg.role === 'assistant' ? 'pr-4 text-right' : 'pl-4 text-left'} space-y-1`} {...props} />,
                                                    ol: ({node, ...props}) => <ol className={`list-decimal ${msg.role === 'assistant' ? 'pr-4 text-right' : 'pl-4 text-left'} space-y-1`} {...props} />,
                                                    a: ({node, ...props}) => <a className="text-blue-500 hover:underline" target="_blank" {...props} />,
                                                    p: ({node, ...props}) => <p className={`mb-2 last:mb-0 ${msg.role === 'assistant' ? 'text-right' : 'text-left'}`} {...props} />,
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        ) : (
                                            <span className="animate-pulse">جاري التفكير...</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                         <div ref={scrollRef} />
                    </div>


                    <div className="sticky bottom-4">
                        <Card className="border-t shadow-lg">
                            <CardContent className="p-2">
                                <form
                                    onSubmit={handleSend}
                                    className="flex items-center gap-2"
                                >
                                    <Input
                                        value={input}
                                        onChange={(e) =>
                                            setInput(e.target.value)
                                        }
                                        placeholder="ابحث عن مصطلح أو مورد..."
                                        className="border-0 focus-visible:ring-0 shadow-none text-base font-arabic"
                                        disabled={loading}
                                        dir="rtl"
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={!input.trim() || loading}
                                        className={`h-10 w-10 shrink-0 transition-transform ${loading ? 'opacity-50' : 'hover:scale-105'}`}
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rotate-180" />} 
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </>
    );
}
