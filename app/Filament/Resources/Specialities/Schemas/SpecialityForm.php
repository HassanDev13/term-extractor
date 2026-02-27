<?php

namespace App\Filament\Resources\Specialities\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class SpecialityForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
            ]);
    }
}
