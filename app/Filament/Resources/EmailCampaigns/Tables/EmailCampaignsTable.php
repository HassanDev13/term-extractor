<?php

namespace App\Filament\Resources\EmailCampaigns\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Table;

class EmailCampaignsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                \Filament\Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                \Filament\Tables\Columns\TextColumn::make('subject')->searchable(),
                \Filament\Tables\Columns\TextColumn::make('target_audience')
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'all_users' => 'All Users',
                        'active_users' => 'Active Users Only',
                        'admins' => 'Administrators Only',
                        default => $state,
                    })->badge(),
                \Filament\Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->colors([
                        'warning' => 'draft',
                        'success' => 'sent',
                    ]),
                \Filament\Tables\Columns\TextColumn::make('sent_at')->dateTime()->sortable(),
                \Filament\Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
                \Filament\Actions\Action::make('test')
                    ->label('Test')
                    ->icon('heroicon-o-beaker')
                    ->color('info')
                    ->form([
                        \Filament\Forms\Components\TextInput::make('email')
                            ->label('Test Email Address')
                            ->email()
                            ->required()
                            ->default('zerrouk.mohammed.hacene@gmail.com'),
                    ])
                    ->action(function (array $data, \App\Models\EmailCampaign $record) {
                        \Illuminate\Support\Facades\Mail::to($data['email'])->send(
                            new \App\Mail\AnnouncementMail($record->subject, $record->body)
                        );
                        \Filament\Notifications\Notification::make()
                            ->title('Test email sent to ' . $data['email'])
                            ->success()
                            ->send();
                    }),
                \Filament\Actions\Action::make('send')
                    ->label('Send Campaign')
                    ->icon('heroicon-o-paper-airplane')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Send Email Campaign')
                    ->modalDescription('Are you sure you want to send this campaign? This action cannot be undone and will begin dispatching emails immediately.')
                    ->modalSubmitActionLabel('Yes, send it')
                    ->visible(fn (\App\Models\EmailCampaign $record) => $record->status === 'draft')
                    ->action(function (\App\Models\EmailCampaign $record) {
                        $record->update(['status' => 'sent', 'sent_at' => now()]);
                        \App\Jobs\SendEmailCampaignJob::dispatch($record);
                        \Filament\Notifications\Notification::make()
                            ->title('Campaign is being sent')
                            ->success()
                            ->send();
                    }),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
