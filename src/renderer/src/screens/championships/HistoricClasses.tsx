import { ClassRow } from './ClassRow.tsx';
import { disciplinesOf } from './utils.ts';
import type { Championship, SeriesAvailability } from '../../../../shared/types';
import { usePlayerName } from '@/hooks';

interface HistoricClassesProps {
  /**
   * The historic event.
   */
  event: Championship;
  /**
   * What the install can race of it, which says the cars each class fields.
   */
  availability: SeriesAvailability;
  /**
   * The seat the player was given, when a career races it - which outlines the
   * class it is in and names the player in it.
   */
  playerSeat?: string;
}

// A historic event's grid, a class at a time, as a championship's page lists one.
export const HistoricClasses = ({ event, availability, playerSeat }: HistoricClassesProps) => {
  const playerName = usePlayerName();
  const mixed = disciplinesOf(event).length > 1;

  return (
    <div className="flex flex-col gap-3">
      {event.entries.map((entry) => (
        <ClassRow
          key={entry.id}
          entry={entry}
          availability={availability.entries.find((one) => one.entry === entry.id)}
          teams={event.teams ?? []}
          showDiscipline={mixed}
          playerSeat={entry.seats.some((seat) => seat.id === playerSeat) ? playerSeat : undefined}
          playerName={playerName}
        />
      ))}
    </div>
  );
};
