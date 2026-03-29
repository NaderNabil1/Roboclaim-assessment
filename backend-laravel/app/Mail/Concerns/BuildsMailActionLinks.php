<?php

namespace App\Mail\Concerns;

/**
 * Builds absolute URLs for optional action buttons in transactional mail.
 * Base URL is configured in config("app.mail_action_base_url") (MAIL_ACTION_BASE_URL in .env).
 */
trait BuildsMailActionLinks
{
    protected function mailActionUrl(string $path = ''): string
    {
        $base = config('app.mail_action_base_url');

        if ($path === '') {
            return $base;
        }

        return $base.'/'.ltrim($path, '/');
    }
}
