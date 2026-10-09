import type { Metadata } from "next";
import { OrderTrackingPage } from "@/features/storefront/presentation/order-tracking-page";

export const metadata: Metadata = {
  title: "Acompanhar pedido | Jade's Açaí",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <OrderTrackingPage orderId={orderId} />;
}