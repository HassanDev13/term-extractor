<?php

namespace App\Filament\Resources\Terms\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class TermForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make("resource_page_id")->required()->numeric(),
            TextInput::make("term_en")->required(),
            TextInput::make("term_ar")->required(),
            TextInput::make("x")->numeric(),
            TextInput::make("y")->numeric(),
            TextInput::make("width")->numeric(),
            TextInput::make("height")->numeric(),
            \Filament\Forms\Components\Select::make("status")
                ->options([
                    "unverified" => "Unverified",
                    "accepted" => "Accepted",
                    "rejected" => "Rejected",
                ])
                ->default("unverified")
                ->required()
                ->reactive(),
            \Filament\Forms\Components\Textarea::make("rejection_reason")
                ->visible(
                    fn(\Filament\Schemas\Components\Utilities\Get $get) => $get(
                        "status",
                    ) === "rejected",
                )
                ->columnSpanFull(),
            \Filament\Forms\Components\Textarea::make("corrections")
                ->label("Corrections")
                ->placeholder("Enter any corrections or notes about this term")
                ->columnSpanFull(),
        ]);
    }
}
