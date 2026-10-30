import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-foreground text-ink">
      <p className="font-mono text-lg text-primary">Kurio — Início (fundação F1)</p>
    </main>
  );
}
