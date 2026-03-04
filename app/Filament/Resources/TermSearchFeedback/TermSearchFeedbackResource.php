<?php

namespace App\Filament\Resources\TermSearchFeedback;

use App\Filament\Resources\TermSearchFeedback\Pages\CreateTermSearchFeedback;
use App\Filament\Resources\TermSearchFeedback\Pages\EditTermSearchFeedback;
use App\Filament\Resources\TermSearchFeedback\Pages\ListTermSearchFeedback;
use App\Filament\Resources\TermSearchFeedback\Schemas\TermSearchFeedbackForm;
use App\Filament\Resources\TermSearchFeedback\Tables\TermSearchFeedbackTable;
use App\Models\TermSearchFeedback;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class TermSearchFeedbackResource extends Resource
{
    protected static ?string $model = TermSearchFeedback::class;
    
    protected static ?string $navigationLabel = 'التقييمات والملاحظات';
    protected static ?string $pluralModelLabel = 'التقييمات والملاحظات';
    protected static ?string $modelLabel = 'تقييم / ملاحظة';
    protected static \UnitEnum|string|null $navigationGroup = 'المحتوى والإدارة';
    protected static ?int $navigationSort = 4;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChatBubbleLeftEllipsis;

    public static function form(Schema $schema): Schema
    {
        return TermSearchFeedbackForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return TermSearchFeedbackTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListTermSearchFeedback::route('/'),
            'create' => CreateTermSearchFeedback::route('/create'),
            'edit' => EditTermSearchFeedback::route('/{record}/edit'),
        ];
    }
}
