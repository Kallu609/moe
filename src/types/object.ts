export interface IObject {
  id: number;
  b_i: number;
  b_t: string;
  i: number;
  j: number;
  map: number;
  params: {
    desc: string;
  };
  name: string;
  img: {
    sheet: string;
    x: number;
    y: number;
  };
  blocking: boolean;
  type: number;
  activities: string[];
  temp: any;
}

export interface IMapJsonItem {
  b_t: string;
  b_i: number;
  id?: number;
  params?: {
    to_map?: number;
    to_i: number;
    to_j: number;
    requires_one_from?: number[];
  };
}
