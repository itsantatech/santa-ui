export type ShippingCarrier = "EMS" | "FLASH" | "KEX" | "OTHER";

export function getShippingTrackingUrl(
  carrier: ShippingCarrier | null | undefined,
  trackingNumber: string | null | undefined,
) {
  if (!carrier || !trackingNumber) return null;
  const tracking = encodeURIComponent(trackingNumber);
  if (carrier === "EMS") return `https://track.thailandpost.co.th/?trackNumber=${tracking}`;
  if (carrier === "FLASH") return `https://www.flashexpress.co.th/fle/tracking?se=${tracking}`;
  if (carrier === "KEX") return `https://th.kex-express.com/th/track-parcel?trackingNumber=${tracking}`;
  return null;
}
