export enum ShippingMethod {
  Standard = "standard",
  Express = "express",
  Overnight = "overnight",
}

export const ShippingPrices: Record<ShippingMethod, number> = {
  [ShippingMethod.Standard]: 5,
  [ShippingMethod.Express]: 15,
  [ShippingMethod.Overnight]: 25,
}