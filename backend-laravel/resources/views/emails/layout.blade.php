<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{ $title ?? 'Roboclaim' }}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;-webkit-font-smoothing:antialiased;">
@if(!empty($preheader))
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">{{ $preheader }}</div>
@endif
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8fafc;padding:32px 16px;">
    <tr>
        <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;margin:0 auto;">
                <tr>
                    <td style="padding:0 0 20px 0;text-align:left;">
                        <span style="font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:600;letter-spacing:-0.02em;color:#0f172a;">
                            Roboclaim<span style="font-weight:400;color:#64748b;">Ai</span>
                        </span>
                    </td>
                </tr>
                <tr>
                    <td style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 1px 2px rgba(15,23,42,0.04);overflow:hidden;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                                <td style="height:4px;background-color:#0f172a;font-size:0;line-height:0;">&nbsp;</td>
                            </tr>
                            <tr>
                                <td style="padding:28px 28px 8px 28px;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
                                    @yield('content')
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px 8px 0 8px;text-align:center;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:12px;line-height:1.5;color:#64748b;">
                        <p style="margin:0 0 8px 0;">This message was sent by Roboclaim regarding your account.</p>
                        <p style="margin:0;">If you did not expect this email, you can ignore it or contact support.</p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
