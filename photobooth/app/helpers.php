<?php
declare(strict_types=1);
function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}
function json_data($value): string
{
    return json_encode(
        $value,
        JSON_UNESCAPED_UNICODE |
            JSON_HEX_TAG |
            JSON_HEX_AMP |
            JSON_HEX_APOS |
            JSON_HEX_QUOT |
            JSON_THROW_ON_ERROR,
    );
}
function icon(string $name): string
{
    // Functional interface icons, shared across the views.
    $paths = [
        'camera' => '<path d="M8 5 6 8H3v12h18V8h-3l-2-3Z"/><circle cx="12" cy="14" r="4"/>',
        'frame' => '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 12h16M12 3v18"/>',
        'copies' =>
            '<rect x="8" y="7" width="13" height="14" rx="2"/><path d="M16 3H5a2 2 0 0 0-2 2v11"/>',
        'qr' =>
            '<path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h3v3h3v3h-6zM21 12v3M12 3v3M12 12h3M3 12h5M12 18v3"/>',
        'spark' =>
            '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4M18 4h4"/>',
        'print' => '<path d="M6 8V3h12v5M6 17H3V9h18v8h-3M6 14h12v7H6zM17 11h1"/>',
        'home' => '<path d="m3 10 9-7 9 7v11h-7v-7h-4v7H3Z"/>',
        'chart' => '<path d="M4 3v18h17M8 17v-5M13 17V7M18 17V4"/>',
        'box' => '<path d="m12 3 9 5v9l-9 5-9-5V8ZM3 8l9 5 9-5M12 13v9M7 5l9 5"/>',
        'users' =>
            '<circle cx="9" cy="7" r="4"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M17 4a4 4 0 0 1 0 8M19 15a6 6 0 0 1 3 6"/>',
        'shield' => '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-5"/>',
        'download' => '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
        'search' => '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
        'clock' => '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        'help' =>
            '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5M12 17h.01"/>',
        'menu' => '<path d="M4 6h16M4 12h16M4 18h16"/>',
    ];
    return '<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' .
        ($paths[$name] ?? $paths['camera']) .
        '</svg>';
}
