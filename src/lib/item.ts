export function itemIdFromName(itemName: string) {
  const item = item_base.find(
    x => x.name.toLowerCase() === itemName.toLowerCase()
  );
  return item ? item.b_i : undefined;
}

export function itemIdsFromNames(itemNames: string[]) {
  return itemNames
    .map(itemName => itemIdFromName(itemName))
    .filter(x => x) as number[];
}

export function getFoodHealAmount(foodName: string) {
  const foodId = itemIdFromName(foodName);
  return foodId ? item_base[foodId].params.heal : -1;
}
