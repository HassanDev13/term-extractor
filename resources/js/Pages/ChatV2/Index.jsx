import { useState, useRef } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Switch } from "@/Components/ui/switch";
import { 
    Send, Bot, User, Loader2, Search,
    FileText, ArrowLeft, Database,
    BarChart3, Zap, LogOut, TrendingUp, BookOpen, CheckCircle2,
    AlertTriangle, Mail, ShieldAlert, Quote, ExternalLink, Play
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SHOWCASE = [
    {
        en: "query",
        short: "\u0627\u0633\u062a\u0639\u0644\u0627\u0645",
        full: `\u0628\u0646\u0627\u0621\u064b \u0639\u0644\u0649 \u0646\u062a\u0627\u0626\u062c \u0627\u0644\u0628\u062d\u062b\u060c \u0627\u0644\u0645\u0635\u0637\u0644\u062d \u0627\u0644\u0623\u0643\u062b\u0631 \u0627\u0633\u062a\u0639\u0645\u0627\u0644\u0627\u064b \u0644\u0640 "query" \u0647\u0648 **\u0627\u0633\u062a\u0639\u0644\u0627\u0645** — \u0638\u0647\u0631 3 \u0645\u0631\u0627\u062a \u0645\u0646 \u0623\u0635\u0644 4 \u0641\u064a \u0645\u0635\u062f\u0631\u064a\u0646 (\u0627\u0644\u062c\u0632\u0627\u0626\u0631 \u0648\u0627\u0644\u0645\u063a\u0631\u0628). \u0627\u0644\u0628\u062f\u064a\u0644: **\u0627\u0633\u062a\u0641\u0633\u0627\u0631** (\u0633\u0648\u0631\u064a\u0627 \u2014 \u0645\u0631\u0629 \u0648\u0627\u062d\u062f\u0629).`
    },
    {
        en: "automation",
        short: "\u0623\u062a\u0645\u062a\u0629",
        full: `**\u0623\u062a\u0645\u062a\u0629** \u0647\u0648 \u0627\u0644\u0623\u0643\u062b\u0631 \u0627\u0633\u062a\u0639\u0645\u0627\u0644\u0627\u064b \u2014 4 \u0645\u0631\u0627\u062a \u0641\u064a 3 \u0645\u0635\u0627\u062f\u0631 (\u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629\u060c \u0633\u0648\u0631\u064a\u0627). \u0627\u0644\u0628\u062f\u064a\u0644: **\u062a\u0634\u063a\u064a\u0644 \u0623\u0648\u062a\u0648\u0645\u0627\u062a\u064a (\u0623\u0648\u062a\u0645\u0629)** \u2014 \u0645\u0635\u0631 2012 \u0641\u0642\u0637.`
    },
    {
        en: "per default",
        short: "\u0644\u0645 \u064a\u062c\u062f",
        full: `\u0644\u0645 \u064a\u064f\u0639\u062b\u0631 \u0639\u0644\u0649 \u0623\u064a \u0646\u062a\u064a\u062c\u0629 \u0645\u0637\u0627\u0628\u0642\u0629 \u062a\u0645\u0627\u0645\u0627\u064b \u0644\u0640 "per default" \u0641\u064a \u0642\u0627\u0639\u062f\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a. \u0627\u0644\u062a\u0639\u0628\u064a\u0631\u0627\u062a \u0627\u0644\u0645\u062d\u062a\u0645\u0644\u0629: **\u0628\u0634\u0643\u0644 \u0627\u0641\u062a\u0631\u0627\u0636\u064a** \u00b7 **\u0627\u0641\u062a\u0631\u0627\u0636\u064a\u0627\u064b** \u00b7 **\u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b**.`
    },
    {
        en: "client",
        short: "\u0632\u0628\u0648\u0646",
        full: `**\u0632\u0628\u0648\u0646** \u0647\u0648 \u0627\u0644\u062a\u0631\u062c\u0645\u0629 \u0627\u0644\u0648\u062d\u064a\u062f\u0629 \u0641\u064a \u0642\u0627\u0639\u062f\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u2014 \u0638\u0647\u0631 5 \u0645\u0631\u0627\u062a \u0641\u064a \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0633\u0648\u0631\u064a\u0629 2017 \u0641\u064a \u0633\u064a\u0627\u0642\u0627\u062a \u0645\u062e\u062a\u0644\u0641\u0629 (BitTorrent client\u060c chat client\u060c client application...).`
    },
    {
        en: "code",
        short: "\u0634\u0641\u0631\u0629",
        full: `\u062a\u0639\u0627\u062f\u0644 \u062b\u0644\u0627\u062b\u0629 \u0645\u0635\u0637\u0644\u062d\u0627\u062a: **\u0634\u0641\u0631\u0629** (\u0633\u0648\u0631\u064a\u0627 2017) \u00b7 **\u0631\u0645\u0632** (\u0645\u0635\u0631 2012) \u00b7 **\u0643\u0648\u062f** (\u0645\u0635\u0631 2012). \u0627\u0644\u062a\u0648\u0635\u064a\u0629: **\u0634\u0641\u0631\u0629** \u0644\u0643\u0648\u0646\u0647\u0627 \u0639\u0631\u0628\u064a\u0629 \u0623\u0635\u064a\u0644\u0629 \u0648\u0645\u0633\u062a\u062e\u062f\u0645\u0629 \u0641\u064a \u0645\u0635\u062f\u0631 \u062d\u062f\u064a\u062b (2017) \u0628\u062a\u0643\u0631\u0627\u0631 \u0623\u0639\u0644\u0649.`
    },
    {
        en: "configuration",
        short: "\u062a\u0634\u0643\u064a\u0644",
        full: `\u062a\u0646\u0648\u0639 \u0643\u0628\u064a\u0631 \u0628\u064a\u0646 \u0627\u0644\u062f\u0648\u0644: **\u062a\u0634\u0643\u064a\u0644** (\u0633\u0648\u0631\u064a\u0627) \u00b7 **\u062a\u0634\u0643\u064a\u0644\u0629** (\u0627\u0644\u062c\u0632\u0627\u0626\u0631) \u00b7 **\u062a\u0631\u0643\u064a\u0628\u0629 \u0627\u0644\u062d\u0627\u0633\u0648\u0628** (\u0645\u0635\u0631) \u00b7 **\u062a\u0647\u064a\u0626\u0629** (\u0627\u0644\u0645\u063a\u0631\u0628). \u0627\u0644\u0623\u0643\u062b\u0631 \u0627\u0633\u062a\u0639\u0645\u0627\u0644\u0627\u064b: **\u062a\u0634\u0643\u064a\u0644** (\u0628\u0635\u064a\u063a\u062a\u064a\u0647 \u0645\u0639\u0627\u064b).`
    },
    {
        en: "font",
        short: "\u062e\u0637",
        full: `**\u062e\u0637** \u0647\u0648 \u0627\u0644\u0623\u0643\u062b\u0631 \u0627\u0646\u062a\u0634\u0627\u0631\u0627\u064b \u2014 \u0638\u0647\u0631 \u0641\u064a 3 \u0645\u0635\u0627\u062f\u0631 (\u0633\u0648\u0631\u064a\u0627 2017\u060c \u0645\u0635\u0631 2012\u060c \u0627\u0644\u0645\u063a\u0631\u0628 2000). \u0627\u0644\u0628\u062f\u0627\u0626\u0644: \u0645\u062d\u0631\u0641 \u00b7 \u0646\u0645\u0637 \u062e\u0637 \u00b7 \u0646\u0645\u0637 \u0637\u0628\u0627\u0639\u064a (كلها \u0641\u064a \u0627\u0644\u0645\u0635\u062f\u0631 \u0627\u0644\u0645\u0635\u0631\u064a \u0641\u0642\u0637).`
    },
    {
        en: "file",
        short: "\u0645\u0644\u0641",
        full: `**\u0645\u0644\u0641** \u0645\u062a\u0641\u0642 \u0639\u0644\u064a\u0647 \u0641\u064a 3 \u0645\u0635\u0627\u062f\u0631 (\u0633\u0648\u0631\u064a\u0627\u060c \u0645\u0635\u0631\u060c \u0627\u0644\u0645\u063a\u0631\u0628). \u0627\u0644\u0628\u062f\u0627\u0626\u0644 \u0641\u064a \u0627\u0644\u0645\u0635\u062f\u0631 \u0627\u0644\u0645\u0635\u0631\u064a: \u0645\u0633\u062a\u0646\u062f \u00b7 \u0633\u062c\u0644 \u00b7 \u0645\u062c\u0644\u062f \u00b7 \u0645\u0636\u0628\u0637\u0629.`
    },
    {
        en: "tester",
        short: "\u0645\u062e\u062a\u0628\u0631",
        full: `**\u0645\u062e\u062a\u0628\u0631** \u0638\u0647\u0631 \u0641\u064a \u0645\u0635\u062f\u0631\u064a\u0646 (\u0633\u0648\u0631\u064a\u0627 2017\u060c \u0645\u0635\u0631 2012). \u0627\u0644\u0645\u0635\u0637\u0644\u062d\u0627\u062a \u0627\u0644\u0645\u0631\u0643\u0628\u0629 \u0643\u0644\u0647\u0627 \u0645\u0634\u062a\u0642\u0629 \u0645\u0646\u0647 (\u0645\u062e\u062a\u0628\u0631 \u0628\u0631\u0645\u062c\u064a\u0627\u062a\u060c \u0645\u062e\u062a\u0628\u0631 \u0623\u0645\u0646...).`
    },
    {
        en: "array",
        short: "\u0645\u0635\u0641\u0648\u0641\u0629",
        full: `**\u0645\u0635\u0641\u0648\u0641\u0629** \u0647\u0648 \u0627\u0644\u0623\u0643\u062b\u0631 \u0627\u0646\u062a\u0634\u0627\u0631\u0627\u064b \u2014 3 \u0645\u0635\u0627\u062f\u0631 (\u0633\u0648\u0631\u064a\u0627\u060c \u0645\u0635\u0631\u060c \u0627\u0644\u0645\u063a\u0631\u0628). \u0627\u0644\u0628\u062f\u0627\u0626\u0644 \u0641\u064a \u0627\u0644\u0645\u0635\u062f\u0631 \u0627\u0644\u0645\u0635\u0631\u064a: \u062c\u062f\u0648\u0644 \u00b7 \u0645\u062c\u0645\u0648\u0639\u0629 \u00b7 \u062a\u0631\u062a\u064a\u0628 \u00b7 \u0635\u0641\u064a\u0641.`
    },
];

function ShowcaseTable() {
    const [open, setOpen] = useState(null);
    return (
        <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto_auto] bg-slate-50 border-b border-slate-100 px-5 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                <span>المصطلح الإنجليزي</span>
                <span className="text-center px-6">بإختصار</span>
                <span className="w-8" />
            </div>
            {SHOWCASE.map((row, i) => (
                <div key={i} className="border-b border-slate-100 last:border-0">
                    {/* Clickable row */}
                    <button
                        onClick={() => setOpen(open === i ? null : i)}
                        className="w-full grid grid-cols-[1fr_auto_auto] items-center px-5 py-4 bg-white hover:bg-blue-50/40 transition-colors text-right group"
                    >
                        <span className="font-mono font-bold text-slate-700 text-sm group-hover:text-blue-700 transition-colors">{row.en}</span>
                        <span className="px-6">
                            <span className="bg-blue-50 text-blue-700 font-black text-sm px-3 py-1 rounded-full border border-blue-100">{row.short}</span>
                        </span>
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${open === i ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </span>
                    </button>
                    {/* Expanded full answer */}
                    {open === i && (
                        <div className="px-5 pb-5 bg-slate-50 border-t border-slate-100">
                            <div className="mt-4 bg-white rounded-2xl border border-slate-100 p-5 text-sm text-slate-600 leading-relaxed font-medium prose prose-sm prose-slate max-w-none text-right" dir="rtl">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}
                                    components={{
                                        strong: ({node, ...props}) => <strong className="text-blue-700 font-black" {...props} />,
                                        p: ({node, ...props}) => <p className="mb-0" {...props} />,
                                    }}
                                >{row.full}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

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
                <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
                    <div className="w-full max-w-4xl bg-white/80 backdrop-blur-2xl border border-slate-200/80 rounded-2xl shadow-lg shadow-slate-900/5 px-4 h-14 flex items-center justify-between">

                        {/* Logo */}
                        <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-xl shadow-sm">
                                <img src="/images/logo.png" alt="Logo" className="h-5 w-5 object-contain brightness-0 invert" />
                            </div>
                            <span className="text-sm font-black text-slate-800 tracking-tight">مشروع التعريب</span>
                        </div>

                        {/* Desktop links */}
                        <div className="hidden md:flex items-center gap-1">
                            <a href="#methodology" className="relative px-4 py-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors rounded-xl hover:bg-blue-50 group">
                                المنهجية
                            </a>
                            <Link href={route('thanks')} className="relative px-4 py-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors rounded-xl hover:bg-blue-50">
                                شكر وتقدير
                            </Link>
                            {auth.user && (
                                <>
                                    <div className="w-px h-5 bg-slate-200 mx-1" />
                                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                                        <div className="bg-blue-600 text-white rounded-lg p-0.5"><User className="h-3 w-3" /></div>
                                        <span className="text-blue-700 text-xs font-bold">{auth.user.name}</span>
                                    </div>
                                    <Link href={route('logout')} method="post" as="button" className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                        <LogOut className="h-3.5 w-3.5" /><span>خروج</span>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileMenuOpen(o => !o)}
                            className="md:hidden flex flex-col items-center justify-center w-9 h-9 rounded-xl hover:bg-slate-100 transition-colors gap-1.5"
                            aria-label="القائمة"
                        >
                            <span className={`block w-4.5 h-0.5 bg-slate-600 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} style={{width:'18px'}} />
                            <span className={`block h-0.5 bg-slate-600 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 scale-x-0' : ''}`} style={{width:'14px'}} />
                            <span className={`block h-0.5 bg-slate-600 rounded-full transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} style={{width:'18px'}} />
                        </button>
                    </div>

                    {/* Mobile dropdown */}
                    {mobileMenuOpen && (
                        <div className="absolute top-[72px] left-4 right-4 max-w-4xl mx-auto bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden">
                            <div className="p-2 space-y-0.5">
                                <a
                                    href="#methodology"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 font-bold text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    المنهجية
                                </a>
                                <Link
                                    href={route('thanks')}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 font-bold text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                    شكر وتقدير
                                </Link>
                                {auth.user && (
                                    <>
                                        <div className="h-px bg-slate-100 mx-2 my-1" />
                                        <Link href={route('logout')} method="post" as="button" className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 font-bold text-sm hover:bg-red-50 w-full transition-colors">
                                            <LogOut className="h-4 w-4" /><span>خروج</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </nav>

                {/* Hero Section */}
                <header className="relative pt-28 md:pt-40 pb-10 md:pb-20 overflow-hidden">
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



                {/* Showcase Section */}
                <section className="py-20 px-4 bg-slate-50 border-b border-slate-100">
                    <div className="container mx-auto max-w-5xl">
                        <div className="text-center mb-12 space-y-3">
                            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                                نتائج <span className="text-blue-600">حقيقية</span> من الأداة
                            </h3>
                            <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto font-medium">
                                عينة من مصطلحات جرى البحث عنها فعلياً — اضغط على أي صف لعرض الإجابة الكاملة.
                            </p>
                        </div>

                        {/* Table */}
                        <ShowcaseTable />
                    </div>
                </section>

                {/* Methodology Section */}

                <section id="methodology" className="py-20 px-4 bg-slate-50 border-y border-slate-100">
                    <div className="container mx-auto max-w-5xl">
                        <div className="text-center mb-14 space-y-3">
                           
                            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                                كيف نختار <span className="text-blue-600">المصطلح الأنسب؟</span>
                            </h3>
                            <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto font-medium">
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
                                <div key={i} className="relative bg-white rounded-3xl p-7 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group">
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

                {/* Limitations Section */}
                <section className="py-20 px-4 bg-slate-50 border-y border-slate-100">
                    <div className="container mx-auto max-w-5xl">
                        <div className="text-center mb-12 space-y-3">
                            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                                ما الذي <span className="text-amber-600">يُعيقنا</span> حتى الآن؟
                            </h3>
                            <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto font-medium">
                                الشفافية جزء من منهجيتنا — نشارككم التحديات الحقيقية التي نواجهها.
                            </p>
                        </div>

                        {/* Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: <ShieldAlert className="h-6 w-6 text-amber-600" />,
                                    bg: "bg-amber-50",
                                    border: "border-amber-100 hover:border-amber-300",
                                    title: "دقة الاستخراج",
                                    desc: "عند استخراج المصطلحات من الكتب المُمسوحة ضوئياً، كانت المخرجات في الغالب صحيحة، غير أن بعض المصطلحات لم تُستخرج بشكل كامل أو دقيق بسبب جودة المسح."
                                },
                                {
                                    icon: <Mail className="h-6 w-6 text-blue-600" />,
                                    bg: "bg-blue-50",
                                    border: "border-blue-100 hover:border-blue-300",
                                    title: "طلبات المعاجم الرقمية",
                                    desc: "تواصلنا مع عدد من المجامع اللغوية لطلب نسخ رقمية من معاجمها لرفع دقة النتائج، إلا أننا لم نتلقَّ أي رد حتى الآن."
                                },
                                {
                                    icon: <Database className="h-6 w-6 text-indigo-600" />,
                                    bg: "bg-indigo-50",
                                    border: "border-indigo-100 hover:border-indigo-300",
                                    title: "جودة البيانات = جودة النتائج",
                                    desc: "المشروع يعتمد اعتماداً كبيراً على سلامة البيانات المُدخلة. كلما كانت المصادر أدق وأشمل، زادت قيمة التوصيات وفائدتها للمجامع والباحثين."
                                },
                            ].map((item, i) => (
                                <div key={i} className={`bg-white rounded-3xl p-7 border ${item.border} shadow-sm hover:shadow-lg transition-all`}>
                                    <div className={`${item.bg} w-12 h-12 rounded-2xl flex items-center justify-center mb-5`}>
                                        {item.icon}
                                    </div>
                                    <h4 className="text-lg font-black text-slate-800 mb-3">{item.title}</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                       
                    </div>
                </section>

                {/* Future Plans Section */}
                <section id="future" className="py-20 px-4 bg-slate-50 border-b border-slate-100">
                    <div className="container mx-auto max-w-5xl">
                        <div className="text-center mb-12 space-y-3">
                            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">آفاق البحث المستقبلية</h3>
                            <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto font-medium">خطواتنا القادمة نحو بناء معجم عربي ذكي وشامل.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                {
                                    icon: <Bot className="h-6 w-6 text-blue-600" />,
                                    bg: "bg-blue-50",
                                    title: "التوليد بالذكاء الاصطناعي",
                                    desc: "في حال عدم توفر المصطلح ضمن قاعدة البيانات — كما لاحظنا في مثال \"per default\" — سيتم الاستعانة بالنماذج اللغوية لاقتراح عدة بدائل، مع إتاحة الفرصة لمستهلك المعرفة لاختيار الأنسب أو اقتراح بديل آخر، على أن يُعتمد لاحقاً وفق منهجية الأكثر استعمالاً."
                                },
                                {
                                    icon: <Database className="h-6 w-6 text-indigo-600" />,
                                    bg: "bg-indigo-50",
                                    title: "توسيع قاعدة البيانات",
                                    desc: "العمل على توسيع قاعدة البيانات بشكل تدريجي لتشمل عدداً أكبر من المصطلحات المستمدة من مصادر متنوعة في مجال المعلوماتية، بما يعزز شمولية القاعدة ودقتها."
                                },
                                {
                                    icon: <Zap className="h-6 w-6 text-emerald-600" />,
                                    bg: "bg-emerald-50",
                                    title: "تطبيقات التصحيح الذكي",
                                    desc: "تطوير إضافات وتطبيقات تهدف إلى تصحيح المصطلحات آلياً، بحيث في حال استعمال مصطلح غير مناسب، يُقترح التصحيح المناسب فوراً، بما يسهم في توحيد المصطلحات وتحسين جودة الاستخدام."
                                },
                                {
                                    icon: <BarChart3 className="h-6 w-6 text-rose-600" />,
                                    bg: "bg-rose-50",
                                    title: "توسيع المجالات العلمية",
                                    desc: "توسيع نطاق العمل ليشمل مجالات علمية أخرى كالمجال الطبي والهندسي، بما يدعم قابلية تعميم المنهجية على تخصصات مختلفة وتحقيق أثر أوسع."
                                },
                            ].map((item, i) => (
                                <div key={i} className="bg-white rounded-3xl p-7 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group">
                                    <div className={`${item.bg} w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                        {item.icon}
                                    </div>
                                    <h4 className="text-lg font-black text-slate-800 mb-3">{item.title}</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonial Section */}
                <section className="py-20 px-4 bg-white border-b border-slate-100">
                    <div className="container mx-auto max-w-5xl">
                        <div className="text-center mb-12 space-y-3">
                            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                                ماذا قالوا عن <span className="text-blue-600">المشروع؟</span>
                            </h3>
                            <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto font-medium">
                                آراء متخصصين في اللغة العربية حول هذه المبادرة.
                            </p>
                        </div>

                        {/* Quote card */}
                        <div className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">

                                {/* Left — person */}
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex flex-col items-center justify-center text-center text-white gap-4">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl">
                                            <img src="/images/mokhtar.jpg" alt="د.مختار الغوث" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow">
                                            <div className="bg-blue-600 rounded-full p-1">
                                                <Quote className="h-3 w-3 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-black text-lg leading-tight">د. مختار الغوث</p>
                                        <p className="text-blue-200 text-xs font-medium mt-1 leading-relaxed">لغوي موريتاني · بروفيسور في جامعة طيبة، المدينة المنورة</p>
                                    </div>
                                    <a
                                        href="https://ar.wikipedia.org/wiki/%D9%85%D8%AE%D8%AA%D8%A7%D8%B1_%D8%A7%D9%84%D8%BA%D9%88%D8%AB"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors border border-white/20 px-3 py-1.5 rounded-full hover:border-white/40"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        ويكيبيديا
                                    </a>
                                </div>

                                {/* Right — quote + videos */}
                                <div className="p-8 flex flex-col gap-6">
                                    {/* Quote */}
                                    <div className="relative">
                                        <Quote className="absolute top-0 right-0 h-8 w-8 text-blue-100 -translate-y-1" />
                                        <blockquote className="text-slate-700 text-base md:text-lg leading-loose font-medium pr-8" dir="rtl">
                                            قرأت الأوراق وسررت بها كثيرًا، وأرجو الله أن يكتب لك التوفيق والنجاح. فكرتها جميلة، ولكنها تحتاج إلى فريق جاد ومخلص ومصابر، وإذا كتب له النجاح، فسوف تكون فيه خدمة جليلة للعربية.
                                        </blockquote>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px bg-slate-100" />

                                    {/* Videos */}
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">محاضرات مختارة</p>
                                        <div className="space-y-2">
                                            {[
                                                { title: "العودة إلى الهوية العربية", url: "https://youtu.be/MwqxPOtJJ7k" },
                                                { title: "ماذا لو ماتت اللغة العربية؟", url: "https://www.youtube.com/watch?v=PK_Ukr7ul20" },
                                                { title: "الحرب الباردة على الكينونة العربية: اللغة هوية", url: "https://www.youtube.com/watch?v=pA2nCFF5Lqc" },
                                            ].map((v, i) => (
                                                <a
                                                    key={i}
                                                    href={v.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-slate-100 hover:border-red-200 hover:bg-red-50 transition-all group"
                                                >
                                                    <div className="bg-red-500 text-white rounded-lg p-1.5 shrink-0 group-hover:scale-110 transition-transform">
                                                        <Play className="h-3 w-3 fill-white" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-600 group-hover:text-red-600 transition-colors text-right">{v.title}</span>
                                                    <ExternalLink className="h-3.5 w-3.5 text-slate-300 group-hover:text-red-400 transition-colors mr-auto shrink-0" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
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
