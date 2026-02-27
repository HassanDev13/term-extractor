import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, Rocket, Users, Database, Zap, Target, Calendar } from "lucide-react";

export default function Changelog() {
    return (
        <>
            <Head title="سجل التحديثات وخطة الإصدارات | تعريب" />
            <div className="min-h-screen bg-slate-50 text-slate-900 font-arabic selection:bg-blue-100 selection:text-blue-900" dir="rtl">
                
                {/* Fixed Navbar Simple */}
                <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
                    <div className="w-full max-w-4xl bg-white/80 backdrop-blur-2xl border border-slate-200/80 rounded-2xl shadow-lg px-4 h-14 flex items-center justify-between pointer-events-auto">
                        <Link href="/" className="flex items-center gap-2.5 cursor-pointer shrink-0">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-xl shadow-sm">
                                <img src="/images/logo.png" alt="Logo" className="h-5 w-5 object-contain brightness-0 invert" />
                            </div>
                            <span className="text-sm font-black text-slate-800 tracking-tight">تعريب</span>
                        </Link>
                        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                            <span>العودة للرئيسية</span>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </div>
                </nav>

                <main className="pt-32 pb-20 px-4 relative overflow-hidden">
                    {/* Background glows */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-[80px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

                    <div className="container mx-auto max-w-3xl relative z-10">
                        {/* Header */}
                        <div className="text-center mb-16 space-y-4">
                             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 w-fit mx-auto shadow-sm">
                                خريطة الطريق والتحديثات
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                                سجل <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">التحديثات</span>
                            </h1>
                            <p className="text-slate-500 text-lg mx-auto font-medium leading-relaxed">
                                تابع أحدث الإصدارات وتعرف على الميزات المخطط لها مستقبلاً في منصة تعريب.
                            </p>
                        </div>

                        {/* Changelog Timeline List */}
                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute right-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-indigo-200 to-slate-200" />

                            <div className="space-y-12">
                                {[
                                    { 
                                        status: "active",
                                        date: "04 فيفري 2026", 
                                        version: "نسخة Beta",
                                        title: "الإطلاق الأولي لمحرك البحث", 
                                        desc: "النسخة التجريبية الأولى التي تقتصر على محرك البحث الذكي.",
                                        icon: <Rocket className="h-5 w-5 text-blue-500" />,
                                        dotColor: "bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/40 ring-4 ring-blue-50",
                                        items: [
                                            "آلية عمل محرك البحث الذكي حصراً.", 
                                            "دعم البحث والتنقيب وعرض نسبة الاستعمال ونتائج المصادر.", 
                                        ]
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="relative flex items-start gap-6 group">
                                        {/* Timeline Dot */}
                                        <div className={`absolute right-[2.1rem] top-8 translate-x-1/2 w-3.5 h-3.5 rounded-full border-[1px] ${item.dotColor} z-10`} />

                                        {/* Card Content */}
                                        <div className="flex-1 pr-16 lg:pr-20">
                                            <div className="bg-white rounded-[2rem] p-6 lg:p-8 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                                                
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5 border-b border-slate-50 pb-5">
                                                    <div className="flex items-start gap-4">
                                                        <div className="bg-slate-50/80 p-3.5 rounded-2xl shadow-sm border border-slate-100/50 mt-1">
                                                            {item.icon}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                                                <h2 className="text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">{item.title}</h2>
                                                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-100/80 text-slate-500 uppercase tracking-widest">{item.version}</span>
                                                            </div>
                                                            <div className="text-sm font-bold text-slate-400 flex items-center gap-1.5">
                                                                <Calendar className="h-4 w-4" />
                                                                {item.date}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pr-1">
                                                    <p className="text-slate-600 font-medium text-base leading-relaxed">{item.desc}</p>

                                                    {item.items && item.items.length > 0 && (
                                                        <ul className="space-y-2.5 mt-4">
                                                            {item.items.map((listItem, j) => (
                                                                <li key={j} className="flex items-start gap-3 text-slate-500 text-sm font-medium">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0 group-hover:bg-blue-400 transition-colors" />
                                                                    <span className="leading-relaxed">{listItem}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
