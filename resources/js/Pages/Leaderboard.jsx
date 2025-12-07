import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Trophy, Medal, Award, ArrowLeft } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function Leaderboard({ leaderboard }) {
    const { t } = useLanguage();
    const getMedalIcon = (rank) => {
        if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
        if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
        return null;
    };

    const getRankBadgeVariant = (rank) => {
        if (rank === 1) return 'default';
        if (rank === 2) return 'secondary';
        if (rank === 3) return 'outline';
        return 'outline';
    };

    return (
        <>
            <Head title={`${t('leaderboard.title')} - ${t('leaderboard.subtitle')}`} />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <Button
                                variant="outline"
                                onClick={() => window.history.back()}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {t('common.back')}
                            </Button>
                            <LanguageSwitcher />
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <Trophy className="h-10 w-10 text-yellow-500" />
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                                {t('leaderboard.title')}
                            </h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t('leaderboard.subtitle')}
                        </p>
                    </div>

                    {/* Leaderboard Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {leaderboard.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-500 text-lg">{t('leaderboard.no_contributors')}</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    {t('leaderboard.be_first')}
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
                                                ? 'border-2 border-yellow-400 dark:border-yellow-600 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800' 
                                                : ''
                                        }`}
                                    >
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    {getMedalIcon(rank) || (
                                                        <Badge variant={getRankBadgeVariant(rank)} className="text-lg px-3 py-1">
                                                            #{rank}
                                                        </Badge>
                                                    )}
                                                    <div>
                                                        <CardTitle className="text-lg">
                                                            {contributor.name}
                                                        </CardTitle>
                                                        <CardDescription className="text-sm">
                                                            {contributor.email}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {t('leaderboard.total_edits')}
                                                </span>
                                                <Badge 
                                                    variant="default" 
                                                    className="text-lg px-4 py-1 bg-blue-600 hover:bg-blue-700"
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
                        <div className="mt-8 text-center">
                            <Card className="inline-block">
                                <CardContent className="pt-6">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {t('leaderboard.total_contributors')}: <strong>{leaderboard.length}</strong>
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {t('leaderboard.total_edits')}: <strong>
                                            {leaderboard.reduce((sum, c) => sum + parseInt(c.edit_count), 0)}
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
