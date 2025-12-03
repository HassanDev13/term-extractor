<?php

namespace App\Filament\Resources\Resources\Pages;

use App\Filament\Resources\Resources\ResourceResource;
use Filament\Resources\Pages\CreateRecord;

class CreateResource extends CreateRecord
{
    protected static string $resource = ResourceResource::class;

    protected function afterCreate(): void
    {
        $record = $this->getRecord();
        
        \App\Jobs\ProcessResourceJob::dispatch($record);
        
        \Filament\Notifications\Notification::make()
            ->title('File uploaded and processing started')
            ->success()
            ->send();
    }
}
