<?php

namespace App\Mail;

use App\Mail\Concerns\BuildsMailActionLinks;
use App\Models\Policy;
use App\Models\User;
use App\Support\EmailStatusLabels;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserPolicyStatusChangedMail extends Mailable
{
    use BuildsMailActionLinks;
    use Queueable, SerializesModels;

    public function __construct(
        public Policy $policy,
        public User $user,
        public string $previousStatus,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your policy status was updated | Roboclaim',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.user-policy-status-changed',
            with: [
                'title' => 'Policy status updated | Roboclaim',
                'preheader' => 'Your policy '.$this->policy->policy_number.' status is now '.EmailStatusLabels::policy($this->policy->status).'.',
                'firstName' => $this->user->first_name,
                'policyNumber' => $this->policy->policy_number,
                'previousLabel' => EmailStatusLabels::policy($this->previousStatus),
                'currentLabel' => EmailStatusLabels::policy($this->policy->status),
                'policiesUrl' => $this->mailActionUrl('claims/policies'),
            ],
        );
    }
}
