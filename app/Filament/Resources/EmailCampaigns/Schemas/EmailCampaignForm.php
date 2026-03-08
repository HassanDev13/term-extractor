<?php

namespace App\Filament\Resources\EmailCampaigns\Schemas;

use Filament\Schemas\Schema;

class EmailCampaignForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Schemas\Components\Section::make('Campaign Details')
                    ->schema([
                        \Filament\Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->label('Internal Name')
                            ->helperText('This is for your reference only.'),
                        \Filament\Forms\Components\TextInput::make('subject')
                            ->required()
                            ->maxLength(255)
                            ->label('Email Subject'),
                        \Filament\Forms\Components\Select::make('target_audience')
                            ->options([
                                'all_users' => 'All Users',
                                'active_users' => 'Active Users Only',
                                'admins' => 'Administrators Only',
                            ])
                            ->required()
                            ->label('Target Audience'),
                        \Filament\Forms\Components\RichEditor::make('body')
                            ->required()
                            ->columnSpanFull()
                            ->label('Email Body'),
                    ])
                    ->columns(2),
            ]);
    }
}
