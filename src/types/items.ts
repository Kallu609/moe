export type IItemBase = IItemBaseItem[];
export interface IItemBaseItem {
  id: number;
  b_i: number;
  b_t: string;
  i: number;
  j: number;
  params: {
    wearable: boolean;
    slot: number;
    min_forging: number;
    price: number;
  };
  name: string;
  img: {
    sheet: string;
    x: number;
    y: number;
  };
  type: number;
  activities: any[];
  temp: any;
  fn: any;
  blocking: boolean;
}
