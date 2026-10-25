// Entry point for our own components. Vendored shadcn source under ui/ is
// imported directly from @/components/ui/<name>.tsx, the way the CLI writes it.

export { AppHeader } from './AppHeader.tsx';
export { AppNav } from './app-nav/index.ts';
export { BackLink } from './BackLink.tsx';
export { BackToTop } from './BackToTop.tsx';
export {
  ActiveFilters, BrowserGrid, BrowserLayout, CARD_COVER, CARD_LINK, FigureLine, FilterRail, PosterCaption,
  PosterSkeleton, RacedIn, RailList, RailOption, RailRange, RailSearch, RailSection, RailSkeleton, RailSwitch,
  RangeSkeleton, SearchField, SKELETON_COUNT, SortHeader, SortMenu, SourceTree, SWITCH_TRACK, ToggleCard,
  TOOLBAR_SEARCH, ViewToggle, provenanceNames, provenancePills, rangeName, toggledIn,
} from './browser/index.ts';
export type {
  ActiveFilter, BrowserToggle, ProvenancePicks, RailItem, RangeValue, SortItem,
} from './browser/index.ts';
export {
  CarSourceBadge, GarageFoot, PriceFoot, PurchaseButton, PurchaseDialog, RepaintDialog, SellDialog, TradeButton,
} from './car-trade/index.ts';
export { AppraiseFoot, PriceOriginBadge } from './car-pricing/index.ts';
export type { CarAppraise } from './car-pricing/index.ts';
export type { CarTrade } from './car-trade/index.ts';
export { LanguagePicker, ThemePicker } from './choice-tiles/index.ts';
export {
  carPictureSources, CarSwatch, carSwatchSources, ContentImage, trackPictureSources,
} from './content-image/index.ts';
export { CarPicker, CarSetPicker, TrackPicker } from './content-picker/index.ts';
export type { ContentImageProps } from './content-image/index.ts';
export { ContentCard, ContentStats } from './content-card/index.ts';
export { ConfirmDialog } from './ConfirmDialog.tsx';
export { ContentIssues } from './content-issues/index.ts';
export { DetailPanel } from './DetailPanel.tsx';
export { ErrorCard } from './ErrorCard.tsx';
export {
  BonusPoints, ClassificationTable, ClassificationTableSkeleton, CompactStandingsSkeleton, DriverName,
  MatrixLegend, Movement, Podium, PodiumSkeleton, ResultCell, ResultStrip, StandingsMatrix, StandingsTable,
  TeamStandingsTable,
} from './results/index.ts';
export type { StandingsView, StripFigure } from './results/index.ts';
export { HistoricChip } from './HistoricChip.tsx';
export { LibrarySwitch, withId } from './library-switch/index.ts';
export { LiveryPlate } from './LiveryPlate.tsx';
export {
  BalanceLink, LedgerBadge, MoneyAmount, ProgressionSlider,
} from './money/index.ts';
export { Loading } from './Loading.tsx';
export { NameDialog } from './NameDialog.tsx';
export { NationFlag } from './NationFlag.tsx';
export { PATH_KINDS, PathList, PathsCard } from './paths-card/index.ts';
export { ProblemList } from './ProblemList.tsx';
export { RatingBadge, RatingChange, RatingLink } from './rating/index.ts';
export type { PathKind } from './paths-card/index.ts';
export {
  DistributorBadge, distributorNameKey, makerNameKey, packNameKey, ProvenanceBadges,
} from './provenance-badges/index.ts';
export { ScreenBody } from './ScreenBody.tsx';
export { ScreenHeader } from './ScreenHeader.tsx';
export { ScreenStrip } from './ScreenStrip.tsx';
export { Segments } from './Segments.tsx';
export { EditionState, Sparkline } from './season-review/index.ts';
export { SettingsSection } from './SettingsSection.tsx';
export { Shimmer } from './Shimmer.tsx';
export {
  AdvanceDialog, finishesSeason, SKIP_ACCENT, SkipDialog, skipGroups, SkipNote, SkipRoundDialog,
} from './skip-dialog/index.ts';
export type { SkipGroup } from './skip-dialog/index.ts';
export { SourceChips } from './SourceChips.tsx';
export { SpecBadge } from './spec-badge/index.ts';
export { SpecField, SpecPicker } from './spec-picker/index.ts';
export { SwitchTile } from './SwitchTile.tsx';
export { ToggleButton } from './ToggleButton.tsx';
export {
  ClimateBadge,
  ForecastStrip,
  SessionForecastChip,
  WEATHER_ICON,
  WEATHER_TYPE_LABEL,
  WeatherStepIcons,
  WeatherStepsLabel,
  EventForecast,
} from './weather-forecast/index.ts';
export { WEATHER_KINDS, WeatherPicker, weatherKindOf } from './weather-picker/index.ts';
export type { WeatherKind } from './weather-picker/index.ts';
