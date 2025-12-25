<x-filament-panels::page>
    @if ($form = $this->getForm())
        <x-filament-panels::form wire:submit="import">
            {{ $form }}

            <x-filament-panels::form.actions
                :actions="$this->getCachedFormActions()"
                :full-width="$this->hasFullWidthFormActions()"
            />
        </x-filament-panels::form>
    @endif

    @if ($this->hasErrors())
        <x-filament::section>
            <x-filament::card>
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-danger-600 dark:text-danger-400">
                        Import Errors
                    </h3>

                    @if ($errors = $this->getErrors())
                        <div class="space-y-2">
                            @foreach ($errors as $error)
                                <div class="p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
                                    <p class="text-sm text-danger-700 dark:text-danger-300">
                                        {{ $error }}
                                    </p>
                                </div>
                            @endforeach
                        </div>
                    @endif
                </div>
            </x-filament::card>
        </x-filament::section>
    @endif

    @script
    <script>
        document.addEventListener('livewire:initialized', () => {
            Livewire.on('import-method-changed', (method) => {
                // Handle any client-side updates when import method changes
                console.log('Import method changed to:', method);
            });
        });
    </script>
    @endscript
</x-filament-panels::page>
```

Now I need to add the ImportTerms page to the Filament navigation. Let me check the current Filament provider:
