<?php

namespace App\Filament\Resources\Resources\Widgets;

use Filament\Widgets\ChartWidget;

class TermsOverTimeChart extends ChartWidget
{
    protected ?string $heading = 'Terms Over Time Chart';

    protected function getData(): array
    {
        return [
            //
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
