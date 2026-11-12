<?php

namespace App\Services\Domains\Utils;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use InvalidArgumentException;
use RuntimeException;

/**
 * MediaUploader
 * Qué es:      CRUD genérico de archivos (imágenes y documentos). Local o S3 según el disco.
 * Qué NO hace: no conoce proyectos, agencias ni tablas. La carpeta la decide quien lo llama.
 * Estructura:  {carpeta}/images/{archivo}  y  {carpeta}/documents/{archivo}  y  {carpeta}/videos/{archivo}
 * Disco:       config('filesystems.media_disk', 'public'); ->on('s3') devuelve una copia.
 * Retorno:     path, name, original_name, size, mime, extension, kind, disk (para guardar donde quieras).
 */
class MediaUploader
{
    public const RULES = [
        'images' => [
            'ext'    => ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            'mime'   => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
            'max_mb' => 5,
        ],
        'documents' => [
            'ext'    => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt'],
            'mime'   => [
                'application/pdf', 'application/msword', 'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/zip', // docx/xlsx a veces se detectan así
                'text/csv', 'text/plain',
            ],
            'max_mb' => 10,
        ],
        'videos' => [
            'ext'    => ['mp4', 'webm', 'mov'],
            'mime'   => ['video/mp4', 'video/webm', 'video/quicktime'],
            'max_mb' => 100,
        ],
    ];

    protected string $disk;

    public function __construct(?string $disk = null)
    {
        $this->disk = $disk ?? config('filesystems.media_disk', 'public');
    }

    /** Copia del servicio apuntando a otro disco (no muta la instancia original). */
    public function on(string $disk): static
    {
        $copy = clone $this;
        $copy->disk = $disk;

        return $copy;
    }

    // ---------------------------------------------------------------- CREATE

    public function image(UploadedFile $file, string $folder, ?string $name = null): array
    {
        return $this->store($file, 'images', $folder, $name);
    }

    public function document(UploadedFile $file, string $folder, ?string $name = null): array
    {
        return $this->store($file, 'documents', $folder, $name);
    }

    public function video(UploadedFile $file, string $folder, ?string $name = null): array
    {
        return $this->store($file, 'videos', $folder, $name);
    }

    // ---------------------------------------------------------------- UPDATE

    /** Guarda el nuevo archivo y, solo si salió bien, borra el anterior (si está dentro de $folder). */
    public function replace(?string $oldPath, UploadedFile $file, string $kind, string $folder, ?string $name = null): array
    {
        $new = $this->store($file, $kind, $folder, $name);

        if ($oldPath && $oldPath !== $new['path']) {
            $this->delete($oldPath, $folder);
        }

        return $new;
    }

    // ------------------------------------------------------------------ READ

    public function exists(string $path): bool
    {
        return Storage::disk($this->disk)->exists($path);
    }

    /** URL pública; con $minutes devuelve una URL temporal firmada (archivos privados). */
    public function url(?string $path, ?int $minutes = null): ?string
    {
        if (! $path) {
            return null;
        }

        $disk = Storage::disk($this->disk);

        return $minutes ? $disk->temporaryUrl($path, now()->addMinutes($minutes)) : $disk->url($path);
    }

    /** Rutas de los archivos de una carpeta ('images', 'documents' o null para todo). */
    public function list(string $folder, ?string $kind = null): array
    {
        $dir = $this->clean($folder) . ($kind ? '/' . $this->kind($kind) : '');

        return Storage::disk($this->disk)->allFiles($dir);
    }

    // ---------------------------------------------------------------- DELETE

    /** Borra un archivo SOLO si está dentro de $folder (evita borrar archivos ajenos). */
    public function delete(string $path, string $folder): bool
    {
        if (! $this->inside($path, $folder)) {
            return false;
        }

        return Storage::disk($this->disk)->delete($path);
    }

    /** Borra una carpeta completa con todo su contenido (ej. al eliminar una agencia). */
    public function deleteFolder(string $folder): bool
    {
        return Storage::disk($this->disk)->deleteDirectory($this->clean($folder));
    }

    // -------------------------------------------------------------- INTERNOS

    protected function store(UploadedFile $file, string $kind, string $folder, ?string $name): array
    {
        $kind = $this->kind($kind);
        $rule = self::RULES[$kind];

        if (! $file->isValid()) {
            throw new RuntimeException('O arquivo não foi enviado corretamente.');
        }

        $ext = strtolower($file->getClientOriginalExtension());
        $mime = (string) $file->getMimeType();

        if (! in_array($ext, $rule['ext'], true) || ! in_array($mime, $rule['mime'], true)) {
            throw new InvalidArgumentException('Tipo de archivo no permitido para ' . $kind . '.');
        }
        if ($file->getSize() > $rule['max_mb'] * 1024 * 1024) {
            throw new InvalidArgumentException("O arquivo excede o máximo de {$rule['max_mb']} MB.");
        }

        $dir = $this->clean($folder) . '/' . $kind;
        $base = $name ? Str::slug(pathinfo($name, PATHINFO_FILENAME)) : '';
        $filename = ($base !== '' ? $base : Str::random(24)) . '.' . $ext;

        $path = Storage::disk($this->disk)->putFileAs($dir, $file, $filename);
        if (! $path) {
            throw new RuntimeException('No se pudo guardar el archivo.');
        }

        return [
            'path'          => $path,
            'name'          => $filename,
            'original_name' => $file->getClientOriginalName(),
            'size'          => $file->getSize(),
            'mime'          => $mime,
            'extension'     => $ext,
            'kind'          => $kind,
            'disk'          => $this->disk,
        ];
    }

    protected function kind(string $kind): string
    {
        if (! isset(self::RULES[$kind])) {
            throw new InvalidArgumentException("Tipo desconocido: {$kind}");
        }

        return $kind;
    }

    /** Sanea la carpeta: slug por segmento, sin vacíos, '.' ni '..'. */
    protected function clean(string $folder): string
    {
        $parts = collect(explode('/', str_replace('\\', '/', $folder)))
            ->map(fn ($p) => Str::slug($p))
            ->filter(fn ($p) => $p !== '')
            ->values();

        if ($parts->isEmpty()) {
            throw new InvalidArgumentException('A pasta não pode estar vazia.');
        }

        return $parts->implode('/');
    }

    protected function inside(string $path, string $folder): bool
    {
        return ! str_contains($path, '..') && str_starts_with($path, $this->clean($folder) . '/');
    }
}
