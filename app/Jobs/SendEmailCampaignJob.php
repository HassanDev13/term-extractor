<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendEmailCampaignJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public \App\Models\EmailCampaign $campaign
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $query = \App\Models\User::query();

        if ($this->campaign->target_audience === 'active_users') {
            $query->where('status', 'approved');
        } elseif ($this->campaign->target_audience === 'admins') {
            $query->where('is_admin', true);
        }

        // Only send to those who haven't opted out
        $query->where('subscribed_to_announcements', true);

        $count = 0;
        $query->chunk(100, function ($users) use (&$count) {
            foreach ($users as $user) {
                // The service limits to 150 at a time and 300 per day.
                // We divide users into batches of 150.
                // Batch 0 (Users 1-150) sends immediately.
                // Batch 1 (Users 151-300) sends 12 hours later.
                // Batch 2 (Users 301-450) sends 24 hours later, etc.
                $batchIndex = (int) floor($count / 150);
                $delayHours = $batchIndex * 12; 
                
                $delay = now()->addHours($delayHours);

                \Illuminate\Support\Facades\Mail::to($user)->later(
                    $delay,
                    new \App\Mail\AnnouncementMail($this->campaign->subject, $this->campaign->body)
                );

                $count++;
            }
        });
    }
}
