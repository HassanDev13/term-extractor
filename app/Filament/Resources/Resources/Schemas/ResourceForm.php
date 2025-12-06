<?php

namespace App\Filament\Resources\Resources\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class ResourceForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Forms\Components\FileUpload::make('path')
                    ->label('Upload PDF')
                    ->disk('local')
                    ->directory('resources')
                    ->acceptedFileTypes(['application/pdf'])
                    ->required()
                    ->storeFileNamesIn('name')
                    ->columnSpanFull(),
                \Filament\Forms\Components\Toggle::make('force_ocr')
                    ->label('Force OCR')
                    ->helperText('Force OCR processing even if text is extractable from PDF. Useful for scanned documents or PDFs with poor text extraction.')
                    ->default(false)
                    ->inline(false),
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                TextInput::make('status')
                    ->default('pending')
                    ->readOnly()
                    ->visibleOn('edit'),
                \Filament\Forms\Components\Select::make('verification_status')
                    ->options([
                        'unverified' => 'Unverified',
                        'accepted' => 'Accepted',
                        'rejected' => 'Rejected',
                    ])
                    ->default('unverified')
                    ->required()
                    ->reactive(),
                Textarea::make('rejection_reason')
                    ->visible(fn (\Filament\Schemas\Components\Utilities\Get $get) => $get('verification_status') === 'rejected')
                    ->columnSpanFull(),
                Textarea::make('error_message')
                    ->readOnly()
                    ->columnSpanFull()
                    ->visible(fn ($record) => $record?->error_message !== null),
            ]);
    }
}
