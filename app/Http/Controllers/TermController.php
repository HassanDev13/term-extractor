<?php

namespace App\Http\Controllers;

use App\Models\Term;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class TermController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        
        if (empty($search)) {
            // No search query - return empty grouped results
            return Inertia::render('Terms/Index', [
                'groupedTerms' => [],
                'filters' => [
                    'search' => $search,
                ],
            ]);
        }

        // Get all terms matching the search (case-insensitive)
        $matchingTerms = Term::query()
            ->with(['resourcePage.resource'])
            ->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(term_en) LIKE ?', ['%' . strtolower($search) . '%'])
                  ->orWhereRaw('LOWER(term_ar) LIKE ?', ['%' . strtolower($search) . '%']);
            })
            ->get();



        // Group terms by normalized (lowercase) values
        $groupedData = [];
        
        foreach ($matchingTerms as $term) {
            $normalizedEn = strtolower($term->term_en ?? '');
            $normalizedAr = strtolower($term->term_ar ?? '');
            
            // Create a unique key for grouping (only by normalized English term)
            // This ensures all Arabic variations of "data" are in one group
            $groupKey = $normalizedEn;
            
            if (!isset($groupedData[$groupKey])) {
                $groupedData[$groupKey] = [
                    'normalized_term_en' => $normalizedEn,
                    'normalized_term_ar' => $normalizedAr, // First Arabic term found
                    'display_term_en' => $term->term_en,
                    'display_term_ar' => $term->term_ar,
                    'variations' => [],
                    'total_count' => 0,
                    'resource_count' => 0,
                    'resources' => [],
                    'term_ids' => [],
                ];
            }
            
            // Add variation if not already present
            $variationKey = $term->term_en . '|' . $term->term_ar;
            if (!isset($groupedData[$groupKey]['variations'][$variationKey])) {
                $groupedData[$groupKey]['variations'][$variationKey] = [
                    'term_en' => $term->term_en,
                    'term_ar' => $term->term_ar,
                    'count' => 0,
                ];
            }
            $groupedData[$groupKey]['variations'][$variationKey]['count']++;
            
            // Track total count
            $groupedData[$groupKey]['total_count']++;
            $groupedData[$groupKey]['term_ids'][] = $term->id;
            
            // Group by resource
            if ($term->resourcePage && $term->resourcePage->resource) {
                $resourceId = $term->resourcePage->resource->id;
                $resourceName = $term->resourcePage->resource->name;
                
                if (!isset($groupedData[$groupKey]['resources'][$resourceId])) {
                    $groupedData[$groupKey]['resources'][$resourceId] = [
                        'resource_id' => $resourceId,
                        'resource_name' => $resourceName,
                        'count' => 0,
                        'term_ids' => [],
                        'arabic_term_details' => [], // Track Arabic terms with their term IDs
                    ];
                }
                
                $groupedData[$groupKey]['resources'][$resourceId]['count']++;
                $groupedData[$groupKey]['resources'][$resourceId]['term_ids'][] = $term->id;
                
                // Track Arabic term with its specific term ID and page numbers
                if ($term->term_ar) {
                    $arTermKey = $term->term_ar;
                    if (!isset($groupedData[$groupKey]['resources'][$resourceId]['arabic_term_details'][$arTermKey])) {
                        $groupedData[$groupKey]['resources'][$resourceId]['arabic_term_details'][$arTermKey] = [
                            'arabic_term' => $term->term_ar,
                            'count' => 0,
                            'term_ids' => [],
                            'pages' => [],
                            'confidence_sum' => 0,
                        ];
                    }
                    $groupedData[$groupKey]['resources'][$resourceId]['arabic_term_details'][$arTermKey]['count']++;
                    $groupedData[$groupKey]['resources'][$resourceId]['arabic_term_details'][$arTermKey]['term_ids'][] = $term->id;
                    
                    // Track page numbers
                    $pageNumber = $term->resourcePage->page_number ?? 0;
                    if (!in_array($pageNumber, $groupedData[$groupKey]['resources'][$resourceId]['arabic_term_details'][$arTermKey]['pages'])) {
                        $groupedData[$groupKey]['resources'][$resourceId]['arabic_term_details'][$arTermKey]['pages'][] = $pageNumber;
                    }
                    
                    // Sum confidence for averaging
                    $groupedData[$groupKey]['resources'][$resourceId]['arabic_term_details'][$arTermKey]['confidence_sum'] += $term->confidence_level ?? 0;
                }
            }
        }
        
        // Convert to array and calculate resource counts
        $result = [];
        foreach ($groupedData as $group) {
            $group['variations'] = array_values($group['variations']);
            
            // Convert arabic_term_details to array and calculate statistics for each resource
            foreach ($group['resources'] as $resourceId => &$resource) {
                $arabicTermDetails = [];
                $totalCountInResource = $resource['count'];
                
                foreach ($resource['arabic_term_details'] as $arDetail) {
                    // Calculate average confidence
                    $avgConfidence = $arDetail['count'] > 0 
                        ? round($arDetail['confidence_sum'] / $arDetail['count'], 1) 
                        : 0;
                    
                    // Calculate frequency percentage (within this resource)
                    $frequency = $totalCountInResource > 0 
                        ? round(($arDetail['count'] / $totalCountInResource) * 100) 
                        : 0;
                    
                    // Quality stars (1-5 based on confidence 0-10)
                    $stars = ceil($avgConfidence / 2);
                    
                    // Consistency rating based on count
                    $consistency = $arDetail['count'] >= 5 ? 'عالي' : ($arDetail['count'] >= 3 ? 'متوسط' : 'منخفض');
                    
                    // Sort pages
                    sort($arDetail['pages']);
                    
                    $arabicTermDetails[] = [
                        'arabic_term' => $arDetail['arabic_term'],
                        'count' => $arDetail['count'],
                        'term_ids' => $arDetail['term_ids'],
                        'pages' => $arDetail['pages'],
                        'confidence' => $avgConfidence,
                        'frequency' => $frequency,
                        'stars' => $stars,
                        'consistency' => $consistency,
                    ];
                }
                
                // Sort by count descending and mark most common
                usort($arabicTermDetails, function($a, $b) {
                    return $b['count'] - $a['count'];
                });
                
                // Mark most common if there are multiple terms and first has higher count
                if (count($arabicTermDetails) > 1 && $arabicTermDetails[0]['count'] > $arabicTermDetails[1]['count']) {
                    $arabicTermDetails[0]['is_most_common'] = true;
                } else {
                    foreach ($arabicTermDetails as &$detail) {
                        $detail['is_most_common'] = false;
                    }
                }
                
                $resource['arabic_term_details'] = $arabicTermDetails;
            }
            unset($resource); // Break the reference
            
            // Now convert resources to indexed array
            $group['resources'] = array_values($group['resources']);
            $group['resource_count'] = count($group['resources']);
            
            // Sort resources by count descending
            usort($group['resources'], function($a, $b) {
                return $b['count'] - $a['count'];
            });
            
            $result[] = $group;
        }
        
        // Sort by total count descending
        usort($result, function($a, $b) {
            return $b['total_count'] - $a['total_count'];
        });

        return Inertia::render('Terms/Index', [
            'groupedTerms' => $result,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }
}
