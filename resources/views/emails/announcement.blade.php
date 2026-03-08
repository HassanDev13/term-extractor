<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Tajawal', 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f3f4f6;
            color: #1f2937;
            margin: 0;
            padding: 0;
            direction: rtl;
            text-align: right;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            background-color: #f3f4f6;
            padding: 40px 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .header {
            background-color: #2563eb;
            color: #ffffff;
            padding: 24px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
        }
        .content {
            padding: 32px 24px;
            line-height: 1.6;
            font-size: 16px;
        }
        .content h2, .content h3 {
            color: #111827;
            margin-top: 0;
        }
        .content p {
            margin-bottom: 16px;
        }
        .content a {
            color: #2563eb;
            text-decoration: underline;
        }
        .footer {
            background-color: #f9fafb;
            padding: 16px 24px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 0 0 8px 0;
        }
        .footer p:last-child {
            margin-bottom: 0;
        }
        .footer a {
            color: #2563eb;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .wrapper {
                padding: 20px 10px;
            }
            .content {
                padding: 20px 16px;
            }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>{{ \App\Models\Setting::get('site_name', 'تعريب') }}</h1>
            </div>
            <div class="content">
                {!! $bodyContent !!}
            </div>
            <div class="footer">
                <p>هذه الرسالة مرسلة من {{ \App\Models\Setting::get('site_name', 'تعريب') }}. © {{ date('Y') }} جميع الحقوق محفوظة.</p>
                <p>إذا كانت لديك أي استفسارات، يمكنك التواصل معنا عبر 
                    <a href="mailto:{{ \App\Models\Setting::get('sender_email', 'support@thearabic.org') }}">الدعم الفني</a>.
                </p>
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed #e5e7eb; font-size: 12px;">
                    <p>
                        وصلتك هذه الرسالة لأنك مسجل لدينا. 
                        يمكنك 
                        <a href="{{ config('app.url') }}/settings" style="color: #6b7280; text-decoration: underline;">تعديل تفضيلات البريد أو إلغاء الاشتراك</a>
                        في أي وقت.
                    </p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
