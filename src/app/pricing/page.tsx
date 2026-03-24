import { type Metadata } from "next";
import { PricingCards } from "@/components/pricing/pricing-cards";

export const metadata: Metadata = {
  title: "Pricing - WSI | World Startup Intelligence",
  description:
    "Start free with WSI. Upgrade to unlock unlimited AI validations, pitch deck generation, investor matching, and more.",
};

export default function PricingPage() {
  return <PricingCards />;
}
