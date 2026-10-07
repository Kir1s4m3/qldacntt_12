<?php
return [
    'name' => 'Photo Rain',
    'tagline' => 'Giữ lại một chút vui.',
    'branch' => 'Cơ sở 01 · Cầu Giấy',
    'booth' => 'Máy chụp 01',
    // Demo prices and camera styles: replace with the real catalogue later.
    'cameras' => [
        [
            'id' => 'classic',
            'name' => 'Classic',
            'code' => '01',
            'description' => 'Tự nhiên, rõ nét',
            'filter' => 'none',
        ],
        [
            'id' => 'mono',
            'name' => 'Monochrome',
            'code' => '02',
            'description' => 'Đen trắng, đầy cảm xúc',
            'filter' => 'grayscale(1)',
        ],
        [
            'id' => 'film',
            'name' => 'Warm film',
            'code' => '03',
            'description' => 'Ấm áp như một thước phim',
            'filter' => 'sepia(.35) saturate(.8)',
        ],
    ],
    'frames' => [
        [
            'id' => 'strip',
            'name' => 'Dải ảnh',
            'description' => '4 khoảnh khắc · 5 × 15 cm',
            'price' => 70000,
        ],
        [
            'id' => 'grid',
            'name' => 'Khung lớn',
            'description' => '4 khoảnh khắc · 10 × 15 cm',
            'price' => 100000,
        ],
    ],
    'extra_copy_price' => 20000,
];
