import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Search, FileText, BookOpen, Trophy } from 'lucide-react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function Index({ terms, filters }) {
    const { t } = useLanguage();
    const [search, setSearch] = useState(filters.search || '');

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get('/', { search }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    return (
        <>
            <Head title={t('search.title')} />
            
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                    {t('search.title')}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {t('search.subtitle')}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <LanguageSwitcher />
                                <a
                                    href="/leaderboard"
                                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                                >
                                    <Trophy className="h-5 w-5" />
                                    {t('leaderboard.title')}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-8">
                        <div className="relative max-w-2xl">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                type="text"
                                placeholder={t('search.placeholder')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-12 text-lg dark:text-white"
                            />
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                            {t('search.found_terms', { count: terms.total })}
                        </p>
                    </div>

                    {/* Results */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {terms.data.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-500 text-lg">{t('search.no_results')}</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    {t('search.try_adjusting')}
                                </p>
                            </div>
                        ) : (
                            terms.data.map((term) => (
                                <Card 
                                    key={term.id} 
                                    className="hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => {
                                        console.log(term.id);
                                        router.visit(route('terms.verify', term.id));
                                    }}
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg mb-2">
                                                    {term.term_en}
                                                </CardTitle>
                                                <CardDescription className="text-xl font-arabic">
                                                    {term.term_ar}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {/* Resource Info */}
                                            <div className="flex items-center gap-2 text-sm">
                                                <BookOpen className="h-4 w-4 text-gray-500" />
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                    {term.resource_page?.resource?.name || t('search.unknown_resource')}
                                                </span>
                                            </div>
                                            
                                            {/* Page Number */}
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">
                                                    {t('common.page')} {term.resource_page?.page_number || 'N/A'}
                                                </Badge>
                                            </div>

                                            {/* Created Date */}
                                            <div className="text-xs text-gray-500 mt-2">
                                                {t('search.added')}: {new Date(term.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {terms.last_page > 1 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {terms.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (link.url) {
                                            router.visit(link.url, {
                                                preserveState: true,
                                                preserveScroll: false,
                                            });
                                        }
                                    }}
                                    disabled={!link.url}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        link.active
                                            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                                            : link.url
                                            ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
