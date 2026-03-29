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

class UserClaimReportUploadedMail extends Mailable
{
    use BuildsMailActionLinks;
    use Queueable, SerializesModels;

    public function __construct(
        public ClaimReport $claimReport,
        public User $user,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Report uploaded successfully | Roboclaim',
        );
    }

    public function content(): Content
    {
        $this->claimReport->loadMissing('policy');

        return new Content(
            view: 'emails.user-claim-report-uploaded',
            with: [
                'title' => 'Report uploaded | Roboclaim',
                'preheader' => 'Your claim report was uploaded successfully.',
                'firstName' => $this->user->first_name,
                'policyNumber' => $this->claimReport->policy->policy_number,
                'documentName' => $this->claimReport->document_name,
                'statusLabel' => EmailStatusLabels::claimReport($this->claimReport->status),
                'claimsUrl' => $this->mailActionUrl('claims'),
            ],
        );
    }
}
