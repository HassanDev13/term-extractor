import { Head } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Trophy, Medal, Award, ArrowLeft } from "lucide-react";
import { Button } from "@/Components/ui/button";
import LanguageSwitcher from "@/Components/LanguageSwitcher";
import { useLanguage } from "@/Contexts/LanguageContext";

export default function Leaderboard({ leaderboard }) {
    const { t } = useLanguage();
    const getMedalIcon = (rank) => {
        if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
        if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
        return null;
    };

    const getRankBadgeVariant = (rank) => {
        if (rank === 1) return "default";
        if (rank === 2) return "secondary";
        if (rank === 3) return "outline";
        return "outline";
    };

    return (
        <>
            <Head
                title={`${t("leaderboard.title")} - ${t("leaderboard.subtitle")}`}
            />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <Button
                                variant="outline"
                                onClick={() => window.history.back()}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
                            >
                                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">
                                    {t("common.back")}
                                </span>
                                <span className="sm:hidden">
                                    {t("common.back_short")}
                                </span>
                            </Button>
                            <LanguageSwitcher />
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500" />
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                                {t("leaderboard.title")}
                            </h1>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            {t("leaderboard.subtitle")}
                        </p>
                    </div>

                    {/* Leaderboard Grid */}
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {leaderboard.length === 0 ? (
                            <div className="col-span-full text-center py-8 sm:py-12">
                                <Trophy className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                                <p className="text-gray-500 text-base sm:text-lg">
                                    {t("leaderboard.no_contributors")}
                                </p>
                                <p className="text-gray-400 text-xs sm:text-sm mt-2">
                                    {t("leaderboard.be_first")}
                                </p>
                            </div>
                        ) : (
                            leaderboard.map((contributor, index) => {
                                const rank = index + 1;
                                const isTopThree = rank <= 3;

                                return (
                                    <Card
                                        key={contributor.id}
                                        className={`transition-all hover:shadow-lg ${
                                            isTopThree
                                                ? "border-2 border-yellow-400 dark:border-yellow-600 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800"
                                                : ""
                                        }`}
                                    >
                                        <CardHeader className="p-3 sm:p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    {getMedalIcon(rank) || (
                                                        <Badge
                                                            variant={getRankBadgeVariant(
                                                                rank,
                                                            )}
                                                            className="text-base sm:text-lg px-2 sm:px-3 py-1"
                                                        >
                                                            #{rank}
                                                        </Badge>
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <CardTitle className="text-base sm:text-lg truncate">
                                                            {contributor.name}
                                                        </CardTitle>
                                                        <CardDescription className="text-xs sm:text-sm truncate">
                                                            {contributor.email}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-3 sm:p-6 pt-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                    {t(
                                                        "leaderboard.total_edits",
                                                    )}
                                                </span>
                                                <Badge
                                                    variant="default"
                                                    className="text-base sm:text-lg px-3 sm:px-4 py-1 bg-blue-600 hover:bg-blue-700"
                                                >
                                                    {contributor.edit_count}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>

                    {/* Footer Stats */}
                    {leaderboard.length > 0 && (
                        <div className="mt-6 sm:mt-8 text-center">
                            <Card className="inline-block">
                                <CardContent className="p-4 sm:p-6">
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        {t("leaderboard.total_contributors")}:{" "}
                                        <strong>{leaderboard.length}</strong>
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {t("leaderboard.total_edits")}:{" "}
                                        <strong>
                                            {leaderboard.reduce(
                                                (sum, c) =>
                                                    sum +
                                                    parseInt(c.edit_count),
                                                0,
                                            )}
                                        </strong>
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
