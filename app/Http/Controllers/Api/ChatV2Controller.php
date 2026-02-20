<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SearchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChatV2Controller extends Controller
{
    protected $searchService;

    public function __construct(SearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    public function index(): Response
    {
        if (auth()->check()) {
            auth()->user()->checkAndResetDailyCredits();
        }
        return Inertia::render('ChatV2/Index');
    }

    public function chat(Request $request)
    {
        $request->validate([
            'messages' => 'required|array',
            'messages.*.role' => 'required|string|in:user,assistant',
            'messages.*.content' => 'nullable|string',
            'detailed_mode' => 'nullable|boolean',
        ]);

        $userMessages = $request->input('messages');
        $detailedMode = $request->input('detailed_mode', false);
        
        // Handle keyword logic for the last user message
        $lastMessageIndex = count($userMessages) - 1;
        if ($lastMessageIndex >= 0 && $userMessages[$lastMessageIndex]['role'] === 'user') {
            $content = trim($userMessages[$lastMessageIndex]['content']);
            // If it's a single word (no spaces), treat it as a message to be searched
            if (!str_contains($content, ' ')) {
                 $userMessages[$lastMessageIndex]['content'] = "Find information about \"{$content}\"";
            }
        }

        // Credit System Logic
        $user = $request->user();
        if ($user) {
            $user->checkAndResetDailyCredits();

            // Check if user has credits
            if ($user->daily_credits <= 0) {
                 return response()->json([
                     'error' => 'لقد استنفدت رصيدك اليومي (20 محاولة). يرجى العودة غداً.'
                 ], 403);
            }

            // Deduct credit explicitly and save only if not unlimited
            if (!$user->is_unlimited) {
                $user->daily_credits -= 1;
                $user->save();
            }
        }

        return new StreamedResponse(function () use ($userMessages, $detailedMode) {
            // Disable output buffering
            if (ob_get_level()) ob_end_clean();

            try {
                $systemContent = 'You are a highly efficient Search Engine and Information Analyst. Your goal is to provide detailed, structured, and accurate search reports based on the term database.
                    
OPERATIONAL RULES:
1. RESPONSE FORMAT: Always provide a well-structured "Search Report". Use clear headings (Markdown # and ##), bullet points, and tables. 
2. LANGUAGE: Always respond in ARABIC.
3. DATA PRECISION: Always cite the Resource Name and Page Number for every finding.
4. TONALITY: Be professional and factual. Do not say "Welcome" or use conversational filler. Treat yourself as a Search Engine result page.
5. COUNTING RESOURCES: CRITICAL - When determining the total number of sources, do NOT double-count. If two or more translated terms come back from the SAME resource, count that resource only ONCE. Always use the top-level `resource_count` from the data.
6. TOOLS: 
   - Use `search_terms` to find relevant terms. Always assume the user wants the Smart Search capabilities.
   - Use `get_project_info` for metadata queries.
   - Use `list_resources` for structural queries.
';

                if ($detailedMode) {
                    $systemContent .= "
MODE: UNIFIED DETAILED REPORT
Follow this EXACT structure for your response:

# تقرير مصطلحي: [English Term]

**إحصائيات:** ورد هذا المصطلح [USE `total_count` FROM DATA] مرة في [USE `resource_count` FROM DATA] مصدراً. 
(CRITICAL MATH CHECK: Look at the top-level `resource_count` field in the JSON data, do not calculate this yourself!)
**التعريف:** [Brief definition of the English term in Arabic to set context]

## 1. ملخص الاستعمال الأكثر شيوعاً
[Provide a summary of the most used Arabic term and its acceptance level, and mentioning the total count]

## 2. التحليل التفصيلي حسب المصدر
[List each resource and the term it uses. CRITICAL: You MUST format every page number as a clickable link using this format: `[Page X](/resources/{resource_id}/pdf#page={page_number})`. For example: `[ص. 5](/resources/10/pdf#page=5)`]

## 3. الملاحظات والفروق الدلالية
[Explain any differences in meaning or usage contexts between the translations]

Note: Be professional and comprehensive. Ensure every cited page has a link.";
                } else {
                    $systemContent .= "
MODE: ULTRA-CONCISE SUMMARY
CRITICAL: Output ONLY these 3 lines in ARABIC. No English labels.
Format:
**المصطلح:** [Arabic Term] - ([Count in Arabic] مرات في [Sources in Arabic] مصادر)
[Brief definition in Arabic in 1 sentence]
**بدائل:** [List 2-3 alternative terms, comma separated]";
                }


                $systemMessage = [
                    'role' => 'system', 
                    'content' => $systemContent
                ];

                // Prepend system message to history
                $messages = array_merge([$systemMessage], $userMessages);

                $tools = [
                    [
                        'type' => 'function',
                        'function' => [
                            'name' => 'search_terms',
                            'description' => 'Search for terms in the database. Returns grouped terms with resource information.',
                            'parameters' => [
                                'type' => 'object',
                                'properties' => [
                                    'query' => [
                                        'type' => 'string',
                                        'description' => 'The search query for terms (English or Arabic)',
                                    ],
                                    // Removed exact_match and smart_mode from LLM visibility to enforce default behavior
                                ],
                                'required' => ['query'],
                            ],
                        ],
                    ],
                    [
                        'type' => 'function',
                        'function' => [
                            'name' => 'get_project_info',
                            'description' => 'Get information about the project, what it does, and what tools are available.',
                            'parameters' => [
                                'type' => 'object',
                                'properties' => (object)[],
                            ],
                        ],
                    ],
                    [
                        'type' => 'function',
                        'function' => [
                            'name' => 'list_resources',
                            'description' => 'List all available resources with their status and page counts.',
                            'parameters' => [
                                'type' => 'object',
                                'properties' => (object)[],
                            ],
                        ],
                    ],
                ];

                // First call - check if tools are needed (not streamed yet)
                $response = OpenAI::chat()->create([
                    'model' => env('OPENAI_MODEL', 'deepseek-chat'),
                    'messages' => $messages,
                    'tools' => $tools,
                ]);

                $choice = $response->choices[0];
                $finishReason = $choice->finishReason;

                // If the model wants to call a tool
                if ($finishReason === 'tool_calls' || $choice->message->toolCalls) {
                    // Send a "thinking" chunk to the client
                    echo json_encode(['chunk' => "Thinking...\n"]) . "\n";
                    flush();

                    $toolCalls = $choice->message->toolCalls;
                    
                    // Append the assistant's message with tool calls to history
                    $messages[] = $choice->message->toArray();

                    foreach ($toolCalls as $toolCall) {
                        $functionName = $toolCall->function->name;
                        $arguments = json_decode($toolCall->function->arguments, true);
                        
                        $result = null;

                        try {
                            if ($functionName === 'search_terms') {
                                // COMMAND: ALWAYS USE SMART MODE AND LOOSE MATCH
                                // User requested "keep the main search only the smart one"
                                $result = $this->searchService->searchTerms(
                                    $arguments['query'] ?? '', 
                                    false, // exactMatch = false (loose)
                                    true   // smartMode = true
                                );
                            } elseif ($functionName === 'list_resources') {
                                $result = $this->searchService->listResources();
                            } elseif ($functionName === 'get_project_info') {
                                $result = [
                                    'name' => 'Term Extractor AI',
                                    'description' => 'A system to extract, verify, and search for terminology from PDF resources.',
                                    'capabilities' => [
                                        'Search Terms' => 'Find terms in English or Arabic, with options for exact or partial matching.',
                                        'List Resources' => 'View all PDF resources the terms are extracted from.',
                                        'Detailed Context' => 'See exactly which page number a term appears on in a specific book.',
                                    ]
                                ];
                            } else {
                                $result = ['error' => "Unknown tool: $functionName"];
                            }
                        } catch (\Exception $e) {
                            $result = ['error' => $e->getMessage()];
                        }

                        // Append tool result to messages
                        $messages[] = [
                            'role' => 'tool',
                            'tool_call_id' => $toolCall->id,
                            'content' => json_encode($result),
                        ];
                    }

                    // Streaming the final response
                    $stream = OpenAI::chat()->createStreamed([
                        'model' => env('OPENAI_MODEL', 'deepseek-chat'),
                        'messages' => $messages,
                    ]);

                    foreach ($stream as $response) {
                        if (isset($response->choices[0]->delta->content)) {
                            $content = $response->choices[0]->delta->content;
                            
                            // Aggressively clean ANY tag that looks like internal model instructions
                            $content = preg_replace('/<[\|｜].*?[\|｜]>/su', '', $content);
                            $content = preg_replace('/<dsml>.*?<\/dsml>/si', '', $content);
                            $content = preg_replace('/<think>.*?<\/think>/si', '', $content);
                            
                            if ($content !== '') {
                                echo json_encode(['chunk' => $content]) . "\n";
                                flush();
                            }
                        }
                    }

                } else {
                    // No tool called, just stream the original content
                    $content = $choice->message->content;
                    // Aggressive clean
                    $content = preg_replace('/<[\|｜].*?[\|｜]>/su', '', $content);
                    $content = preg_replace('/<dsml>.*?<\/dsml>/si', '', $content);
                    $content = preg_replace('/<think>.*?<\/think>/si', '', $content);
                    
                    echo json_encode(['chunk' => $content]) . "\n";
                    flush();
                }
            } catch (\Exception $e) {
                Log::error('ChatV2 Stream Error: ' . $e->getMessage());
                echo json_encode(['chunk' => "Error: " . $e->getMessage()]) . "\n";
                flush();
            }

        }, 200, [
            'Content-Type' => 'application/x-ndjson',
            'X-Accel-Buffering' => 'no',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
        ]);
    }

    public function downloadPdf(Request $request) {
        $request->validate([
            'content' => 'required|string',
            'query' => 'nullable|string',
        ]);
        
        $content = $request->input('content');
        $query = $request->input('query', 'تقرير مصطلحي');
        
        // Convert Markdown to HTML
        $htmlContent = \Illuminate\Support\Str::markdown($content);
        
        // Basic CSS for nice PDF layout with RTL support
        $css = "
            <style>
                body {
                    font-family: 'Amiri', 'XB Riyaz', sans-serif;
                    direction: rtl;
                    text-align: right;
                    line-height: 1.6;
                    color: #333;
                }
                h1, h2, h3 {
                    color: #1e3a8a; /* Blue-900 */
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 10px;
                    margin-top: 20px;
                }
                h1 { font-size: 24pt; text-align: center; border: none; }
                h2 { font-size: 18pt; }
                ul { margin-right: 20px; }
                li { margin-bottom: 5px; }
                strong { color: #1d4ed8; } /* Blue-700 */
                .header {
                    text-align: center;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .footer {
                    position: fixed;
                    bottom: 0;
                    width: 100%;
                    text-align: center;
                    font-size: 10pt;
                    color: #888;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                th { background-color: #f1f5f9; }
            </style>
        ";
        
        $html = "
            <html>
            <head>$css</head>
            <body>
                <div class='header'>
                    <h1>مشروع التعريب - تقرير مصطلحي</h1>
                    <p>الموضوع: {$query}</p>
                    <p>التاريخ: " . date('Y-m-d H:i') . "</p>
                </div>
                
                <div class='content'>
                    {$htmlContent}
                </div>
                
                <div class='footer'>
                    GENERATED BY MASHROU AL-TAARIB AI | مشروع التعريب الآلي
                </div>
            </body>
            </html>
        ";
        
        // Initialize mPDF with Arabic configuration
        $mpdf = new \Mpdf\Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'default_font_size' => 12,
            'default_font' => 'xbriyaz', // Best for Arabic usually if available, or auto
            'autoScriptToLang' => true,
            'autoLangToFont' => true,
        ]);
        
        $mpdf->SetDirectionality('rtl');
        $mpdf->WriteHTML($html);
        
        return response($mpdf->Output('report.pdf', 'S'), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="term_report_' . time() . '.pdf"',
        ]);
    }
}
