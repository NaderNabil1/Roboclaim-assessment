@extends('emails.layout')

@section('content')
<h1 style="margin:0 0 12px 0;font-size:20px;font-weight:600;letter-spacing:-0.02em;color:#0f172a;line-height:1.3;">
    New claim report uploaded
</h1>
<p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#475569;">
    A user uploaded a new claim report document for review.
</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px 0;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
    <tr>
        <td style="padding:16px 18px;font-size:14px;color:#0f172a;">
            <span style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;margin-bottom:6px;">Report ID</span>
            #{{ $reportId }}
        </td>
    </tr>
    <tr>
        <td style="padding:0 18px 12px 18px;font-size:14px;color:#475569;">
            <span style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;margin-bottom:6px;">Policy</span>
            <span style="font-family:ui-monospace,monospace;color:#0f172a;">{{ $policyNumber }}</span>
        </td>
    </tr>
    <tr>
        <td style="padding:0 18px 12px 18px;font-size:14px;color:#475569;">
            <span style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;margin-bottom:6px;">Document</span>
            {{ $documentName }}
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
            <span style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;margin-bottom:6px;">Submitted by</span>
            {{ $submitterName }}
        </td>
    </tr>
    <tr>
        <td style="padding:0 18px 16px 18px;font-size:14px;color:#475569;">
            <span style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;margin-bottom:6px;">Email</span>
            <a href="mailto:{{ $submitterEmail }}" style="color:#0f172a;text-decoration:underline;">{{ $submitterEmail }}</a>
        </td>
    </tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
    <tr>
        <td style="border-radius:8px;background-color:#0f172a;">
            <a href="{{ $adminReportsUrl }}" style="display:inline-block;padding:12px 22px;font-family:ui-sans-serif,system-ui,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                Review reports
            </a>
        </td>
    </tr>
</table>
<p style="margin:20px 0 0 0;font-size:13px;line-height:1.5;color:#94a3b8;">
    Roboclaim Admin — open the admin console to verify this report.
</p>
@endsection
