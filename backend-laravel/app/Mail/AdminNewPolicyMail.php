<?php

namespace App\Mail;

use App\Mail\Concerns\BuildsMailActionLinks;
use App\Models\Policy;
use App\Support\EmailStatusLabels;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminNewPolicyMail extends Mailable
{
    use BuildsMailActionLinks;
    use Queueable, SerializesModels;

    public function __construct(public Policy $policy)
    {
        $this->policy->loadMissing('user');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New policy pending verification | Roboclaim Admin',
        );
    }

    public function content(): Content
    {
        $owner = $this->policy->user;

        return new Content(
            view: 'emails.admin-new-policy',
            with: [
                'title' => 'New policy | Roboclaim Admin',
                'preheader' => 'A user submitted policy '.$this->policy->policy_number.' for verification.',
                'policyNumber' => $this->policy->policy_number,
                'statusLabel' => EmailStatusLabels::policy($this->policy->status),
                'ownerName' => trim(($owner->first_name ?? '').' '.($owner->last_name ?? '')) ?: '—',
                'ownerEmail' => $owner->email,
                'adminPoliciesUrl' => $this->mailActionUrl('admin/policies'),
            ],
        );
    }
}
