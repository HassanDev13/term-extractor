<?php

namespace App\Filament\Resources\TermSearchFeedback\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Select;
use Filament\Schemas\Schema;

class TermSearchFeedbackForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('term')
                    ->label('المصطلح')
                    ->required(),
                Toggle::make('is_positive')
                    ->label('التقييم (مفيد؟)')
                    ->required(),
                Select::make('user_id')
                    ->label('المستخدم')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload(),
                Textarea::make('feedback_text')
                    ->label('تفاصيل الملاحظة')
                    ->columnSpanFull(),
            ]);
    }
}
