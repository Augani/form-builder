"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FilePlus,
  MoreHorizontal,
  Search,
  Eye,
  Edit,
  Copy,
  Trash,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/axios";

interface Form {
  id: string;
  name: string;
  description: string;
  status: string;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function FormsListPage() {
  const t = useTranslations("dashboard.forms");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [forms, setForms] = useState<Form[]>([]);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await apiClient.get("/api/forms");
        const result = response.data;
        console.log(result);
        setForms(result.forms);
      } catch (error) {
        console.error("Error fetching forms:", error);
      }
    };
    fetchForms();
  }, []);

  const filteredForms = forms
    ? forms.filter((form) =>
        form.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge variant="default">{t("status.active")}</Badge>;
      case "draft":
        return <Badge variant="secondary">{t("status.draft")}</Badge>;
      case "inactive":
        return <Badge variant="outline">{t("status.inactive")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button onClick={() => router.push("/dashboard/forms/new")}>
          <FilePlus className="mr-2 h-4 w-4" />
          {t("createNewForm")}
        </Button>
      </div>

      <div className="flex items-center w-full max-w-sm space-x-2">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("searchPlaceholder")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">{t("columnName")}</TableHead>
              <TableHead className="w-[20%]">{t("columnStatus")}</TableHead>
              <TableHead className="hidden md:table-cell w-[10%]">
                {t("columnResponses")}
              </TableHead>
              <TableHead className="hidden md:table-cell w-[15%]">
                {t("columnCreated")}
              </TableHead>
              <TableHead className="hidden md:table-cell w-[15%]">
                {t("columnUpdated")}
              </TableHead>
              <TableHead className="text-right w-[10%]">
                {t("columnActions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredForms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {t("noFormsFound")}
                </TableCell>
              </TableRow>
            ) : (
              filteredForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <Link
                        href={`/dashboard/forms/${form.id}`}
                        className="hover:underline"
                      >
                        {form.name}
                      </Link>
                      <span className="text-xs text-muted-foreground md:hidden">
                        {new Date(form.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(form.status)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {form.responseCount}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(form.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(form.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">{t("openMenu")}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/forms/${form.id}`)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          {t("view")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/forms/${form.id}/edit`)
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          {t("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          {t("duplicate")}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-center space-x-2 py-4">
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("previous")}
        </Button>
        <Button variant="outline" size="sm" disabled>
          {t("next")}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
