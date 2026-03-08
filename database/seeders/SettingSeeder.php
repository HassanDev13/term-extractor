<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'category' => 'general',
                'key' => 'site_name',
                'value' => 'تعريب',
                'type' => 'text',
            ],
            [
                'category' => 'general',
                'key' => 'maintenance_mode',
                'value' => '0', // 0 = false, 1 = true
                'type' => 'boolean',
            ],
            [
                'category' => 'email',
                'key' => 'sender_name',
                'value' => 'تعريب Support',
                'type' => 'text',
            ],
            [
                'category' => 'email',
                'key' => 'sender_email',
                'value' => 'support@thearabic.org',
                'type' => 'text',
            ],
            [
                'category' => 'limits',
                'key' => 'daily_free_credits',
                'value' => '10',
                'type' => 'number',
            ],
        ];

        foreach ($settings as $setting) {
            \App\Models\Setting::updateOrCreate(
                ['key' => $setting['key']], // search by key
                $setting // update or insert full array
            );
        }
    }
}
