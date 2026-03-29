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

class UserPolicySubmittedMail extends Mailable
{
    use BuildsMailActionLinks;
    use Queueable, SerializesModels;

    public function __construct(
        public Policy $policy,
        public User $user,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Policy received — pending review | Roboclaim',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.user-policy-submitted',
            with: [
                'title' => 'Policy received | Roboclaim',
                'preheader' => 'Your policy '.$this->policy->policy_number.' was received and is pending review.',
                'firstName' => $this->user->first_name,
                'policyNumber' => $this->policy->policy_number,
                'statusLabel' => EmailStatusLabels::policy($this->policy->status),
                'policiesUrl' => $this->mailActionUrl('claims/policies'),
            ],
        );
    }
}
