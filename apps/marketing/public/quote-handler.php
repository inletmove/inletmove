<?php
/**
 * Inlet Move Co. — quote handler shim (v1)
 *
 * This PHP file lives on Hostinger shared hosting and accepts JSON POSTs from
 * the Astro marketing site's QuoteForm. It emails Feroz a quote-request
 * notification via Resend, sends the lead a confirmation email, and returns
 * a JSON envelope the form expects.
 *
 * Why a PHP shim and not a "real" backend in v1:
 *   - Hostinger shared hosting runs PHP, not Node. The Astro site is built
 *     to static HTML; there is no server runtime for the Astro side.
 *   - The proper backend (Next.js + Supabase + Twilio + Resend at
 *     quote.inletmove.com on Vercel) ships in v1.1. When that lands, the
 *     marketing form swaps PUBLIC_QUOTE_ENDPOINT to point at
 *     https://quote.inletmove.com/api/quote — zero code change in the form.
 *   - Until then, this PHP file at least gets us emails so leads aren't lost.
 *
 * Environment variables (set in Hostinger's hPanel under Advanced > PHP
 * Configuration, or via .htaccess SetEnv, or by hardcoding the constants
 * below before SFTPing this file). Never commit real values.
 *
 *   RESEND_API_KEY        re_xxxxxxxxxxxxxxx
 *   FEROZ_NOTIFY_EMAIL    feroz@example.com  (where lead notifications go)
 *   FROM_EMAIL_LEADS      leads@inletmove.com (must be a Resend-verified domain
 *                                              or use Resend's onboarding domain)
 *   FROM_EMAIL_CUSTOMER   hello@inletmove.com
 *
 * Returns JSON:
 *   { "success": true,  "quoteId": "q_xxxxx" }
 *   { "success": false, "error":   "..." }   (with appropriate HTTP status)
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

// ---------- 1. Method gate -------------------------------------------------

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// ---------- 2. Parse JSON body --------------------------------------------

$rawBody = file_get_contents('php://input');
if ($rawBody === false || $rawBody === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Empty body']);
    exit;
}

$data = json_decode($rawBody, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}

// ---------- 3. Minimal server-side validation -----------------------------
// (the form already runs HTML5 validation client-side; this is the safety net)

$requiredFields = ['size', 'from_address', 'to_address', 'preferred_date',
                   'contact_name', 'contact_phone'];

foreach ($requiredFields as $field) {
    if (empty($data[$field]) || !is_string($data[$field])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error'   => "Missing or invalid field: $field",
        ]);
        exit;
    }
}

// Cap each value so a malicious POST cannot blow up the email body.
foreach ($data as $key => $val) {
    if (is_string($val) && strlen($val) > 4000) {
        $data[$key] = substr($val, 0, 4000) . ' …[truncated]';
    }
}

// ---------- 4. Read env / config ------------------------------------------

$apiKey       = getenv('RESEND_API_KEY')      ?: '';
$notifyEmail  = getenv('FEROZ_NOTIFY_EMAIL')  ?: '';
$fromLeads    = getenv('FROM_EMAIL_LEADS')    ?: 'onboarding@resend.dev';
$fromCustomer = getenv('FROM_EMAIL_CUSTOMER') ?: 'onboarding@resend.dev';

if ($apiKey === '' || $notifyEmail === '') {
    // Soft-success path: log to a local file so the lead is not lost if
    // Resend isn't configured yet. The user will see "We've got it." and
    // we will recover the lead from the log.
    $logDir  = __DIR__ . '/../private-logs';
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0700, true);
    }
    $logFile = $logDir . '/quotes-' . date('Y-m') . '.log';
    @file_put_contents(
        $logFile,
        date('c') . ' ' . json_encode($data) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );

    $quoteId = 'q_' . bin2hex(random_bytes(5));
    echo json_encode([
        'success' => true,
        'quoteId' => $quoteId,
        'note'    => 'Logged locally; email delivery not configured yet.',
    ]);
    exit;
}

// ---------- 5. Build email bodies -----------------------------------------

$quoteId = 'q_' . bin2hex(random_bytes(5));

$leadBodyLines = [
    "New Inlet Move quote request",
    "Reference: $quoteId",
    "",
];
foreach ($data as $key => $val) {
    $printable = is_string($val) ? $val : json_encode($val);
    $leadBodyLines[] = "$key: $printable";
}
$leadBody = implode("\n", $leadBodyLines);

$leadSubject = sprintf(
    'Inlet quote: %s — %s, %s',
    htmlspecialchars($data['contact_name'] ?? '?', ENT_QUOTES, 'UTF-8'),
    htmlspecialchars($data['size']         ?? '?', ENT_QUOTES, 'UTF-8'),
    htmlspecialchars($data['preferred_date'] ?? '?', ENT_QUOTES, 'UTF-8')
);

// ---------- 6. POST helper -------------------------------------------------

$postJson = function (string $url, string $payload, string $apiKey) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 8,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json',
        ],
    ]);
    $res  = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);
    return [$code, $res, $err];
};

// ---------- 7. Send notification to Feroz ---------------------------------

$leadPayload = json_encode([
    'from'    => "Inlet Move <$fromLeads>",
    'to'      => [$notifyEmail],
    'reply_to'=> $data['contact_email'] ?: null,
    'subject' => $leadSubject,
    'text'    => $leadBody,
]);

[$code, $res, $err] = $postJson('https://api.resend.com/emails', $leadPayload, $apiKey);

if ($code < 200 || $code >= 300) {
    // Log to local file so the lead is recoverable
    $logDir  = __DIR__ . '/../private-logs';
    if (!is_dir($logDir)) { @mkdir($logDir, 0700, true); }
    @file_put_contents(
        $logDir . '/quotes-failed-' . date('Y-m') . '.log',
        date('c') . " resend_status=$code resend_err=$err " . json_encode($data) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );

    http_response_code(502);
    echo json_encode([
        'success' => false,
        'error'   => 'Email delivery failed. Please call us at (604) 000-0000.',
    ]);
    exit;
}

// ---------- 8. Send confirmation to lead (best-effort) --------------------

if (!empty($data['contact_email']) && filter_var($data['contact_email'], FILTER_VALIDATE_EMAIL)) {
    $confirmBody = "Hi " . ($data['contact_name'] ?? 'there') . ",\n\n"
        . "Thanks for reaching out to Inlet Move. We received your quote request "
        . "and a real human will text or call you within the hour.\n\n"
        . "Reference: $quoteId\n\n"
        . "If you don't hear from us by then, please call (604) 000-0000.\n\n"
        . "— Inlet Move Co.\n"
        . "  https://inletmove.com\n";

    $confirmPayload = json_encode([
        'from'    => "Inlet Move <$fromCustomer>",
        'to'      => [$data['contact_email']],
        'subject' => 'We got your quote request — Inlet Move Co.',
        'text'    => $confirmBody,
    ]);
    $postJson('https://api.resend.com/emails', $confirmPayload, $apiKey);
    // We intentionally ignore failures here — the notify email already landed.
}

// ---------- 9. Done --------------------------------------------------------

echo json_encode([
    'success' => true,
    'quoteId' => $quoteId,
]);
