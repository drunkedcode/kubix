<?php

namespace App\Services\Domains\Issue;

use App\Models\Issue;
use App\Models\Territory;
use App\Models\User;
use App\Services\Domains\Activity\ActivityService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/** Reclamos que la gente reporta desde la app y que el equipo del barrio resuelve. */
class IssueService
{
    private const CATEGORIES = [
        'mural'     => 'Mural',
        'directory' => 'Diretório',
        'jobs'      => 'Vagas',
        'app'       => 'Aplicativo',
    ];

    /** Nuevo estado => estados desde los que se puede llegar. Un reclamo resuelto no se reabre. */
    private const TRANSITIONS = [
        'in_progress' => ['new'],
        'resolved'    => ['new', 'in_progress'],
    ];

    public function __construct(
        protected IssueRepository $repo,
        protected ActivityService $activity,
    ) {}

    /** Reclamos del barrio, el más nuevo primero, listos para pintar. */
    public function forTerritory(int $territoryId): array
    {
        return $this->repo->forTerritory($territoryId)
            ->map(fn (Issue $issue) => [
                'id'       => $issue->id,
                'title'    => $issue->title,
                'reporter' => $issue->reporter?->name ?? 'Anônimo',
                'category' => self::CATEGORIES[$issue->category] ?? $issue->category,
                'status'   => $issue->status,
                'age_days' => (int) abs($issue->created_at->diffInDays(now())),
            ])
            ->values()
            ->all();
    }

    /** Cuántos reclamos del barrio resolvió esa persona. */
    public function countResolvedBy(int $territoryId, int $userId): int
    {
        return $this->repo->countResolvedBy($territoryId, $userId);
    }

    /** Pasa el reclamo a "en curso" o "resuelto" y lo deja registrado en el historial del barrio. */
    public function changeStatus(User $actor, Territory $territory, int $issueId, string $status): void
    {
        $issue = $this->repo->findInTerritory($issueId, $territory->id);

        abort_if(! $issue, 404);

        if (! in_array($issue->status, self::TRANSITIONS[$status] ?? [], true)) {
            throw ValidationException::withMessages([
                'status' => 'Esta reclamação não pode passar para esse status.',
            ]);
        }

        DB::transaction(function () use ($actor, $territory, $issue, $status) {
            $this->repo->update($issue, [
                'status'      => $status,
                'resolved_at' => $status === 'resolved' ? now() : null,
                'resolved_by' => $status === 'resolved' ? $actor->id : null,
            ]);

            $this->activity->record($territory->id, $actor->id, $issue, "issue.{$status}", ['name' => $issue->title]);
        });
    }
}
