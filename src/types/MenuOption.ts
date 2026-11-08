export interface MenuOption {
  key: string;
  label: (citiesCount: number, unitSymbol: string) => string;
  run: () => Promise<void>;
}
