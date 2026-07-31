const LISTING_CREATED_EVENT = "listing:created";

export type ListingCreatedDetail = {
  type: "property" | "marketplace";
};

export function emitListingCreated(detail: ListingCreatedDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(LISTING_CREATED_EVENT, { detail })
  );
}

export function onListingCreated(callback: (detail: ListingCreatedDetail) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => callback((e as CustomEvent<ListingCreatedDetail>).detail);
  window.addEventListener(LISTING_CREATED_EVENT, handler);
  return () => window.removeEventListener(LISTING_CREATED_EVENT, handler);
}
