<?php

namespace App\Mail;

use App\Mail\Concerns\BuildsMailActionLinks;
use App\Models\ClaimReport;
use App\Support\EmailStatusLabels;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminNewClaimReportMail extends Mailable
{
    use BuildsMailActionLinks;
    use Queueable, SerializesModels;

    public function __construct(public ClaimReport $claimReport)
    {
        $this->claimReport->loadMissing(['user', 'policy']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New claim report uploaded | Roboclaim Admin',
        );
    }

    public function content(): Content
    {
        $user = $this->claimReport->user;
        $policy = $this->claimReport->policy;

        return new Content(
            view: 'emails.admin-new-claim-report',
            with: [
                'title' => 'New report | Roboclaim Admin',
                'preheader' => 'A new claim report was uploaded for policy '.$policy->policy_number.'.',
                'reportId' => (string) $this->claimReport->id,
                'policyNumber' => $policy->policy_number,
                'documentName' => $this->claimReport->document_name,
                'statusLabel' => EmailStatusLabels::claimReport($this->claimReport->status),
                'submitterName' => trim(($user->first_name ?? '').' '.($user->last_name ?? '')) ?: '—',
                'submitterEmail' => $user->email,
                'adminReportsUrl' => $this->mailActionUrl('admin/reports'),
            ],
        );
    }
}
