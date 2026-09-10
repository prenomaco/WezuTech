/**
 * The home page carousel's "Contact For Purchase" button and the contact
 * form's message field are siblings under one shared `<Contact />` instance,
 * not parent/child — a prop can't reach across that, so the click is
 * broadcast as a DOM event instead and the form listens for it.
 */
export const PRODUCT_INTEREST_EVENT = "wezu:product-interest";

export interface ProductInterestDetail {
  readonly name: string;
}
