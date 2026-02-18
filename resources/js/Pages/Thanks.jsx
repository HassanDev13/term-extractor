import { Head, Link } from "@inertiajs/react";
import { Construction, ArrowRight, Heart } from "lucide-react";

export default function Thanks() {
    return (
        <>
            <Head title="شكر وتقدير | مشروع التعريب" />
            <div
                className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center font-arabic"
                dir="rtl"
            >
                {/* Glow blobs */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-blue-100/60 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-100/50 blur-[100px] rounded-full" />
                </div>

                <div className="relative z-10 max-w-lg w-full space-y-8">
                    {/* Icon */}
                    <div className="flex justify-center">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-3xl shadow-2xl shadow-blue-500/30">
                            <Construction className="h-10 w-10 text-white" />
                        </div>
                    </div>

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-xs font-bold uppercase tracking-widest">
                        <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                        قيد الإنجاز
                    </div>

                    {/* Heading */}
                    <div className="space-y-3">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                            صفحة <span className="text-blue-600">شكر وتقدير</span>
                        </h1>
                        <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                            نعمل على إعداد قائمة بكل من ساهم وساند هذا المشروع.
                            <br />
                            ستكون الصفحة جاهزة قريباً.
                        </p>
                    </div>

                    {/* Back button */}
                    <Link
                        href={route("home")}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <ArrowRight className="h-4 w-4" />
                        <span>العودة للرئيسية</span>
                    </Link>
                </div>
            </div>
        </>
    );
}
