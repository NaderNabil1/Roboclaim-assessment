@extends('emails.layout')

@section('content')
<h1 style="margin:0 0 12px 0;font-size:20px;font-weight:600;letter-spacing:-0.02em;color:#0f172a;line-height:1.3;">
    New policy pending verification
</h1>
<p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#475569;">
    A user submitted a new policy that requires admin review.
</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px 0;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
    <tr>
        <td style="padding:16px 18px;font-family:ui-monospace,ui-sans-serif,monospace;font-size:14px;color:#0f172a;">
            <span style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;margin-bottom:6px;">Policy number</span>
            {{ $policyNumber }}
        </td>
    </tr>
    <tr>
        <td style="padding:0 18px 12px 18px;font-size:14px;color:#475569;">
            <span style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;margin-bottom:6px;">Status</span>
            {{ $statusLabel }}
        </td>
    </tr>
    <tr>
        <td style="padding:0 18px 8px 18px;font-size:14px;color:#475569;">
            <span style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;margin-bottom:6px;">Owner</span>
            {{ $ownerName }}
        </td>
    </tr>
    <tr>
        <td style="padding:0 18px 16px 18px;font-size:14px;color:#475569;">
            <span style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;margin-bottom:6px;">Email</span>
            <a href="mailto:{{ $ownerEmail }}" style="color:#0f172a;text-decoration:underline;">{{ $ownerEmail }}</a>
        </td>
    </tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
    <tr>
        <td style="border-radius:8px;background-color:#0f172a;">
            <a href="{{ $adminPoliciesUrl }}" style="display:inline-block;padding:12px 22px;font-family:ui-sans-serif,system-ui,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                Review policies
            </a>
        </td>
    </tr>
</table>
<p style="margin:20px 0 0 0;font-size:13px;line-height:1.5;color:#94a3b8;">
    Roboclaim Admin — please verify this policy when you are ready.
</p>
@endsection
