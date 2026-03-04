<?php

namespace App\Filament\Resources\TermSearchFeedback\Pages;

use App\Filament\Resources\TermSearchFeedback\TermSearchFeedbackResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditTermSearchFeedback extends EditRecord
{
    protected static string $resource = TermSearchFeedbackResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
