<?php

namespace App\Filament\Resources\Specialities;

use App\Filament\Resources\Specialities\Pages\CreateSpeciality;
use App\Filament\Resources\Specialities\Pages\EditSpeciality;
use App\Filament\Resources\Specialities\Pages\ListSpecialities;
use App\Filament\Resources\Specialities\Schemas\SpecialityForm;
use App\Filament\Resources\Specialities\Tables\SpecialitiesTable;
use App\Models\Speciality;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class SpecialityResource extends Resource
{
    protected static ?string $model = Speciality::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return SpecialityForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SpecialitiesTable::configure($table);
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
            'index' => ListSpecialities::route('/'),
            'create' => CreateSpeciality::route('/create'),
            'edit' => EditSpeciality::route('/{record}/edit'),
        ];
    }
}
