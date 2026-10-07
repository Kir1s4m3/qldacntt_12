<!doctype html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#8d2036">
    <title><?= e($title) ?> · <?= e($config['name']) ?></title>
    <link rel="icon" href="assets/images/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="assets/css/base.css">
    <link rel="stylesheet" href="assets/css/<?= e($stylesheet) ?>.css">
    <link rel="stylesheet" href="assets/css/interactions.css">
</head>
<body class="<?= e($bodyClass ?? '') ?>">
