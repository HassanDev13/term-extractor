import { useState, useRef } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Switch } from "@/Components/ui/switch";
import { 
    Send, Bot, User, Loader2, Search,
    FileText, ArrowLeft, Database,
    BarChart3, Zap, LogOut, TrendingUp, BookOpen, CheckCircle2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function LandingSearchPage() {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [detailedMode, setDetailedMode] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { auth } = usePage().props;
    const resultsRef = useRef(null);


    const handleSearch = async (e, customQuery = null) => {
        if (e) e.preventDefault();
        
        const textToSearch = customQuery || query;
        if (!textToSearch.trim() || loading) return;

        // Ensure UI matches the actual search
        setQuery(textToSearch);
        
        setLoading(true);
        setHasSearched(true);
        setResult("");
        setIsSearching(true);
        
        // Custom scroll to results if on mobile/small screen
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

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
            setIsSearching(false);
        }
    };

    return (
        <>
            <Head title="مشروع التعريب | توحيد المصطلحات المعلوماتية" />
            <div className="min-h-screen bg-slate-50 text-slate-900 font-arabic selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden" dir="rtl">
                
                {/* Fixed Header */}
                <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
                    <div className="container mx-auto px-4 flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                                <img src="/images/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
                            </div>
                            <div>
                                <h1 className="text-base font-black text-slate-800 leading-tight">مشروع التعريب</h1>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider hidden sm:block">Informatics Terminology Unification</p>
                            </div>
                        </div>

                        {/* Desktop nav */}
                        <div className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600">
                            <a href="#methodology" className="hover:text-blue-600 transition-colors">المنهجية</a>
                            <Link href={route('thanks')} className="hover:text-blue-600 transition-colors">شكر وتقدير</Link>
                            {auth.user && (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                                        <div className="bg-blue-600 text-white rounded-full p-1"><User className="h-3 w-3" /></div>
                                        <span className="text-blue-700">{auth.user.name}</span>
                                    </div>
                                    <Link href={route('logout')} method="post" as="button" className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors">
                                        <LogOut className="h-4 w-4" /><span>خروج</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile: hamburger only */}
                        <div className="flex md:hidden items-center">
                            <button
                                onClick={() => setMobileMenuOpen(o => !o)}
                                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                                aria-label="القائمة"
                            >
                                <div className="space-y-1.5">
                                    <span className={`block w-5 h-0.5 bg-slate-600 transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                                    <span className={`block w-5 h-0.5 bg-slate-600 transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                                    <span className={`block w-5 h-0.5 bg-slate-600 transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Mobile dropdown menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3 shadow-lg">
                            <a href="#methodology" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-2.5 px-4 rounded-2xl text-slate-700 font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors">المنهجية</a>
                            <Link href={route('thanks')} className="flex items-center gap-3 py-2.5 px-4 rounded-2xl text-slate-700 font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors">شكر وتقدير</Link>
                            {auth.user && (
                                <Link href={route('logout')} method="post" as="button" className="flex items-center gap-3 py-2.5 px-4 rounded-2xl text-red-500 font-bold hover:bg-red-50 w-full transition-colors">
                                    <LogOut className="h-4 w-4" /><span>خروج</span>
                                </Link>
                            )}
                        </div>
                    )}
                </nav>

                {/* Hero Section */}
                <header className="relative pt-24 md:pt-36 pb-10 md:pb-20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
                        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-100/50 blur-[120px] rounded-full" />
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-50/50 blur-[100px] rounded-full" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <div className="space-y-5 mb-8">
                            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.2] md:leading-[1.1]">
                                توحيد المصطلحات <br />
                                <span className="text-blue-600">بمنهجية الأكثر استعمالاً</span>
                            </h2>
                            <p className="text-slate-500 text-base md:text-xl max-w-2xl mx-auto leading-relaxed font-medium px-2">
                                معجم عربي ذكي يقوم على قياس المقبولية والاستعمال الواقعي، بدلاً من التوحيد النظري الجامد.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 px-4">
                                <a 
                                    href="https://docs.google.com/document/d/YOUR_GOOGLE_DOC_ID" 
                                    target="_blank" rel="noopener noreferrer"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 text-sm"
                                >
                                    <FileText className="h-4 w-4" />
                                    <span>تصفح الورقة المفاهيمية</span>
                                </a>
                                <a 
                                    href="#methodology"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-600 px-6 py-3.5 rounded-full font-bold border border-slate-200 hover:border-blue-200 hover:text-blue-600 transition-colors active:scale-95 text-sm"
                                >
                                    <span>استكشاف المنهجية</span>
                                    <ArrowLeft className="h-4 w-4" />
                                </a>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <form onSubmit={handleSearch} className="relative">
                                {/* Mobile: stacked layout */}
                                <div className="flex flex-col sm:hidden gap-2">
                                    <div className="relative flex items-center bg-white rounded-2xl border border-slate-200 px-4 py-3 shadow-xl">
                                        <Search className="h-5 w-5 text-slate-300 shrink-0 ml-2" />
                                        <input
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="ابحث عن مصطلح..."
                                            className="flex-1 bg-transparent border-none outline-none text-base py-1 px-2 text-right font-arabic placeholder:text-slate-300"
                                            dir="rtl"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={!query.trim() || loading}
                                        className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg font-black text-base"
                                    >
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "بحث"}
                                    </Button>
                                </div>
                                {/* Desktop: inline layout */}
                                <div className="hidden sm:flex items-center bg-white rounded-[2.5rem] border border-slate-200 p-2.5 shadow-2xl shadow-blue-900/5 ring-1 ring-slate-100">
                                    <div className="pr-5 text-slate-300">
                                        <Search className="h-5 w-5" />
                                    </div>
                                    <input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="ابحث عن المصطلح (مثلاً: array, cloud, algorithm)..."
                                        className="flex-1 bg-transparent border-none outline-none text-lg py-3.5 px-3 text-right font-arabic placeholder:text-slate-300"
                                        dir="rtl"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={!query.trim() || loading}
                                        className="h-14 px-7 rounded-[2rem] bg-blue-600 hover:bg-blue-700 text-white shadow-xl font-black text-base"
                                    >
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "بحث"}
                                    </Button>
                                </div>
                            </form>

                            {/* Tags + switch row */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-3">
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto scrollbar-none">
                                    <span className="text-slate-400 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap shrink-0">شائعة:</span>
                                    {["array", "automation", "code", "client"].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => handleSearch(null, tag)}
                                            className="px-3 py-1 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm shrink-0">
                                    <label htmlFor="detailed-mode" className="text-xs font-bold text-slate-600 cursor-pointer flex items-center gap-1.5">
                                        <Zap className={`h-3.5 w-3.5 ${detailedMode ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                                        <span>مفصلة</span>
                                    </label>
                                    <Switch id="detailed-mode" checked={detailedMode} onCheckedChange={setDetailedMode} className="data-[state=checked]:bg-blue-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Results Section */}
                {hasSearched && (
                    <section ref={resultsRef} className="bg-white border-y border-slate-200 py-10 md:py-16 px-4 scroll-mt-20">
                        <div className="max-w-3xl mx-auto space-y-8">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                                <div className="bg-blue-50 p-2.5 rounded-2xl shrink-0">
                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg md:text-2xl font-black text-slate-800">نتائج تحليل المصطلح</h3>
                                    <p className="text-slate-400 text-xs md:text-sm font-medium">من معاجم متخصصة · نموذج الأكثر استعمالاً</p>
                                </div>
                            </div>

                            <div className="min-h-[400px]">
                                {result ? (
                                    <div className="prose prose-slate prose-lg max-w-none leading-relaxed font-arabic text-right animate-in fade-in duration-500" dir="rtl">
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                h1: ({node, ...props}) => <h1 className="text-4xl font-black mb-8 pb-6 border-b-4 border-blue-50 text-slate-900" {...props} />,
                                                h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-12 mb-6 text-slate-800 flex items-center gap-3" {...props} />,
                                                h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-10 mb-4 text-slate-700" {...props} />,
                                                ul: ({node, ...props}) => <ul className="space-y-4 my-8 pr-4 bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner" {...props} />,
                                                li: ({node, ...props}) => <li className="relative pr-6 before:content-[''] before:absolute before:right-0 before:top-3 before:w-2 before:h-2 before:bg-blue-500 before:rounded-full before:shadow-sm" {...props} />,
                                                table: ({node, ...props}) => (
                                                    <div className="my-6 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                                                        <table className="w-full text-right border-collapse min-w-[400px]" {...props} />
                                                    </div>
                                                ),
                                                thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
                                                th: ({node, ...props}) => <th className="p-4 text-slate-900 font-bold border-b border-slate-200 text-sm uppercase tracking-wider" {...props} />,
                                                td: ({node, ...props}) => <td className="p-4 border-b border-slate-100 text-slate-600 text-base" {...props} />,
                                                strong: ({node, ...props}) => <strong className="text-blue-700 font-black" {...props} />,
                                                code: ({node, ...props}) => <code className="bg-slate-100 text-blue-600 px-2 py-0.5 rounded-lg border border-slate-200 font-mono text-sm" {...props} />
                                            }}
                                        >
                                            {result}
                                        </ReactMarkdown>
                                        
                                        <div className="flex flex-wrap justify-end gap-2 mt-6 pt-5 border-t border-slate-100">
                                            <Button
                                                variant="outline" size="sm"
                                                onClick={() => navigator.clipboard.writeText(result)}
                                                className="gap-2 text-slate-500 hover:text-blue-600 hover:border-blue-200 text-xs"
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
                                                className="gap-2 text-slate-500 hover:text-red-600 hover:border-red-200 text-xs"
                                            >
                                                <FileText className="h-3.5 w-3.5" />
                                                <span>تحميل PDF</span>
                                            </Button>
                                        </div>
                                        {loading && (
                                            <div className="flex items-center gap-4 mt-12 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 border-dashed animate-pulse">
                                                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                                                <span className="text-blue-700 font-bold">جاري تحليل الاستناد المصطلحي وقياس المقبولية...</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-32 space-y-8">
                                        <div className="h-24 w-24 border-8 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                                        <div className="text-center space-y-2">
                                            <p className="text-3xl font-black text-slate-900">جاري مسح المعاجم...</p>
                                            <p className="text-slate-400 font-medium">نقوم بمطابقة المصطلح عبر 28,000 مدخل معجمي</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}



                {/* Methodology Section */}
                <section id="methodology" className="py-20 px-4 bg-slate-50 border-y border-slate-100">
                    <div className="container mx-auto max-w-5xl">
                        {/* Header */}
                        <div className="text-center mb-14 space-y-3">
                           
                            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                                كيف نختار <span className="text-blue-600">المصطلح الأنسب؟</span>
                            </h3>
                            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
                                نعتمد على مبدأ بسيط: <strong className="text-slate-700">الأكثر استعمالاً هو الأصح</strong>. نقيس الاستخدام الفعلي عبر مصادر متعددة ونختار الفائز.
                            </p>
                        </div>

                        {/* 3 Steps */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
                            {[
                                {
                                    step: "01",
                                    icon: <BookOpen className="h-6 w-6 text-blue-600" />,
                                    bg: "bg-blue-50",
                                    title: "جمع المصادر",
                                    desc: "نستخرج المصطلحات من معاجم متخصصة ومصادر رقمية متنوعة تمثل الاستخدام الحقيقي."
                                },
                                {
                                    step: "02",
                                    icon: <BarChart3 className="h-6 w-6 text-indigo-600" />,
                                    bg: "bg-indigo-50",
                                    title: "قياس التكرار",
                                    desc: "نحسب كم مرة ظهر كل مقابل عربي عبر المصادر المختلفة ونرتبها تنازلياً."
                                },
                                {
                                    step: "03",
                                    icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
                                    bg: "bg-emerald-50",
                                    title: "اختيار الأكثر استعمالاً",
                                    desc: "المصطلح الذي يحظى بأعلى نسبة استخدام فعلي هو المُوصى به — لا رأي لجنة، بل بيانات."
                                }
                            ].map((item, i) => (
                                <div key={i} className="relative bg-slate-50 rounded-3xl p-7 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group">
                                    <div className="absolute top-5 left-5 text-6xl font-black text-slate-100 select-none group-hover:text-blue-50 transition-colors">{item.step}</div>
                                    <div className="relative z-10 space-y-4">
                                        <div className={`${item.bg} w-12 h-12 rounded-2xl flex items-center justify-center`}>
                                            {item.icon}
                                        </div>
                                        <h4 className="text-xl font-black text-slate-800">{item.title}</h4>
                                        <p className="text-slate-500 leading-relaxed text-sm font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Live Example */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-8 md:p-10 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 pointer-events-none">
                                <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-white rounded-full blur-[80px]" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-white/20 p-2 rounded-xl">
                                        <TrendingUp className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg">مثال تطبيقي: كلمة <span className="text-blue-200 font-mono">Automation</span></h4>
                                        <p className="text-blue-200 text-xs">5 نتائج في 3 مصادر مختلفة</p>
                                    </div>
                                </div>

                                {/* Term bars */}
                                <div className="space-y-4 mb-8">
                                    {[
                                        { term: "أتمتة",           count: 4, sources: 3, pct: 80, winner: true },
                                        { term: "تشغيل أوتوماتي", count: 1, sources: 1, pct: 20, winner: false },
                                    ].map((row, i) => (
                                        <div key={i} className="space-y-1.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-bold text-sm" style={{color: row.winner ? '#86efac' : '#fca5a5'}}>{row.term}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-blue-200">{row.count} مرات · {row.sources} مصادر</span>
                                                    {row.winner && <span className="text-[10px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full">✓ مُختار</span>}
                                                </div>
                                            </div>
                                            <div className="bg-white/10 rounded-full h-2.5 overflow-hidden">
                                                <div className={`h-full rounded-full ${row.winner ? 'bg-white/80' : 'bg-white/30'}`} style={{ width: `${row.pct}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Sources breakdown */}
                                <div className="border-t border-white/20 pt-6 space-y-3">
                                    <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-3">تفصيل المصادر</p>
                                    {[
                                        { src: "معجم البيانات والذكاء الاصطناعي — السعودية",   term: "أتمتة",                  count: 3, confidence: 10 },
                                        { src: "قائمة المصطلحات المعلوماتية — سوريا 2017",     term: "أتمتة",                  count: 1, confidence: 10 },
                                        { src: "معجم الحاسبات، مجمع اللغة العربية — مصر 2012", term: "تشغيل أوتوماتي (أوتمة)", count: 1, confidence: 9  },
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-start justify-between gap-4 bg-white/10 rounded-2xl px-4 py-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-xs font-bold leading-snug">{s.src}</p>
                                                <p className="text-blue-200 text-xs mt-0.5">المصطلح: <span className="font-bold text-white">{s.term}</span> · {s.count} {s.count === 1 ? 'مرة' : 'مرات'}</p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <div className="text-xs font-black text-white">{s.confidence}/10</div>
                                                <div className="text-[10px] text-blue-200">ثقة</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-blue-200 text-xs mt-6 italic">النتيجة: «أتمتة» هي الأكثر استعمالاً في المصادر المدروسة، فهي المُوصى بها.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Future Plans Section */}
                <section id="future" className="py-24 px-4 bg-slate-50">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16 space-y-4">
                            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">آفاق البحث المستقبلية</h3>
                            <p className="text-slate-500 text-lg max-w-2xl mx-auto">خطواتنا القادمة نحو بناء معجم عربي ذكي وشامل.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                                <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Bot className="h-7 w-7 text-blue-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-800 mb-4">التوليد بالذكاء الاصطناعي</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    في حال عدم توفر المصطلح ضمن قاعدة البيانات، سيتم الاستعانة بالنماذج اللغوية لاقتراح عدة بدائل، مع إتاحة الفرصة لمستهلك المعرفة لاختيار الأنسب منها.
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                                <div className="bg-indigo-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Database className="h-7 w-7 text-indigo-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-800 mb-4">توسيع قاعدة البيانات</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    العمل على توسيع قاعدة البيانات بشكل تدريجي لتشمل المزيد من المعاجم والمصادر، وتطوير تطبيقات لتصحيح المصطلحات المستخدمة آلياً.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Join Community Section */}
                <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white mx-4 md:mx-10 rounded-[3rem] shadow-2xl shadow-blue-900/20 relative overflow-hidden mb-12">
                    <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                         <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-white rounded-full blur-[100px]" />
                    </div>
                    
                    <div className="container mx-auto px-4 text-center relative z-10 space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-sm font-bold animate-pulse">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            مجتمع المعرفة
                        </div>
                        
                        <h2 className="text-3xl md:text-6xl font-black tracking-tight leading-tight">
                            كن جزءاً من الحوار <br />
                            <span className="text-blue-200">حول مستقبل المصطلح العربي</span>
                        </h2>
                        
                        <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                            انضم إلى قناتنا على تيليجرام لمتابعة آخر تحديثات المشروع، والنقاشات حول توحيد المصطلحات، والمساهمة في بناء المعجم.
                        </p>

                        <div className="pt-4">
                            <a 
                                href="https://t.me/hacene_dev" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-blue-600 px-8 py-4 md:px-10 md:py-5 rounded-full font-black text-base md:text-lg hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 hover:scale-105 active:scale-95 group"
                            >
                                <Send className="h-5 w-5 md:h-6 md:w-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                انضم للقناة الآن
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer Section */}
                <footer className="py-20 border-t border-slate-200 bg-white">
                    <div className="container mx-auto px-4 text-center space-y-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 mb-2">
                                <img src="/images/logo.png" alt="Logo" className="h-12 w-12 object-contain" />
                            </div>
                            <h4 className="text-2xl font-black text-slate-800">مشروع التعريب</h4>
                            <p className="text-slate-400 text-sm max-w-md mx-auto font-medium">
                                مشروع بحثي يسعى لسد الفجوة بين التوحيد المصطلحي والقبولية الاستعمالية في حقل المعلوماتية.
                            </p>
                        </div>
                        
                        <div className="flex flex-col items-center gap-2 pt-8 border-t border-slate-50">
                            <p className="font-bold text-slate-800">حسان محمد زروق</p>
                            <p className="text-slate-400 text-sm">مهندس برمجيات | zerrouk.mohammed.hacene@gmail.com</p>
                            <div className="flex items-center gap-4 mt-3">
                                <Link href={route('thanks')} className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">شكر وتقدير</Link>
                            </div>
                            <p className="text-[10px] text-slate-300 font-black tracking-widest mt-4">© 2026 MASHROU AL-TAARIB - BETA VERSION</p>
                        </div>
                    </div>
                </footer>

                <style dangerouslySetInnerHTML={{ __html: `
                    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap');
                    
                    html {
                        scroll-behavior: smooth;
                    }

                    body {
                        font-family: 'Tajawal', sans-serif;
                        background-color: #f8fafc;
                    }
                    
                    .font-arabic {
                        font-family: 'Tajawal', sans-serif;
                    }

                    .prose {
                        --tw-prose-body: #475569;
                        --tw-prose-headings: #0f172a;
                    }

                    ::-webkit-scrollbar {
                        width: 10px;
                    }
                    ::-webkit-scrollbar-track {
                        background: #f8fafc;
                    }
                    ::-webkit-scrollbar-thumb {
                        background: #e2e8f0;
                        border-radius: 10px;
                        border: 2px solid #f8fafc;
                    }
                    ::-webkit-scrollbar-thumb:hover {
                        background: #cbd5e1;
                    }

                    ::selection {
                        background-color: #dbeafe;
                        color: #1e40af;
                    }

                    @keyframes float {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-10px); }
                        100% { transform: translateY(0px); }
                    }

                    .float-animation {
                        animation: float 4s ease-in-out infinite;
                    }
                `}} />
            </div>
        </>
    );
}
