"use client";

// Phone header categories — see components/nav/category-nav.tsx.
import CategoryNav from "@/components/nav/category-nav";

export default function MobileNavTabLayout({ compact = false }) {
  return <CategoryNav variant="mobile" compact={compact} />;
}
