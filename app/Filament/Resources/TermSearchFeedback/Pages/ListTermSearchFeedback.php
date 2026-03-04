<?php

namespace App\Filament\Resources\TermSearchFeedback\Pages;

use App\Filament\Resources\TermSearchFeedback\TermSearchFeedbackResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListTermSearchFeedback extends ListRecords
{
    protected static string $resource = TermSearchFeedbackResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
