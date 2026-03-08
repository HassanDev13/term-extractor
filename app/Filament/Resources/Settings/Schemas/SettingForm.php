<?php

namespace App\Filament\Resources\Settings\Schemas;

use Filament\Schemas\Schema;

class SettingForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Schemas\Components\Section::make('Setting Configuration')
                    ->schema([
                        \Filament\Forms\Components\TextInput::make('category')
                            ->required()
                            ->maxLength(255)
                            ->default('general'),
                        \Filament\Forms\Components\TextInput::make('key')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        \Filament\Forms\Components\Select::make('type')
                            ->options([
                                'text' => 'Text',
                                'boolean' => 'Boolean (True/False)',
                                'json' => 'JSON',
                                'number' => 'Number',
                            ])
                            ->default('text')
                            ->required()
                            ->live(),
                        \Filament\Forms\Components\Textarea::make('value')
                            ->required()
                            ->columnSpanFull()
                            ->visible(fn (\Filament\Schemas\Components\Utilities\Get $get) => in_array($get('type'), ['text', 'json', 'number'])),
                        \Filament\Forms\Components\Toggle::make('value_bool')
                            ->label('Value')
                            ->visible(fn (\Filament\Schemas\Components\Utilities\Get $get) => $get('type') === 'boolean')
                            ->afterStateHydrated(function (\Filament\Forms\Components\Toggle $component, ?\App\Models\Setting $record) {
                                if ($record && $record->type === 'boolean') {
                                    $component->state($record->value === '1' || $record->value === 'true');
                                }
                            })
                            ->dehydrated(false)
                            ->live()
                            ->afterStateUpdated(function ($state, \Filament\Schemas\Components\Utilities\Set $set) {
                                $set('value', $state ? '1' : '0');
                            }),
                    ])
                    ->columns(2),
            ]);
    }
}
