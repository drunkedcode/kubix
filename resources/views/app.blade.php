<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>{{ config('app.name', 'Kubix') }}</title>

    <!-- LOGO EN LA PESTAÑA (Favicon) -->
    <link rel="icon" type="image/png" href="{{ Vite::asset('resources/js/Assets/logo.png') }}">

    <script>try{document.documentElement.classList.toggle('dark',localStorage.getItem('kubix-theme')!=='light')}catch(e){document.documentElement.classList.add('dark')}</script>
    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body class="antialiased">
    @inertia
</body>
</html>