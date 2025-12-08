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
        $text = $this->page->text ?? "";
        if (empty(trim($text))) {
            Log::warning(
                "ResourcePage {$this->page->id} has empty text. Skipping GPT processing.",
            );
            return;
        }

        $prompt =
            "You are analyzing OCR text from a technical terminology table. The OCR is poor quality and the table structure is corrupted.\n\n";

        // NEW: OCR CORRECTION METHODOLOGY
        $prompt .= "OCR TEXT RECONSTRUCTION METHODOLOGY:\n";
        $prompt .= "1. ARABIC OCR TEXT RECONSTRUCTION:\n";
        $prompt .=
            "   - Look for separated letters and recombine them (e.g., 'ا ل ب ا ي ت' → 'البايت')\n";
        $prompt .= "   - Reattach separated diacritics to their letters\n";
        $prompt .=
            "   - Identify English transliteration patterns (e.g., 'تيب' → 'بايت')\n";
        $prompt .=
            "   - Recognize common root patterns (e.g., ع-ل-م for knowledge terms)\n\n";

        $prompt .= "2. ARABIC CORRECTION PATTERNS TO WATCH FOR:\n";
        $prompt .= "   ✓ Separated definite article: 'ا ل' → 'الـ'\n";
        $prompt .= "   ✓ Broken technical terms: 'ر ا م' → 'رام' (RAM)\n";
        $prompt .= "   ✓ Separated shadda/sukoon: 'ال َّ' → 'الّـ'\n";
        $prompt .=
            "   ✓ English transliteration: 'س ي ب ي و' → 'سي بي يو' (CPU)\n";
        $prompt .= "   ✓ Missing dots: 'بيانت' → 'بيانات' (data)\n\n";

        $prompt .= "STEP 1: Reconstruct Arabic text from OCR artifacts\n";
        $prompt .= "   - INPUT: Raw OCR text with potential separations\n";
        $prompt .=
            "   - OUTPUT: Reconstructed Arabic text (fix spacing, recombine letters)\n\n";

        $prompt .= "STEP 2: Extract all English terms\n";
        $prompt .=
            "   - Include both clean and OCR-corrupted English (e.g., 'addresable' → 'addressable')\n\n";

        $prompt .= "STEP 3: Extract all Arabic terms\n";
        $prompt .= "   - Use reconstructed text from Step 1\n";
        $prompt .=
            "   - Include both modern and traditional technical translations\n\n";

        $prompt .= "STEP 4: Match terms based on SEMANTIC equivalence\n";
        $prompt .= "   - Consider the reconstructed/corrected forms\n";
        $prompt .=
            "   - Account for Arabic text that may appear as English transliteration\n\n";

        $prompt .= "VERIFICATION EXAMPLES WITH OCR CORRECTION:\n";
        $prompt .=
            "✓ CORRECT RECONSTRUCTION: 'copy' (English) matches 'ن س خ ة' (OCR Arabic) → 'نسخة' (Reconstructed)\n";
        $prompt .=
            "✓ CORRECT RECONSTRUCTION: 'device' (English) matches 'ج ه ا ز' (OCR Arabic) → 'جهاز' (Reconstructed)\n";
        $prompt .=
            "✓ CORRECT: 'byte addressable' (English) matches 'قاب ٌل لل َْع ْن َونة' (OCR) → 'قابل للعنونة' (Reconstructed)\n";
        $prompt .=
            "✗ OCR DECEPTION: 'order' (English) with 'تيب ابيِت' (OCR) → This is actually 'byte order' transliteration, not 'order' translation\n";
        $prompt .=
            "✗ AMBIGUOUS: 'release' (English) with 'إ ط لا ق' (OCR) → Could be 'إطلاق' (launch) or corrupted text, verify with context\n\n";

        $prompt .= "CRITICAL RULES FOR OCR PROCESSING:\n";
        $prompt .=
            "1. RECONSTRUCT Arabic text before matching (don't match against raw OCR)\n";
        $prompt .=
            "2. Identify English transliteration in Arabic text (e.g., 'سيرفر' = 'server')\n";
        $prompt .=
            "3. For technical terms, prefer modern standard translations over literal ones\n";
        $prompt .=
            "4. Watch for these common OCR errors in technical Arabic:\n";
        $prompt .= "   - Missing diacritics (especially on technical terms)\n";
        $prompt .= "   - Separated definite article (الـ becomes ا ل)\n";
        $prompt .= "   - Lam-alif separation (لا becomes ل ا)\n";
        $prompt .=
            "   - English letters mistaken for Arabic (C vs س, P vs ب)\n";
        $prompt .=
            "5. When in doubt about reconstruction, prefer COMMON technical terms\n";
        $prompt .=
            "6. Consider CONTEXT from surrounding terms for ambiguous reconstructions\n";
        $prompt .=
            "7. DO NOT match English with Arabic transliteration of that same English word\n";
        $prompt .=
            "   - WRONG: 'processor' matched with 'بروسيسور' (transliteration)\n";
        $prompt .=
            "   - RIGHT: 'processor' matched with 'معالج' (translation)\n\n";

        $prompt .= "RECONSTRUCTION PRIORITY ORDER:\n";
        $prompt .= "1. Recombine obviously separated Arabic letters\n";
        $prompt .= "2. Fix definite article separations\n";
        $prompt .=
            "3. Identify and correct English transliteration within Arabic text\n";
        $prompt .= "4. Match RECONSTRUCTED Arabic with English terms\n\n";

        $jsonInstruction = "OUTPUT FORMAT:\n";
        $jsonInstruction .= "{\n";
        $jsonInstruction .=
            "  \"ocr_reconstruction_notes\": \"Brief notes on what OCR corrections were applied\",\n";
        $jsonInstruction .= "  \"verified_pairs\": [\n";
        $jsonInstruction .= "    {\n";
        $jsonInstruction .= "      \"term_en\": \"clean_english_term\",\n";
        $jsonInstruction .= "      \"term_ar_raw\": \"original_ocr_arabic\",\n";
        $jsonInstruction .=
            "      \"term_ar_reconstructed\": \"corrected_arabic_text\",\n";
        $jsonInstruction .= "      \"confidence_level\": 9,\n";
        $jsonInstruction .=
            "      \"reconstruction_notes\": \"how the Arabic text was reconstructed\"\n";
        $jsonInstruction .= "    }\n";
        $jsonInstruction .= "  ],\n";
        $jsonInstruction .= "  \"unmatched_terms\": {\n";
        $jsonInstruction .=
            "    \"english\": [\"list\", \"of\", \"unmatched\", \"english\", \"terms\"],\n";
        $jsonInstruction .=
            "    \"arabic\": [\"list\", \"of\", \"unmatched\", \"arabic\", \"terms\"]\n";
        $jsonInstruction .= "  }\n";
        $jsonInstruction .= "}\n\n";

        $jsonInstruction .= "CONFIDENCE LEVEL SCALE (1-10):\n";
        $jsonInstruction .=
            "- 9-10: Very high confidence - exact match with clear reconstruction (e.g., 'data' → 'بيانات')\n";
        $jsonInstruction .=
            "- 7-8: High confidence - strong semantic match with minor OCR corrections\n";
        $jsonInstruction .=
            "- 5-6: Medium confidence - reasonable match but with significant OCR reconstruction needed\n";
        $jsonInstruction .=
            "- 3-4: Low-medium confidence - uncertain reconstruction or ambiguous context\n";
        $jsonInstruction .=
            "- 1-2: Low confidence - very uncertain match or heavily corrupted OCR\n\n";

        $jsonInstruction .=
            "IMPORTANT: Include ONLY semantically verified pairs. If reconstruction is uncertain, confidence_level should be 1-2 or pair should be excluded.\n";
        $jsonInstruction .= "Output ONLY the JSON object, nothing else.\n\n";

        $fullPrompt =
            $prompt . $jsonInstruction . "RAW OCR TEXT TO ANALYZE:\n" . $text;

        // Debug: Log the text being analyzed
        Log::info(
            "ProcessPageForGPTJob - Page {$this->page->id} - Text length: " .
                strlen($text),
        );
        Log::debug(
            "ProcessPageForGPTJob - Page {$this->page->id} - First 500 chars of text: " .
                substr($text, 0, 500),
        );

        $response = OpenAI::chat()->create([
            "model" => env("OPENAI_MODEL", "gpt-4o"),
            "messages" => [
                [
                    "role" => "system",
                    "content" =>
                        "You are a bilingual technical term matching expert with specialized OCR text reconstruction skills. You excel at reconstructing corrupted Arabic OCR text by: 1) Recombining separated letters, 2) Fixing definite article separations, 3) Identifying English transliteration patterns in Arabic text, 4) Recognizing common Arabic root patterns in technical terms. You match terms based on semantic equivalence of RECONSTRUCTED text, not raw OCR output. You provide confidence levels and reconstruction notes for each match.",
                ],
                ["role" => "user", "content" => $fullPrompt],
            ],
            "temperature" => 0.2, // Lower temperature for more consistent reconstruction
            "max_tokens" => 4000, // Increased for detailed reconstruction notes
        ]);

        $gptOutput = $response->choices[0]->message->content ?? "";

        // Debug: Log GPT output
        Log::debug(
            "ProcessPageForGPTJob - Page {$this->page->id} - GPT Output: " .
                $gptOutput,
        );

        // Attempt to parse JSON
        $terms = json_decode($gptOutput, true);

        // If direct decode fails, try to find JSON block
        if (json_last_error() !== JSON_ERROR_NONE) {
            if (preg_match("/\[.*\]/s", $gptOutput, $matches)) {
                $terms = json_decode($matches[0], true);
            }
        }

        if (json_last_error() === JSON_ERROR_NONE && is_array($terms)) {
            // Handle both old and new JSON formats
            $verifiedPairs = [];
            if (isset($terms["verified_pairs"])) {
                // New format with verified_pairs
                $verifiedPairs = $terms["verified_pairs"];
            } else {
                // Old format - direct array
                $verifiedPairs = $terms;
            }

            // Filter terms to only include those with both English and Arabic
            $validTerms = [];
            foreach ($verifiedPairs as $term) {
                // Handle both term_ar and term_ar_reconstructed
                $termAr =
                    $term["term_ar_reconstructed"] ??
                    ($term["term_ar"] ?? null);
                $confidenceLevel = $term["confidence_level"] ?? null;

                if (
                    isset($term["term_en"]) &&
                    !empty(trim($term["term_en"])) &&
                    $termAr &&
                    !empty(trim($termAr))
                ) {
                    $validTerms[] = [
                        "term_en" => $term["term_en"],
                        "term_ar" => $termAr,
                        "confidence_level" => $confidenceLevel,
                    ];
                }
            }

            // Skip the page if no valid terms found
            if (empty($validTerms)) {
                Log::warning(
                    "ResourcePage {$this->page->id} has no terms with both English and Arabic. Skipping page.",
                );
                $this->page->update([
                    "gpt_text" => $gptOutput,
                    "status" => "done",
                    "error_message" =>
                        "No terms with both English and Arabic translations found",
                ]);
                return;
            }

            // Save only valid terms
            foreach ($validTerms as $term) {
                $this->page->terms()->create([
                    "term_en" => $term["term_en"],
                    "term_ar" => $term["term_ar"],
                    "confidence_level" => $term["confidence_level"],
                ]);
            }

            Log::info(
                "ResourcePage {$this->page->id} processed with " .
                    count($validTerms) .
                    " valid terms.",
            );
        } else {
            Log::warning(
                "Failed to parse JSON from GPT output for page {$this->page->id}. Output: " .
                    substr($gptOutput, 0, 100),
            );
            $this->page->update([
                "gpt_text" => $gptOutput,
                "status" => "error",
                "error_message" => "Failed to parse JSON from GPT output",
            ]);
            return;
        }

        $this->page->update([
            "gpt_text" => $gptOutput,
            "status" => "done",
        ]);

        Log::info(
            "ResourcePage {$this->page->id} processed successfully with GPT.",
        );
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error(
            "ProcessPageForGPTJob failed for page {$this->page->id} after all retries",
            [
                "error" => $exception->getMessage(),
            ],
        );

        $this->page->update([
            "status" => "error",
            "error_message" => $exception->getMessage(),
        ]);
    }
}
