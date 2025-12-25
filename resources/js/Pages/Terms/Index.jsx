import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import { Input } from "@/Components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import {
    Search,
    FileText,
    BookOpen,
    Trophy,
    Star,
    Upload,
    Eye,
    Layers,
} from "lucide-react";
import { useLanguage } from "@/Contexts/LanguageContext";
import TermStatsModal from "@/Components/TermStatsModal";

export default function Index({ groupedTerms = [], filters }) {
    const { t } = useLanguage();
    const [search, setSearch] = useState(filters.search || "");
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                "/",
                { search },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleTermClick = (termGroup) => {
        setSelectedTerm(termGroup);
        setIsModalOpen(true);
    };

    return (
        <>
            <Head title={t("search.title")} />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div className="flex-1">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                    {t("search.title")}
                                </h1>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                    {t("search.subtitle")}
                                </p>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3">
                                <a
                                    href="/check"
                                    className="flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
                                >
                                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="hidden sm:inline">
                                        Check Terms
                                    </span>
                                    <span className="sm:hidden">Check</span>
                                </a>
                                <a
                                    href="/leaderboard"
                                    className="flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
                                >
                                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="hidden sm:inline">
                                        {t("leaderboard.title")}
                                    </span>
                                    <span className="sm:hidden">
                                        {t("leaderboard.short")}
                                    </span>
                                </a>
                                <a
                                    href="/upload"
                                    className="flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
                                >
                                    <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="hidden sm:inline">
                                        Upload
                                    </span>
                                    <span className="sm:hidden">Upload</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6 sm:mb-8">
                        <div className="relative max-w-2xl">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                            <Input
                                type="text"
                                placeholder={t("search.placeholder")}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8 sm:pl-10 h-10 sm:h-12 text-base sm:text-lg dark:text-white"
                            />
                        </div>
                        {search && (
                            <p className="mt-2 text-xs sm:text-sm text-gray-500">
                                Found {groupedTerms.length} unique term
                                {groupedTerms.length !== 1 ? "s" : ""}
                            </p>
                        )}
                    </div>

                    {/* Results */}
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {!search ? (
                            <div className="col-span-full text-center py-8 sm:py-12">
                                <Search className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                                <p className="text-gray-500 text-base sm:text-lg">
                                    Enter a search term to get started
                                </p>
                                <p className="text-gray-400 text-xs sm:text-sm mt-2">
                                    Search is case-insensitive and will group
                                    similar terms
                                </p>
                            </div>
                        ) : groupedTerms.length === 0 ? (
                            <div className="col-span-full text-center py-8 sm:py-12">
                                <FileText className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                                <p className="text-gray-500 text-base sm:text-lg">
                                    {t("search.no_results")}
                                </p>
                                <p className="text-gray-400 text-xs sm:text-sm mt-2">
                                    {t("search.try_adjusting")}
                                </p>
                            </div>
                        ) : (
                            groupedTerms.map((termGroup, idx) => {
                                return (
                                    <Card
                                        key={idx}
                                        className="hover:shadow-lg transition-shadow cursor-pointer"
                                        onClick={() =>
                                            handleTermClick(termGroup)
                                        }
                                    >
                                        <CardHeader className="p-3 sm:p-6">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <CardTitle className="text-base sm:text-lg line-clamp-2 flex-1">
                                                    {termGroup.display_term_en ||
                                                        "N/A"}
                                                </CardTitle>
                                            </div>
                                            <CardDescription
                                                className="text-lg sm:text-xl font-arabic line-clamp-2"
                                                dir="rtl"
                                            >
                                                {termGroup.display_term_ar ||
                                                    "N/A"}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-3 sm:p-6 pt-0">
                                            <div className="space-y-3">
                                                {/* Statistics Badges */}
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge
                                                        variant="default"
                                                        className="text-xs bg-blue-500"
                                                    >
                                                        <Layers className="h-3 w-3 mr-1" />
                                                        {termGroup.total_count}{" "}
                                                        occurrence
                                                        {termGroup.total_count !==
                                                        1
                                                            ? "s"
                                                            : ""}
                                                    </Badge>

                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        <BookOpen className="h-3 w-3 mr-1" />
                                                        {
                                                            termGroup.resource_count
                                                        }{" "}
                                                        book
                                                        {termGroup.resource_count !==
                                                        1
                                                            ? "s"
                                                            : ""}
                                                    </Badge>

                                                    {termGroup.variations
                                                        .length > 1 && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {
                                                                termGroup
                                                                    .variations
                                                                    .length
                                                            }{" "}
                                                            variation
                                                            {termGroup
                                                                .variations
                                                                .length !== 1
                                                                ? "s"
                                                                : ""}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Top Resources Preview */}
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    <div className="font-medium mb-1">
                                                        Top Books:
                                                    </div>
                                                    <div className="space-y-1">
                                                        {termGroup.resources
                                                            .slice(0, 2)
                                                            .map(
                                                                (
                                                                    resource,
                                                                    ridx,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            ridx
                                                                        }
                                                                        className="flex items-center justify-between"
                                                                    >
                                                                        <span className="truncate flex-1">
                                                                            {
                                                                                resource.resource_name
                                                                            }
                                                                        </span>
                                                                        <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                                                                            {
                                                                                resource.count
                                                                            }
                                                                            x
                                                                        </span>
                                                                    </div>
                                                                ),
                                                            )}
                                                        {termGroup.resources
                                                            .length > 2 && (
                                                            <div className="text-gray-500 italic">
                                                                +
                                                                {termGroup
                                                                    .resources
                                                                    .length - 2}{" "}
                                                                more...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Click to view more */}
                                                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium pt-2 border-t border-gray-200 dark:border-gray-700">
                                                    Click to view details →
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Term Statistics Modal */}
            <TermStatsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                termGroup={selectedTerm}
            />
        </>
    );
}
