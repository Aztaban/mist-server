export enum ShippingMethod {
  Standard = "standard",
  Express = "express",
  Overnight = "overnight",
}

export const ShippingPrices: Record<ShippingMethod, number> = {
  [ShippingMethod.Standard]: 500,
  [ShippingMethod.Express]: 1500,
  [ShippingMethod.Overnight]: 2500,
}