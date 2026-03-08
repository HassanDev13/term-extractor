<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'category',
        'key',
        'value',
        'type',
    ];

    public static function get(string $key, $default = null)
    {
        return \Illuminate\Support\Facades\Cache::rememberForever("setting.{$key}", function () use ($key, $default) {
            $setting = self::where('key', $key)->first();
            
            if (!$setting) {
                return $default;
            }
            
            return match($setting->type) {
                'boolean' => in_array($setting->value, ['1', 'true', true], true),
                'number' => is_numeric($setting->value) ? (int) $setting->value : $setting->value,
                'json' => json_decode($setting->value, true) ?? [],
                default => $setting->value,
            };
        });
    }

    protected static function booted()
    {
        static::saved(function ($setting) {
            \Illuminate\Support\Facades\Cache::forget("setting.{$setting->key}");
        });

        static::deleted(function ($setting) {
            \Illuminate\Support\Facades\Cache::forget("setting.{$setting->key}");
        });
    }
}
