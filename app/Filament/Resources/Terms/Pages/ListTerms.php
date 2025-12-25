<?php

namespace App\Filament\Resources\Terms\Pages;

use App\Filament\Resources\Terms\TermResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListTerms extends ListRecords
{
    protected static string $resource = TermResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
            \Filament\Actions\Action::make('generateBook')
                ->label('Generate Book')
                ->form([
                    \Filament\Forms\Components\Select::make('mode')
                        ->options([
                            'test' => 'Test (20 Terms)',
                            'production' => 'Production (All Terms)',
                        ])
                        ->default('test')
                        ->required(),
                ])
                ->action(function (array $data) {
                    \App\Jobs\GenerateBookJob::dispatch(
                        mode: $data['mode'],
                        user: auth()->user()
                    );
                    
                    \Filament\Notifications\Notification::make()
                        ->title('Book generation started')
                        ->body('You will be notified when the book is ready.')
                        ->success()
                        ->send();
                }),
        ];
    }
}
