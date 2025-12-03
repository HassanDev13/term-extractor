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

    public $tries = 3;
    public $timeout = 120;

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
     * Calculate the number of seconds to wait before retrying the job.
     *
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [5, 15, 30];
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $text = $this->page->text ?? '';

        if (empty(trim($text))) {
            Log::warning("ResourcePage {$this->page->id} has empty text. Skipping GPT processing.");
            return;
        }

        $prompt = "You are analyzing OCR text from a technical terminology table. The OCR is poor quality and the table structure is corrupted.\n\n";
        
        $prompt .= "STEP 1: List all English terms you see:\n";
        $prompt .= "STEP 2: List all Arabic terms you see:\n";
        $prompt .= "STEP 3: For each English term, find its correct Arabic translation based on MEANING (not position in table):\n\n";
        
        $prompt .= "VERIFICATION EXAMPLES:\n";
        $prompt .= "✓ CORRECT: 'copy' (English) matches 'نسخة' (Arabic) - both mean 'copy'\n";
        $prompt .= "✗ WRONG: 'copy' (English) with 'إصدار' (Arabic) - 'إصدار' means 'release/version', not 'copy'\n";
        $prompt .= "✓ CORRECT: 'release' (English) matches 'إصدار' (Arabic) - both mean 'release'\n";
        $prompt .= "✓ CORRECT: 'device' (English) matches 'جهاز' (Arabic) - both mean 'device'\n";
        $prompt .= "✗ WRONG: 'device' (English) with 'تجهيزة' (Arabic) - different meanings\n\n";
        
        $prompt .= "CRITICAL RULES:\n";
        $prompt .= "1. ONLY use terms that are LITERALLY PRESENT in the text below\n";
        $prompt .= "2. Do NOT generate, translate, or infer any terms\n";
        $prompt .= "3. Match English with Arabic based on SEMANTIC MEANING only\n";
        $prompt .= "4. IGNORE table structure/position - OCR corrupted it\n";
        $prompt .= "5. If you're not confident a pair is semantically correct, SKIP it\n";
        $prompt .= "6. Think: Does this English word actually mean the same as this Arabic word?\n\n";
        
        $jsonInstruction = "OUTPUT: JSON array with only semantically verified pairs.\n";
        $jsonInstruction .= "Format: [{\"term_en\": \"word\", \"term_ar\": \"كلمة\"}]\n";
        $jsonInstruction .= "Output ONLY the JSON array, nothing else.\n\n";
        
        $fullPrompt = $prompt . $jsonInstruction . "TEXT:\n" . $text;

        // Debug: Log the text being analyzed
        Log::info("ProcessPageForGPTJob - Page {$this->page->id} - Text length: " . strlen($text));
        Log::debug("ProcessPageForGPTJob - Page {$this->page->id} - First 500 chars of text: " . substr($text, 0, 500));

        $response = OpenAI::chat()->create([
            'model' => env('OPENAI_MODEL', 'gpt-4o'),
            'messages' => [
                ['role' => 'system', 'content' => 'You are a bilingual technical term matching expert. You extract terms from corrupted OCR text and match them based on semantic equivalence, not table position. You verify each pairing: does this English term actually translate to this Arabic term? If not confident, you skip it. You never generate or translate - only match existing terms. Output valid JSON only.'],
                ['role' => 'user', 'content' => $fullPrompt],
            ],
            'temperature' => 0.3,
        ]);

        $gptOutput = $response->choices[0]->message->content ?? '';

        // Debug: Log GPT output
        Log::debug("ProcessPageForGPTJob - Page {$this->page->id} - GPT Output: " . $gptOutput);

        // Attempt to parse JSON
        $terms = json_decode($gptOutput, true);
        
        // If direct decode fails, try to find JSON block
        if (json_last_error() !== JSON_ERROR_NONE) {
            if (preg_match('/\[.*\]/s', $gptOutput, $matches)) {
                $terms = json_decode($matches[0], true);
            }
        }

        if (json_last_error() === JSON_ERROR_NONE && is_array($terms)) {
            // Filter terms to only include those with both English and Arabic
            $validTerms = [];
            foreach ($terms as $term) {
                if (isset($term['term_en']) && !empty(trim($term['term_en'])) && 
                    isset($term['term_ar']) && !empty(trim($term['term_ar']))) {
                    $validTerms[] = $term;
                }
            }

            // Skip the page if no valid terms found
            if (empty($validTerms)) {
                Log::warning("ResourcePage {$this->page->id} has no terms with both English and Arabic. Skipping page.");
                $this->page->update([
                    'gpt_text' => $gptOutput,
                    'status'   => 'done',
                    'error_message' => 'No terms with both English and Arabic translations found',
                ]);
                return;
            }

            // Save only valid terms
            foreach ($validTerms as $term) {
                $this->page->terms()->create([
                    'term_en' => $term['term_en'],
                    'term_ar' => $term['term_ar'],
                ]);
            }

            Log::info("ResourcePage {$this->page->id} processed with " . count($validTerms) . " valid terms.");
        } else {
            Log::warning("Failed to parse JSON from GPT output for page {$this->page->id}. Output: " . substr($gptOutput, 0, 100));
            $this->page->update([
                'gpt_text' => $gptOutput,
                'status'   => 'error',
                'error_message' => 'Failed to parse JSON from GPT output',
            ]);
            return;
        }

        $this->page->update([
            'gpt_text' => $gptOutput,
            'status'   => 'done',
        ]);

        Log::info("ResourcePage {$this->page->id} processed successfully with GPT.");
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("ProcessPageForGPTJob failed for page {$this->page->id} after all retries", [
            'error' => $exception->getMessage(),
        ]);

        $this->page->update([
            'status'        => 'error',
            'error_message' => $exception->getMessage(),
        ]);
    }
}
