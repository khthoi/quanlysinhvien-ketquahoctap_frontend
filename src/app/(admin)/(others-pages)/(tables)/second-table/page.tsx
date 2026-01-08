import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DropdownTable from "./DropdownTableOne";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Dropdown Table | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Dropdown Table page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Dropdown Table" />
      <div className="space-y-6">
        <ComponentCard title="Dropdown Table">
            <DropdownTable />
        </ComponentCard>
      </div>
    </div>
  );
}
