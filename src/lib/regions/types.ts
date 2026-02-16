export interface RegionEraName {
  name: string;
  startYBP: number;
  endYBP: number;
}

export interface Region {
  id: string;
  displayOrder: number;
  names: RegionEraName[];
  color: string;
}
