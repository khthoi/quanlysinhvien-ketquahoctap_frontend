"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import Badge from "@/components/ui/badge/Badge";
import Image from "next/image";

interface SubProject {
  id:  number;
  name:  string;
  status: string;
  budget: string;
  deadline: string;
}

interface Order {
  id:  number;
  user:  {
    image: string;
    name: string;
    role: string;
  };
  projectName: string;
  team: {
    images: string[];
  };
  status:  string;
  budget: string;
  subProjects?:  SubProject[];
}

// Define the table data using the interface
const tableData:  Order[] = [
  {
    id: 1,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Lindsey Curtis",
      role:  "Web Designer",
    },
    projectName: "Agency Website",
    team:  {
      images:  [
        "/images/user/user-22.jpg",
        "/images/user/user-23.jpg",
        "/images/user/user-24.jpg",
      ],
    },
    budget: "3. 9K",
    status:  "Active",
    subProjects: [
      {
        id:  101,
        name:  "Landing Page Design",
        status:  "Active",
        budget: "1.2K",
        deadline: "2026-01-15",
      },
      {
        id: 102,
        name: "Dashboard UI",
        status:  "Pending",
        budget:  "1.5K",
        deadline: "2026-01-20",
      },
      {
        id: 103,
        name: "Mobile Responsive",
        status:  "Active",
        budget: "1.2K",
        deadline: "2026-01-25",
      },
    ],
  },
  {
    id:  2,
    user: {
      image: "/images/user/user-18.jpg",
      name: "Kaiya George",
      role:  "Project Manager",
    },
    projectName:  "Technology",
    team: {
      images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
    },
    budget: "24.9K",
    status: "Pending",
    subProjects: [
      {
        id: 201,
        name: "Backend API Development",
        status:  "Active",
        budget: "10K",
        deadline: "2026-02-01",
      },
      {
        id: 202,
        name: "Database Migration",
        status: "Pending",
        budget: "14. 9K",
        deadline: "2026-02-15",
      },
    ],
  },
  {
    id: 3,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Zain Geidt",
      role:  "Content Writing",
    },
    projectName: "Blog Writing",
    team:  {
      images:  ["/images/user/user-27.jpg"],
    },
    budget: "12.7K",
    status: "Active",
    subProjects:  [
      {
        id: 301,
        name:  "SEO Articles",
        status:  "Active",
        budget: "5K",
        deadline: "2026-01-18",
      },
      {
        id: 302,
        name: "Product Reviews",
        status:  "Active",
        budget:  "4.2K",
        deadline: "2026-01-22",
      },
      {
        id:  303,
        name: "Case Studies",
        status: "Cancel",
        budget:  "3.5K",
        deadline: "2026-01-30",
      },
    ],
  },
  {
    id:  4,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Abram Schleifer",
      role: "Digital Marketer",
    },
    projectName:  "Social Media",
    team: {
      images: [
        "/images/user/user-28.jpg",
        "/images/user/user-29.jpg",
        "/images/user/user-30.jpg",
      ],
    },
    budget: "2.8K",
    status: "Cancel",
    subProjects: [
      {
        id:  401,
        name: "Facebook Ads Campaign",
        status:  "Cancel",
        budget:  "1.5K",
        deadline: "2026-01-10",
      },
      {
        id: 402,
        name: "Instagram Marketing",
        status:  "Cancel",
        budget:  "1.3K",
        deadline:  "2026-01-12",
      },
    ],
  },
  {
    id:  5,
    user: {
      image: "/images/user/user-21.jpg",
      name: "Carla George",
      role:  "Front-end Developer",
    },
    projectName: "Website",
    team: {
      images: [
        "/images/user/user-31.jpg",
        "/images/user/user-32.jpg",
        "/images/user/user-33.jpg",
      ],
    },
    budget: "4.5K",
    status: "Active",
    subProjects:  [
      {
        id: 501,
        name:  "Component Library",
        status: "Active",
        budget: "2K",
        deadline: "2026-02-05",
      },
      {
        id: 502,
        name: "Animation Effects",
        status:  "Pending",
        budget: "1.5K",
        deadline: "2026-02-10",
      },
      {
        id:  503,
        name: "Performance Optimization",
        status: "Active",
        budget: "1K",
        deadline:  "2026-02-15",
      },
    ],
  },
];

// Chevron Icon Component
const ChevronIcon = ({ isOpen }: { isOpen:  boolean }) => (
  <svg
    className={`w-5 h-5 transition-transform duration-200 ${
      isOpen ? "rotate-180" :  ""
    }`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

export default function DropdownTable() {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const toggleRow = (id:  number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const isRowExpanded = (id: number) => expandedRows.includes(id);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="w-10 px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  <></>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Project Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Team
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Budget
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tableData.map((order) => (
                <React.Fragment key={order.id}>
                  {/* Main Row */}
                  <TableRow
                    className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${
                      isRowExpanded(order.id)
                        ? "bg-gray-50 dark:bg-white/[0.02]"
                        :  ""
                    }`}
                  >
                    <TableCell className="px-3 py-4 text-start">
                      <button
                        onClick={() => toggleRow(order.id)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
                      >
                        <ChevronIcon isOpen={isRowExpanded(order.id)} />
                      </button>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full">
                          <Image
                            width={40}
                            height={40}
                            src={order. user.image}
                            alt={order.user.name}
                          />
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {order.user.name}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {order. user.role}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        {order.projectName}
                        {order.subProjects && order.subProjects. length > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-white/[0.05] dark:text-gray-400">
                            {order.subProjects.length}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex -space-x-2">
                        {order.team.images.map((teamImage, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 overflow-hidden border-2 border-white rounded-full dark:border-gray-900"
                          >
                            <Image
                              width={24}
                              height={24}
                              src={teamImage}
                              alt={`Team member ${index + 1}`}
                              className="w-full"
                            />
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark: text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          order.status === "Active"
                            ?  "success"
                            :  order.status === "Pending"
                            ? "warning"
                            : "error"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {order.budget}
                    </TableCell>
                  </TableRow>

                  {/* Expanded Sub-Rows */}
                  {isRowExpanded(order.id) &&
                    order.subProjects &&
                    order. subProjects.map((subProject, index) => (
                      <TableRow
                        key={subProject.id}
                        className="bg-gray-50/50 dark:bg-white/[0.01]"
                      >
                        <TableCell className="px-3 py-3 text-start">
                          {/* Connector line */}
                          <div className="flex items-center justify-center">
                            <div
                              className={`w-px h-full bg-gray-200 dark:bg-white/[0.1] ${
                                index === order.subProjects! .length - 1
                                  ?  "h-1/2 self-start"
                                  : ""
                              }`}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-3 sm:px-6 text-start">
                          <div className="flex items-center gap-3 pl-4">
                            <div className="flex items-center">
                              <div className="w-4 h-px bg-gray-200 dark:bg-white/[0.1]" />
                              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 ml-1" />
                            </div>
                            <span className="text-gray-600 text-theme-sm dark:text-gray-300">
                              Sub-task
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 text-start text-theme-sm dark:text-gray-300">
                          <div className="pl-2 border-l-2 border-gray-200 dark:border-white/[0.1]">
                            {subProject.name}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          <span className="inline-flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {subProject. deadline}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <Badge
                            size="sm"
                            color={
                              subProject.status === "Active"
                                ? "success"
                                : subProject.status === "Pending"
                                ? "warning"
                                : "error"
                            }
                          >
                            {subProject.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                          {subProject.budget}
                        </TableCell>
                      </TableRow>
                    ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Table Footer with Summary */}
      <div className="px-5 py-4 border-t border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {tableData. length} projects with{" "}
            {tableData.reduce(
              (acc, item) => acc + (item.subProjects?.length || 0),
              0
            )}{" "}
            sub-tasks
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpandedRows(tableData.map((item) => item.id))}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-white/[0.03] dark:border-white/[0.1] dark:text-gray-300 dark:hover: bg-white/[0.05] transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={() => setExpandedRows([])}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark: bg-white/[0.03] dark:border-white/[0.1] dark:text-gray-300 dark: hover:bg-white/[0.05] transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}