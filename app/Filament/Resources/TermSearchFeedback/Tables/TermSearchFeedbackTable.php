<?php

namespace App\Filament\Resources\TermSearchFeedback\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class TermSearchFeedbackTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('term')
                    ->label('المصطلح')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),
                IconColumn::make('is_positive')
                    ->label('مفيد؟')
                    ->boolean()
                    ->trueIcon('heroicon-o-hand-thumb-up')
                    ->falseIcon('heroicon-o-hand-thumb-down')
                    ->trueColor('success')
                    ->falseColor('danger')
                    ->sortable(),
                TextColumn::make('feedback_text')
                    ->label('الملاحظة')
                    ->limit(50)
                    ->searchable(),
                TextColumn::make('user.name')
                    ->label('المستخدم')
                    ->sortable()
                    ->searchable()
                    ->placeholder('زائر'),
                TextColumn::make('created_at')
                    ->label('تاريخ التقييم')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: false),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
