import { RoundTableHead } from './RoundTableHead.tsx';
import { RoundTableRow } from './RoundTableRow.tsx';
import type { SeasonEntry, SeriesListing } from '../../../../shared/types';
import type { SeasonResults } from '@/lib/season-results';

interface RoundTableProps {
  /**
   * The championship and its availability.
   */
  listing: SeriesListing;
  /**
   * The career's season in it, when it has entered the championship.
   */
  entered: SeasonEntry | null;
  /**
   * The season so far, whose raced rounds name their winners - simulated ones
   * included, for a championship the career is not in.
   */
  season: SeasonResults | null;
  /**
   * What the player is called.
   */
  playerName: string;
  /**
   * The round the page points at next, by its id.
   */
  next?: string;
  /**
   * Called to open a round's own page. Left out on a page that races nothing.
   * @param round The round's id
   */
  onOpen?: (round: string) => void;
}

// The season as a results sheet: one row per round, its event and how long
// its races run, and in a career the date and where the player finished.
export const RoundTable = ({
  listing, entered, season, playerName, next, onOpen,
}: RoundTableProps) => {
  const career = entered !== null;

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <table className="w-full border-collapse text-sm">
        <RoundTableHead career={career} />
        <tbody>
          {listing.series.rounds.map((round, index) => (
            <RoundTableRow
              key={round.id}
              listing={listing}
              round={round}
              number={index + 1}
              career={career}
              event={entered?.events.find((one) => one.round === round.id)}
              column={season?.rounds.find((one) => one.round.id === round.id)}
              entry={entered?.entry ?? listing.series.entries[0]?.id ?? ''}
              playerSeat={entered?.playerSeat}
              playerName={playerName}
              next={round.id === next}
              onOpen={onOpen ? () => onOpen(round.id) : undefined}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
