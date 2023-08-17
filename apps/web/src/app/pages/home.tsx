import { z } from 'zod';
import { useSubscribe } from 'replicache-react';
import { rep } from '../../replicache';

// TODO: Where should this live? What is the relationship to database schema (if any?)
const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export function HomePage() {
  const locations = useSubscribe(
    rep,
    async (tx) => {
      const raw = await tx
        .scan({
          prefix: 'locations/',
        })
        .toArray();
      return raw.map((r) => locationSchema.parse(r));
    },
    null
  );

  return (
    <div className="container mx-auto flex h-full justify-center overflow-hidden p-4">
      <div className="flex w-96 flex-col items-stretch justify-center">
        {locations?.map((l) => (
          <div key={l.id}>{l.name}</div>
        ))}
      </div>
    </div>
  );
}
