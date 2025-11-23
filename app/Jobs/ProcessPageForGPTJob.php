<?php

namespace App\Jobs;

use App\Models\ResourcePage;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;

class ProcessPageForGPTJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected ResourcePage $page;

    /**
     * Create a new job instance.
     *
     * @param ResourcePage $page
     */
    public function __construct(ResourcePage $page)
    {
        $this->page = $page;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $text = $this->page->text ?? '';

            if (empty(trim($text))) {
                Log::warning("ResourcePage {$this->page->id} has empty text. Skipping GPT processing.");
                return;
            }

            $prompt = "Extract all technical terms from the text.";
            $jsonInstruction = "\n\nPlease output the result as a valid JSON array of objects. Each object should have 'term_en' and 'term_ar' keys. Example: [{\"term_en\": \"Computer\", \"term_ar\": \"حاسوب\"}]";
            $fullPrompt = $prompt . $jsonInstruction . "\n\n" . $text;

            $response = OpenAI::chat()->create([
                'model' => env('OPENAI_MODEL', 'gpt-4'),
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a helpful assistant that extracts terms and outputs JSON.'],
                    ['role' => 'user', 'content' => $fullPrompt],
                ],
                'temperature' => 0.3, // Lower temperature for more deterministic JSON
            ]);

            $gptOutput = $response->choices[0]->message->content ?? '';

            // Attempt to parse JSON
            $terms = json_decode($gptOutput, true);
            
            // If direct decode fails, try to find JSON block
            if (json_last_error() !== JSON_ERROR_NONE) {
                if (preg_match('/\[.*\]/s', $gptOutput, $matches)) {
                    $terms = json_decode($matches[0], true);
                }
            }

            if (json_last_error() === JSON_ERROR_NONE && is_array($terms)) {
                foreach ($terms as $term) {
                    if (isset($term['term_en']) && isset($term['term_ar'])) {
                        $this->page->terms()->create([
                            'term_en' => $term['term_en'],
                            'term_ar' => $term['term_ar'],
                        ]);
                    }
                }
            } else {
                Log::warning("Failed to parse JSON from GPT output for page {$this->page->id}. Output: " . substr($gptOutput, 0, 100));
            }

            $this->page->update([
                'gpt_text' => $gptOutput,
                'status'   => 'done',
            ]);

            Log::info("ResourcePage {$this->page->id} processed successfully with GPT.");

        } catch (Exception $e) {
            Log::error("ProcessPageForGPTJob failed for page {$this->page->id}", [
                'error' => $e->getMessage(),
            ]);

            $this->page->update([
                'status'        => 'error',
                'error_message' => $e->getMessage(),
            ]);
        }
    }
}
