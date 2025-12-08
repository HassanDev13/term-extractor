<?php

namespace App\Filament\Widgets;

use App\Models\Resource;
use App\Models\Term;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class SimpleStats extends BaseWidget
{
    protected function getStats(): array
    {
        // Get basic counts
        $totalTerms = Term::count();
        $totalResources = Resource::count();
        $totalUsers = User::count();

        // Get term status breakdown
        $acceptedTerms = Term::where('status', 'accepted')->count();
        $pendingTerms = Term::where('status', 'pending')->count();
        $rejectedTerms = Term::where('status', 'rejected')->count();

        // Calculate percentages
        $acceptanceRate = $totalTerms > 0 ? round(($acceptedTerms / $totalTerms) * 100, 1) : 0;
        $rejectionRate = $totalTerms > 0 ? round(($rejectedTerms / $totalTerms) * 100, 1) : 0;

        return [
            Stat::make('Total Terms', number_format($totalTerms))
                ->description('All extracted terms')
                ->descriptionIcon('heroicon-o-document-text')
                ->color('primary'),

            Stat::make('Accepted Terms', number_format($acceptedTerms))
                ->description($acceptanceRate . '% acceptance rate')
                ->descriptionIcon('heroicon-o-check-circle')
                ->color('success'),

            Stat::make('Pending Review', number_format($pendingTerms))
                ->description('Awaiting verification')
                ->descriptionIcon('heroicon-o-clock')
                ->color('warning'),

            Stat::make('Rejected Terms', number_format($rejectedTerms))
                ->description($rejectionRate . '% rejection rate')
                ->descriptionIcon('heroicon-o-x-circle')
                ->color('danger'),

            Stat::make('Total Resources', number_format($totalResources))
                ->description('Uploaded documents')
                ->descriptionIcon('heroicon-o-book-open')
                ->color('info'),

            Stat::make('Total Users', number_format($totalUsers))
                ->description('Registered users')
                ->descriptionIcon('heroicon-o-users')
                ->color('gray'),
        ];
    }

    protected function getColumns(): int
    {
        return 3;
    }
}
