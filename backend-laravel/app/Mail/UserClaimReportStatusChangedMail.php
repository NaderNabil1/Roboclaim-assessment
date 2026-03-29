<?php

namespace App\Mail;

use App\Mail\Concerns\BuildsMailActionLinks;
use App\Models\ClaimReport;
use App\Models\User;
use App\Support\EmailStatusLabels;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserClaimReportStatusChangedMail extends Mailable
{
    use BuildsMailActionLinks;
    use Queueable, SerializesModels;

    public function __construct(
        public ClaimReport $claimReport,
        public User $user,
        public string $previousStatus,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your report status was updated | Roboclaim',
        );
    }

    public function content(): Content
    {
        $this->claimReport->loadMissing('policy');

        return new Content(
            view: 'emails.user-claim-report-status-changed',
            with: [
                'title' => 'Report status updated | Roboclaim',
                'preheader' => 'Your report status is now '.EmailStatusLabels::claimReport($this->claimReport->status).'.',
                'firstName' => $this->user->first_name,
                'policyNumber' => $this->claimReport->policy->policy_number,
                'documentName' => $this->claimReport->document_name,
                'previousLabel' => EmailStatusLabels::claimReport($this->previousStatus),
                'currentLabel' => EmailStatusLabels::claimReport($this->claimReport->status),
                'claimsUrl' => $this->mailActionUrl('claims'),
            ],
        );
    }
}
