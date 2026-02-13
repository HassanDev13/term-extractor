import { useState, useRef, useEffect } from "react";
import { Head } from "@inertiajs/react";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { 
    Send, Bot, User, Loader2, Sparkles, Search, MessageSquare, 
    ArrowRight, History, Globe, FileText, Layout, ArrowLeft,
    Users, MousePointer2, Database, BarChart3, BookOpen, AlertCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function LandingSearchPage() {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const resultsRef = useRef(null);

    const handleSearch = async (e, customQuery = null) => {
        if (e) e.preventDefault();
        
        const textToSearch = customQuery || query;
        if (!textToSearch.trim() || loading) return;

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
                    messages: [{ role: "user", content: textToSearch }] 
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
                <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 py-4 shadow-sm">
                    <div className="container mx-auto px-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                            <div className="bg-blue-600 p-2 rounded-xl text-white">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-slate-800 leading-tight">مشروع التعريب</h1>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Informatics Terminology Unification</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600">
                            <a href="#theory" className="hover:text-blue-600 transition-colors">نظرية المثلث</a>
                            <a href="#methodology" className="hover:text-blue-600 transition-colors">المنهجية</a>
                            <div className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px]">Version Beta</div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <header className="relative pt-40 pb-20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
                        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/50 blur-[120px] rounded-full" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/50 blur-[100px] rounded-full" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10 text-center space-y-12">
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
                                توحيد المصطلحات <br />
                                <span className="text-blue-600">بمنهجية الأكثر استعمالاً</span>
                            </h2>
                            <p className="text-slate-500 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium">
                                معجم عربي ذكي يقوم على قياس المقبولية والاستعمال الواقعي، بدلاً من التوحيد النظري الجامد.
                            </p>
                        </div>

                        {/* Large Search Bar */}
                        <div className="max-w-3xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                            <form onSubmit={handleSearch} className="relative group">
                                <div className="absolute -inset-4 bg-blue-600/5 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
                                <div className="relative flex items-center bg-white rounded-[2.5rem] border border-slate-200 p-3 shadow-2xl shadow-blue-900/5 ring-1 ring-slate-100">
                                    <div className="pr-6 text-slate-300">
                                        <Search className="h-6 w-6" />
                                    </div>
                                    <input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="ابحث عن المصطلح (مثلاً: array, cloud, algorithm)..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-xl py-4 px-4 text-right font-arabic placeholder:text-slate-300"
                                        dir="rtl"
                                    />
                                    <Button 
                                        type="submit"
                                        disabled={!query.trim() || loading}
                                        className="h-16 px-8 rounded-[2rem] bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 transition-all text-lg font-black"
                                    >
                                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "بحث ذكي"}
                                    </Button>
                                </div>
                            </form>
                            
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">مصطلحات الدراسة:</span>
                                {["array", "automation", "code", "client", "font"].map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => handleSearch(null, tag)}
                                        className="px-4 py-1.5 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-500 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Results Section */}
                {hasSearched && (
                    <section ref={resultsRef} className="bg-white border-y border-slate-200 py-20 px-4 scroll-mt-24">
                        <div className="max-w-5xl mx-auto space-y-12">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-50 p-3 rounded-2xl">
                                        <BarChart3 className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 italic">نتائج تحليل المصطلح</h3>
                                        <p className="text-slate-500 font-medium">تم استرجاع البيانات من 5 معاجم متخصصة ونموذج الأكثر استعمالاً</p>
                                    </div>
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
                                                    <div className="my-10 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                                                        <table className="w-full text-right border-collapse" {...props} />
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

                {/* Theory Section: The Acceptability Triangle */}
                <section id="theory" className="py-24 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-20 space-y-4">
                            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">نظرية مثلث قبولية المعجم</h3>
                            <p className="text-slate-500 text-lg max-w-2xl mx-auto">إطار منهجي لتقييم فعالية المعجم التخصصي من خلال ثلاث ركائز مترابطة.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "التنسيق المؤسسي",
                                    desc: "تكامل الجهود المؤسسية واللغوية وتوحيد المرجعية لضمان موثوقية العمل التراكمي.",
                                    icon: <Users className="h-8 w-8 text-blue-600" />,
                                    color: "bg-blue-50"
                                },
                                {
                                    title: "تجربة المستخدم",
                                    desc: "تيسير الوصول للمصطلح وإشراك المستهلك في خلق المصطلح وتحسينه بشكل تفاعلي.",
                                    icon: <MousePointer2 className="h-8 w-8 text-indigo-600" />,
                                    color: "bg-indigo-50"
                                },
                                {
                                    title: "نسبة التغطية",
                                    desc: "مدى شمول المعجم للمصطلحات المستعملة في الحقل التخصصي وسد فجوات الحاجة المعرفية.",
                                    icon: <Database className="h-8 w-8 text-emerald-600" />,
                                    color: "bg-emerald-50"
                                }
                            ].map((item, i) => (
                                <Card key={i} className="border-slate-200 hover:border-blue-300 transition-all hover:shadow-xl group">
                                    <CardContent className="p-8 space-y-6">
                                        <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            {item.icon}
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-800">{item.title}</h4>
                                        <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Methodology / Study Insights */}
                <section id="methodology" className="py-24 bg-slate-900 text-white rounded-[3rem] mx-4 md:mx-10 my-10 overflow-hidden relative">
                    <div className="absolute inset-0 opacity-10">
                         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:40px_40px]" />
                    </div>
                    
                    <div className="container mx-auto px-4 max-w-6xl relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-full font-black text-xs uppercase tracking-widest">
                                    <Sparkles className="h-4 w-4" /> الدراسة التطبيقية
                                </div>
                                <h3 className="text-4xl md:text-5xl font-black leading-tight">
                                    الفجوة بين <br /> <span className="text-blue-400">المعجم والتداول</span>
                                </h3>
                                <p className="text-slate-300 text-lg leading-relaxed font-medium">
                                    كشفت الدراسة التي شملت 174 متخصصاً ونماذج لغوية متطورة عن تباعد ملحوظ بين المصطلحات المعتمدة رسمياً في المعاجم القديمة وما هو مستخدم فعلياً في الواقع الرقمي الحديث.
                                </p>
                                <div className="grid grid-cols-2 gap-6 pt-4">
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                                        <div className="text-4xl font-black text-blue-400">28,000</div>
                                        <div className="text-sm text-slate-400 font-bold mt-1 uppercase">مدخل معجمي</div>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                                        <div className="text-4xl font-black text-indigo-400">174</div>
                                        <div className="text-sm text-slate-400 font-bold mt-1 uppercase">خبير متخصص</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-400/20 p-2 rounded-lg"><AlertCircle className="h-5 w-5 text-blue-400" /></div>
                                        <h4 className="font-bold text-xl">نتائج مقارنة:</h4>
                                    </div>
                                    <div className="space-y-4 font-mono text-sm">
                                        <div className="flex justify-between p-3 bg-white/5 rounded-xl">
                                            <span className="text-slate-400">Array</span>
                                            <span className="text-red-400 line-through">جدول</span>
                                            <span className="text-green-400 font-bold">مصفوفة</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-white/5 rounded-xl">
                                            <span className="text-slate-400">File</span>
                                            <span className="text-red-400 line-through">جذاذية</span>
                                            <span className="text-green-400 font-bold">ملف</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-white/5 rounded-xl">
                                            <span className="text-slate-400">Font</span>
                                            <span className="text-red-400 line-through">طاقم حروف</span>
                                            <span className="text-green-400 font-bold">خط</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 italic">مقارنة بين المعجم الموحد (2000) والواقع الاستعمالي الحديث.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer Section */}
                <footer className="py-20 border-t border-slate-200 bg-white">
                    <div className="container mx-auto px-4 text-center space-y-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-blue-600 p-2 rounded-xl text-white">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <h4 className="text-2xl font-black text-slate-800">مشروع التعريب</h4>
                            <p className="text-slate-400 text-sm max-w-md mx-auto font-medium">
                                مشروع بحثي يسعى لسد الفجوة بين التوحيد المصطلحي والقبولية الاستعمالية في حقل المعلوماتية.
                            </p>
                        </div>
                        
                        <div className="flex flex-col items-center gap-2 pt-8 border-t border-slate-50">
                            <p className="font-bold text-slate-800">حسان محمد زروق</p>
                            <p className="text-slate-400 text-sm">مهندس برمجيات | zerrouk.mohammed.hacene@gmail.com</p>
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
