import { useState, useEffect, useRef } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Switch } from "@/Components/ui/switch";
import { 
    Send, Bot, User, Loader2, Search,
    FileText, ArrowLeft, Database,
    BarChart3, Zap, LogOut, TrendingUp, BookOpen, CheckCircle2,
    AlertTriangle, Mail, ShieldAlert, Quote, ExternalLink, Play, Users, Home
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Results({ q }) {
    const [query, setQuery] = useState(q || "");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [detailedMode, setDetailedMode] = useState(false);
    const { auth } = usePage().props;
    const initialSearchDone = useRef(false);

    useEffect(() => {
        if (q && !initialSearchDone.current) {
            initialSearchDone.current = true;
            performSearch(q);
        }
    }, [q]);

    const performSearch = async (textToSearch) => {
        if (!textToSearch.trim() || loading) return;

        setLoading(true);
        setResult("");
        
        try {
            const response = await fetch("/api/chat_v2", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/x-ndjson",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
                body: JSON.stringify({ 
                    messages: [{ role: "user", content: textToSearch }],
                    detailed_mode: detailedMode 
                }),
            });

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
                            let displayContent = accumulatedContent;
                            displayContent = displayContent.replace(/<think>[\s\S]*?<\/think>/gi, "");
                            displayContent = displayContent.replace(/<[\|｜][\s\S]*?[\|｜]>/gu, "");
                            displayContent = displayContent.replace(/<dsml>[\s\S]*?<\/dsml>/gi, "");
                            if (displayContent.match(/^<think>/i)) displayContent = "";
                            displayContent = displayContent.replace(/^Thinking\.\.\.\s*/i, "");
                            setResult(displayContent.trim());
                        }
                    } catch (e) {}
                }
            }
        } catch (error) {
            setResult("⚠️ حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        
        // Update URL if changed
        const currentParams = new URLSearchParams(window.location.search);
        if (currentParams.get('q') !== query) {
            window.history.pushState({}, '', `/search?q=${encodeURIComponent(query)}`);
        }
        
        performSearch(query);
    };

    return (
        <>
            <Head title={`${query || 'بحث'} - تعريب`} />
            <div className="min-h-screen bg-slate-50 text-slate-900 font-arabic selection:bg-blue-100 selection:text-blue-900" dir="rtl">
                
                {/* Navbar */}
                <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
                    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                        
                        {/* Right: Logo & Home */}
                        <div className="flex items-center gap-4 shrink-0">
                            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-lg shadow-sm">
                                    <img src="/images/logo.png" alt="Logo" className="h-4 w-4 object-contain brightness-0 invert" />
                                </div>
                                <span className="hidden sm:block text-sm font-black text-slate-800 tracking-tight">تعريب</span>
                            </Link>
                        </div>

                        {/* Center: Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative flex items-center gap-2">
                            <div className="relative flex-1">
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="ابحث عن مصطلح..."
                                    className="w-full h-10 pr-10 pl-4 bg-slate-100 border-none rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="h-10 px-4 sm:px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold text-sm shrink-0"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "بحث"}
                            </Button>
                        </form>

                        {/* Left: User & Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-2 bg-slate-100/50 px-3 py-1.5 rounded-full border border-slate-200/50">
                                <label htmlFor="detailed-mode" className="text-xs font-bold text-slate-600 cursor-pointer flex items-center gap-1.5 select-none">
                                    <Zap className={`h-3 w-3 ${detailedMode ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                                    <span className="hidden sm:inline">مفصلة</span>
                                </label>
                                <Switch id="detailed-mode" checked={detailedMode} onCheckedChange={setDetailedMode} className="scale-75 data-[state=checked]:bg-blue-600" />
                            </div>
                            
                            {auth.user ? (
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 text-xs">
                                    {auth.user.name.charAt(0)}
                                </div>
                            ) : (
                                <Link href={route('login')} className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
                                    دخول
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                     <div className="flex items-center gap-3 mb-8">
                        <div className="bg-blue-50 p-2.5 rounded-2xl shrink-0">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-800">
                                {loading ? 'جاري البحث...' : `نتيجة البحث: ${q}`}
                            </h1>
                            <p className="text-slate-400 text-xs md:text-sm font-medium">
                                المصطلحات الأكثر استعمالاً وفق منهجية التعريب
                            </p>
                        </div>
                     </div>

                     <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-10 shadow-sm min-h-[400px]">
                        {result ? (
                            <div className="prose prose-slate prose-lg max-w-none leading-relaxed font-arabic text-right animate-in fade-in duration-500" dir="rtl">
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h1: ({node, ...props}) => <h1 className="text-3xl font-black mb-6 pb-4 border-b border-slate-100 text-slate-900" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-8 mb-4 text-slate-800 flex items-center gap-2" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-6 mb-3 text-slate-700" {...props} />,
                                        ul: ({node, ...props}) => <ul className="space-y-3 my-6 pr-4 bg-slate-50 p-6 rounded-2xl border border-slate-100" {...props} />,
                                        li: ({node, ...props}) => <li className="relative pr-5 before:content-[''] before:absolute before:right-0 before:top-2.5 before:w-1.5 before:h-1.5 before:bg-blue-500 before:rounded-full" {...props} />,
                                        table: ({node, ...props}) => (
                                            <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                                                <table className="w-full text-right border-collapse min-w-[400px]" {...props} />
                                            </div>
                                        ),
                                        thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
                                        th: ({node, ...props}) => <th className="p-3 text-slate-900 font-bold border-b border-slate-200 text-xs uppercase tracking-wider" {...props} />,
                                        td: ({node, ...props}) => <td className="p-3 border-b border-slate-100 text-slate-600 text-sm" {...props} />,
                                        strong: ({node, ...props}) => <strong className="text-blue-700 font-extrabold" {...props} />,
                                        code: ({node, ...props}) => <code className="bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded border border-slate-200 font-mono text-sm" {...props} />,
                                        blockquote: ({node, ...props}) => <blockquote className="border-r-4 border-blue-200 pr-4 my-4 text-slate-500 italic" {...props} />
                                    }}
                                >
                                    {result}
                                </ReactMarkdown>
                                
                                <div className="flex flex-wrap justify-end gap-2 mt-8 pt-6 border-t border-slate-100">
                                    <Button
                                        variant="outline" size="sm"
                                        onClick={() => navigator.clipboard.writeText(result)}
                                        className="gap-2 text-slate-500 hover:text-blue-600 hover:border-blue-200 text-xs h-9 rounded-xl"
                                    >
                                        <FileText className="h-3.5 w-3.5" />
                                        <span>نسخ النص</span>
                                    </Button>
                                    <Button
                                        variant="outline" size="sm"
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch('/api/chat_v2/export_pdf', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ content: result, query })
                                                    });
                                                    if (response.ok) {
                                                        const blob = await response.blob();
                                                        const url = window.URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = `term_report_${query}.pdf`;
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        a.remove();
                                                    } else { alert('Failed to generate PDF'); }
                                                } catch (e) { console.error(e); alert('Error downloading PDF'); }
                                            }}
                                        className="gap-2 text-slate-500 hover:text-red-600 hover:border-red-200 text-xs h-9 rounded-xl"
                                    >
                                        <FileText className="h-3.5 w-3.5" />
                                        <span>تحميل PDF</span>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 space-y-6 opacity-60">
                                {loading ? (
                                    <>
                                        <div className="h-16 w-16 border-[6px] border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                                        <div className="text-center space-y-1">
                                            <p className="text-xl font-bold text-slate-800">جاري التحليل...</p>
                                            <p className="text-slate-400 text-sm">نبحث في المعاجم المتخصصة</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center text-center max-w-md mx-auto">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <Search className="h-6 w-6 text-slate-300" />
                                        </div>
                                        <p className="text-slate-400 font-medium">أدخل مصطلحاً للبحث عنه في قاعدة المعرفة</p>
                                    </div>
                                )}
                            </div>
                        )}
                     </div>

                     {/* Footerish Links */}
                     <div className="mt-8 flex justify-center gap-6 text-xs font-bold text-slate-400">
                        <Link href="/" className="hover:text-blue-600 transition-colors">الرئيسية</Link>
                        <Link href={route('contribute')} className="hover:text-blue-600 transition-colors">ساهم معنا</Link>
                        <Link href="/about" className="hover:text-blue-600 transition-colors">عن المشروع</Link>
                     </div>
                </main>
            </div>
        </>
    );
}
