import { useState, useEffect, useRef } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Switch } from "@/Components/ui/switch";
import { 
    Send, Bot, User, Loader2, Search,
    FileText, ArrowLeft, Database,
    BarChart3, Zap, LogOut, TrendingUp, BookOpen, CheckCircle2,
    AlertTriangle, Mail, ShieldAlert, Quote, ExternalLink, Play, Users, Home, AlertCircle, Check, Download
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

export default function Results({ q, initialChartData }) {
    const [query, setQuery] = useState(q || "");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [detailedMode, setDetailedMode] = useState(false);
    const { auth } = usePage().props;
    const initialSearchDone = useRef(null);
    
    // Local state for credits to update immediately without waiting for page reload
    const [credits, setCredits] = useState(auth.user?.daily_credits ?? 0);
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

    const extractChartContent = (text) => {
        if (!text) return { chartData: null, cleanText: '' };
        try {
            const match = text.match(/\{[\s\S]{0,300}?"type"\s*:\s*"(?:bar|pie)"/i);
            if (match) {
                const startIndex = match.index;
                let openBraces = 0;
                let closeBraces = 0;
                let endIndex = -1;
                
                for (let i = startIndex; i < text.length; i++) {
                    if (text[i] === '{') openBraces++;
                    if (text[i] === '}') closeBraces++;
                    if (openBraces > 0 && openBraces === closeBraces) {
                        endIndex = i;
                        break;
                    }
                }
                
                if (endIndex !== -1) {
                    const validJsonStr = text.substring(startIndex, endIndex + 1);
                    const parsed = JSON.parse(validJsonStr);
                    if (parsed.type === 'bar' || parsed.type === 'pie') {
                        let beforeText = text.substring(0, startIndex);
                        let afterText = text.substring(endIndex + 1);
                        
                        beforeText = beforeText.replace(/```(?:recharts|json)?\s*$/i, '');
                        beforeText = beforeText.replace(/#*\s*\d+\.\s*الإحصائيات المرئية[^\n]*\s*$/i, '');
                        afterText = afterText.replace(/^\s*```\n*/i, '');
                        
                        return { 
                            chartData: parsed, 
                            cleanText: (beforeText + '\n\n' + afterText).trim() 
                        };
                    }
                } else {
                    let partialText = text.substring(0, startIndex);
                    partialText = partialText.replace(/```(?:recharts|json)?\s*$/i, '');
                    partialText = partialText.replace(/#*\s*\d+\.\s*الإحصائيات المرئية[^\n]*\s*$/i, '');
                    return { chartData: null, cleanText: partialText.trim() };
                }
            }
        } catch (e) {
            // Let it fall through
        }
        return { chartData: null, cleanText: text };
    };

    const { chartData: extractedChartData, cleanText } = extractChartContent(result);
    // Use the backend-provided chart if available, otherwise fallback to extracted (if AI generated it)
    const chartData = initialChartData || extractedChartData;

    useEffect(() => {
        if (q && initialSearchDone.current !== q) {
            initialSearchDone.current = q;
            performSearch(q);
        }
    }, [q]);

    const performSearch = async (textToSearch, modeOverride = undefined) => {
        if (!textToSearch.trim() || loading) return;

        setLoading(true);
        setResult("");
        setError(null);
        
        const isDetailed = modeOverride !== undefined ? modeOverride : detailedMode;
        
        try {
            // Read updated X-XSRF-TOKEN from cookies to prevent 419 errors after login navigations
            const getXsrfToken = () => {
                const match = document.cookie.match(new RegExp('(^|;\\s*)(XSRF-TOKEN)=([^;]*)'));
                return match ? decodeURIComponent(match[3]) : '';
            };

            const response = await fetch("/api/chat_v2", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/x-ndjson",
                    "X-XSRF-TOKEN": getXsrfToken(),
                },
                body: JSON.stringify({ 
                    messages: [{ role: "user", content: textToSearch }],
                    detailed_mode: isDetailed 
                }),
            });

            if (!response.ok) {
                if (response.status === 403) {
                     const data = await response.json();
                     setError(data.error || "عذراً، لقد استنفدت رصيدك اليومي.");
                     setLoading(false);
                     return;
                }
                throw new Error("Search failed");
            }
            
            // Deduct credit visually on success start
            setCredits(c => Math.max(0, c - 1));

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
                                displayContent = displayContent.replace(/<[\|｜].*?[\|｜]>/gu, "");
                                displayContent = displayContent.replace(/<[\/]?([\|｜]DSML[\|｜])[^>]*>/gi, "");
                                displayContent = displayContent.replace(/<dsml>[\s\S]*?<\/dsml>/gi, "");
                                displayContent = displayContent.replace(/Let me try a different approach to search for this term\./gi, "");
                                displayContent = displayContent.replace(/Let me search for this term\./gi, "");
                                displayContent = displayContent.replace(/Let me look up this term\./gi, "");
                                if (displayContent.match(/^<think>/i)) displayContent = "";
                                displayContent = displayContent.replace(/^Thinking\.\.\.\s*/i, "");
                                displayContent = displayContent.trim().replace(/^_+/g, '').trim(); 
                                setResult(displayContent);
                            }
                    } catch (e) {}
                }
            }
        } catch (error) {
            console.error("Search Error:", error);
            if (error.message.includes("403")) {
                 setError("عذراً، لقد استنفدت رصيدك اليومي.");
            } else {
                 setError("⚠️ حدث خطأ أثناء الاتصال بالخادم. يرجى التحقق من اتصالك والمحاولة مرة أخرى.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        
        if (!query.trim() || loading) return;

        // Perform an Inertia visit to fetch new props (like initialChartData) from backend
        router.get(`/search`, { q: query }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    return (
        <>
            <Head title={`${query || 'بحث'} - تعريب`} />
            <div className="min-h-screen bg-slate-50 text-slate-900 font-arabic selection:bg-blue-100 selection:text-blue-900 pb-20" dir="rtl">
                
                {/* Navbar */}
                <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2 md:gap-4">
                        
                        {/* Right: Home & Back */}
                         <div className="flex items-center gap-2 md:gap-3 shrink-0">
                            <Link href="/" className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all" title="العودة للرئيسية">
                                <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
                            </Link>
                            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-xl shadow-lg shadow-blue-900/10">
                                    <img src="/images/logo.png" alt="Logo" className="h-5 w-5 object-contain brightness-0 invert" />
                                </div>
                                <span className="hidden lg:block text-sm font-black text-slate-800 tracking-tight">تعريب</span>
                            </Link>
                        </div>

                        {/* Center: Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative flex items-center gap-2 group mx-2">
                            <div className="relative flex-1">
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="ابحث..."
                                    className="w-full h-10 md:h-11 pr-10 md:pr-11 pl-4 bg-slate-100 border-none rounded-2xl text-[16px] md:text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder:font-medium"
                                />
                                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                            </div>
                            <Button 
                                type="submit" 
                                disabled={loading || credits <= 0}
                                className="h-10 md:h-11 px-4 md:px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 font-bold text-sm shrink-0 transition-all hover:scale-105 active:scale-95 hidden sm:flex"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "بحث"}
                            </Button>
                        </form>

                        {/* Left: User & Credits */}
                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                            
                             <div className="flex items-center gap-2 bg-amber-50 px-2 md:px-3 py-1.5 rounded-full border border-amber-100 text-amber-700 text-xs font-bold" title="رصيدك اليومي">
                                <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                <span className="hidden sm:inline">{auth.user?.is_unlimited ? '∞' : credits} محاولة</span>
                                <span className="sm:hidden">{auth.user?.is_unlimited ? '∞' : credits}</span>
                            </div>

                            
                            {auth.user ? (
                                null
                            ) : (
                                <Link href={route('login')} className="h-9 px-3 md:px-4 flex items-center bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 whitespace-nowrap">
                                    <span className="hidden sm:inline">تسجيل الدخول</span>
                                    <span className="sm:hidden">دخول</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="max-w-4xl mx-auto px-4 py-6 md:py-12">
                     
                     {/* Error State */}
                     {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 animate-in slide-in-from-top-4">
                            <AlertCircle className="h-6 w-6 shrink-0" />
                            <div>
                                <p className="font-bold">تنبيه</p>
                                <p className="text-sm opacity-90">{error}</p>
                            </div>
                        </div>
                     )}

                     <div className="flex items-end justify-between gap-4 mb-4 md:mb-6">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="bg-white p-2 md:p-2.5 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 shrink-0">
                                <BarChart3 className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-lg md:text-3xl font-black text-slate-800 tracking-tight">
                                    {loading ? 'جاري التحليل...' : `نتائج البحث`}
                                </h1>
                                <p className="text-slate-500 text-[10px] md:text-sm font-medium mt-0.5 md:mt-1">
                                    {loading ? 'نبحث في خوارزمياتنا المتقدمة' : `عن المصطلح: "${q || '...'}"`}
                                </p>
                            </div>
                        </div>

                         <div 
                                onClick={() => {
                                    const newMode = !detailedMode;
                                    setDetailedMode(newMode);
                                    if (query) {
                                        performSearch(query, newMode);
                                    }
                                }}
                                className="flex items-center gap-1.5 md:gap-2 bg-white px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl border border-slate-200 shadow-sm cursor-pointer select-none hover:bg-slate-50 transition-colors shrink-0"
                            >
                                <span className="text-[10px] md:text-xs font-bold text-slate-600 flex items-center gap-1 md:gap-1.5">
                                    <FileText className={`h-3 w-3 md:h-3.5 md:w-3.5 ${detailedMode ? 'text-blue-500' : 'text-slate-400'}`} />
                                    <span>وضع تفصيلي</span>
                                </span>
                                <Switch checked={detailedMode} readOnly className="scale-[0.65] md:scale-75 data-[state=checked]:bg-blue-600 pointer-events-none origin-left rtl:origin-right" />
                        </div>
                     </div>

                     <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 p-5 md:p-12 shadow-xl shadow-slate-200/40 min-h-[400px] md:min-h-[500px] relative overflow-hidden">
                        
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />
                        
                        {result ? (
                            <div className="relative z-10 prose prose-sm md:prose-lg max-w-none leading-loose font-arabic text-right animate-in fade-in duration-700 slide-in-from-bottom-4" dir="rtl">
                                
                                {chartData && (
                                    <div className="mb-12 border-b border-slate-100 pb-10">
                                        <h2 className="text-xl md:text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2 bg-slate-50 p-3 rounded-xl w-fit">
                                            <BarChart3 className="w-6 h-6 text-blue-500" />
                                            {chartData.title || "الإحصائيات المرئية"}
                                        </h2>
                                        <div className="h-72 md:h-96 w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden" dir="ltr">
                                            <ResponsiveContainer width="100%" height="100%">
                                                {chartData.type === 'bar' ? (
                                                    <BarChart data={chartData.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                                        <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                                            {chartData.data.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.isMax ? '#ef4444' : '#60a5fa'} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                ) : (
                                                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                                        <Pie data={chartData.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#3b82f6" label>
                                                            {chartData.data.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'][index % 5]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                        <Legend />
                                                    </PieChart>
                                                )}
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}

                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h1: ({node, ...props}) => <h1 className="text-xl md:text-3xl font-black mb-4 md:mb-8 pb-3 md:pb-4 border-b border-slate-100 text-slate-900" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-lg md:text-xl font-bold mt-6 md:mt-10 mb-2 md:mb-4 text-slate-800 flex items-center gap-2 bg-slate-50 p-2 md:p-3 rounded-xl w-fit" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-base md:text-lg font-bold mt-4 md:mt-6 mb-2 md:mb-3 text-slate-700" {...props} />,
                                        ul: ({node, ...props}) => <ul className="space-y-2 md:space-y-4 my-4 md:my-6 bg-slate-50/50 p-4 md:p-6 rounded-2xl border border-slate-100/50" {...props} />,
                                        li: ({node, ...props}) => <li className="relative pr-4 md:pr-6 text-sm md:text-base leading-relaxed before:content-[''] before:absolute before:right-0 before:top-2 md:before:top-3 before:w-1.5 md:before:w-2 before:h-1.5 md:before:h-2 before:bg-blue-500 before:rounded-full before:ring-2 md:before:ring-4 before:ring-blue-100" {...props} />,
                                        p: ({node, ...props}) => <p className="text-sm md:text-base leading-loose text-slate-600 mb-4" {...props} />,
                                        table: ({node, ...props}) => (
                                            <div className="my-6 md:my-8 overflow-x-auto rounded-xl md:rounded-2xl border border-slate-200 shadow-sm scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pb-2">
                                                <table className="w-full text-right border-collapse min-w-[300px] md:min-w-[500px]" {...props} />
                                            </div>
                                        ),
                                        thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
                                        th: ({node, ...props}) => <th className="p-3 md:p-4 text-slate-900 font-bold border-b border-slate-200 text-[10px] md:text-xs uppercase tracking-wider" {...props} />,
                                        td: ({node, ...props}) => <td className="p-3 md:p-4 border-b border-slate-100 text-slate-600 text-xs md:text-sm font-medium" {...props} />,
                                        strong: ({node, ...props}) => <strong className="text-blue-700 font-black bg-blue-50/50 px-1 rounded" {...props} />,
                                        code: ({node, ...props}) => <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded border border-slate-200 font-mono text-sm font-bold" {...props} />,
                                        blockquote: ({node, ...props}) => <blockquote className="border-r-4 border-blue-400 pl-4 py-2 my-6 bg-blue-50/30 rounded-r-none rounded-l-xl pr-6 text-slate-600 italic font-medium" {...props} />,
                                        a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-600 transition-colors font-bold" target="_blank" rel="noopener noreferrer" {...props} />
                                    }}
                                >
                                    {cleanText}
                                </ReactMarkdown>
                                
                                <div className="flex flex-wrap justify-end gap-3 mt-12 pt-8 border-t border-slate-100">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            navigator.clipboard.writeText(result);
                                            setIsCopied(true);
                                            setTimeout(() => setIsCopied(false), 2000);
                                        }}
                                        className="gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 rounded-xl font-bold min-w-[120px]"
                                    >
                                        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <FileText className="h-4 w-4" />}
                                        <span className={isCopied ? "text-green-500" : ""}>{isCopied ? "تم النسخ" : "نسخ النص"}</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        disabled={isDownloadingPdf}
                                        onClick={async () => {
                                            try {
                                                setIsDownloadingPdf(true);
                                                const getXsrfToken = () => {
                                                    const match = document.cookie.match(new RegExp('(^|;\\s*)(XSRF-TOKEN)=([^;]*)'));
                                                    return match ? decodeURIComponent(match[3]) : '';
                                                };
                                                const response = await fetch('/api/chat_v2/export_pdf', {
                                                    method: 'POST',
                                                    headers: { 
                                                        'Content-Type': 'application/json',
                                                        'X-XSRF-TOKEN': getXsrfToken()
                                                    },
                                                    body: JSON.stringify({ content: result, query })
                                                });
                                                if (response.ok) {
                                                    const blob = await response.blob();
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `تقرير_${query.replace(/\s+/g, '_')}.pdf`;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    a.remove();
                                                } else { 
                                                    alert('حدث خطأ أثناء إنشاء ملف PDF'); 
                                                }
                                            } catch (e) { 
                                                console.error(e); 
                                                alert('حدث خطأ أثناء التحميل'); 
                                            } finally {
                                                setIsDownloadingPdf(false);
                                            }
                                        }}
                                        className="gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl font-bold min-w-[120px]"
                                    >
                                        {isDownloadingPdf ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                                        ) : (
                                            <Download className="h-4 w-4" />
                                        )}
                                        <span className={isDownloadingPdf ? "text-red-500" : ""}>{isDownloadingPdf ? "جاري التحميل..." : "تحميل PDF"}</span>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 space-y-8 opacity-60 relative z-10">
                                {loading ? (
                                    <>
                                        <div className="relative">
                                            <div className="h-20 w-20 border-[6px] border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-2xl font-black text-slate-800 tracking-tight">جاري المعالجة...</p>
                                            <p className="text-slate-400 font-medium">نبحث في مئات المصادر الموثوقة</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center text-center max-w-md mx-auto">
                                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner rotate-3">
                                            <Search className="h-8 w-8 text-slate-300 transform -rotate-3" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-700 mb-2">في انتظار استعلامك</h3>
                                        <p className="text-slate-400 font-medium leading-relaxed">
                                            أدخل أي مصطلح تقني أو علمي للبحث عنه في قاعدة بيانات مشروع التعريب.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                     </div>

                     {/* Footerish Links */}
                     {/* Footerish Links - Minimal Centered */}
                     <footer className="mt-20 pb-8 flex flex-col items-center justify-center gap-6">
                        <div className="flex flex-wrap items-center justify-center gap-2 bg-white border border-slate-200 shadow-sm rounded-full py-2 px-6">
                            <Link href="/" className="h-8 px-3 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all group">
                                <Home className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                                <span>الرئيسية</span>
                            </Link>

                            <div className="w-px h-4 bg-slate-200"></div>
                            <a href="mailto:contact@taarib.com" className="h-8 px-3 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all group">
                                <Mail className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                                <span>تواصل معنا</span>
                            </a>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                             <span>تعريب © 2026</span>
                             <span>•</span>
                             <span>جميع الحقوق محفوظة</span>
                        </div>
                     </footer>
                </main>
            </div>
        </>
    );
}
