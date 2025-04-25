"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit,
  Share,
  Copy,
  FileText,
  BarChart,
  Settings,
  Globe,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import apiClient from "@/lib/axios";
import { FormPreview } from "@/components/preview";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Animation,
  AnimationSpeed,
  FormLayout,
  FormSpacing,
} from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type ThemeType = {
  id: string;
  name: string;
  description?: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  accentColor: string;
  textColor: string;
  fontFamily: string;
  isDefault?: boolean;
  defaultAnimation: Animation;
  defaultLayout: FormLayout;
  defaultSpacing: FormSpacing;
  borderRadius: number;
};

type ResponseField = {
  value: string | string[];
  type: string;
  fieldId: string;
};

type FormResponse = {
  id: string;
  email: string | null;
  createdAt: string;
  completed: boolean;
  fields: Record<string, ResponseField>;
};

type ResponsesData = {
  responses: FormResponse[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasMore: boolean;
  };
};

type FormData = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  collectEmails: boolean;
  limitOneResponsePerUser: boolean;
  showProgressBar: boolean;
  shuffleQuestions: boolean;
  themeId: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  backgroundColor: string | null;
  fontFamily: string | null;
  animation: Animation;
  animationSpeed: AnimationSpeed;
  layout: string;
  spacing: string;
  borderRadius: number;
  userId: string;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
  fields: {
    id: string;
    formId: string;
    type: string;
    label: string;
    placeholder: string;
    required: boolean;
    options: string[];
    order: number;
    customStyle: boolean;
    backgroundColor: string | null;
    textColor: string | null;
    borderColor: string | null;
    animation: string | null;
  }[];
  theme?: ThemeType;
};

export default function FormPreviewPage() {
  const t = useTranslations("dashboard.formPreview");
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;
  const [form, setForm] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [formUrl, setFormUrl] = useState("");
  const [formTheme, setFormTheme] = useState<ThemeType | undefined>(undefined);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [responsesError, setResponsesError] = useState<string | null>(null);
  const [responsePagination, setResponsePagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await apiClient.get(`/api/forms/${formId}`);
        const result = response.data;
        setForm(result);

        if (result.theme) {
          const theme: ThemeType = {
            id: result.theme.id,
            name: result.theme.name,
            description: result.theme.description || "",
            primaryColor: result.theme.primaryColor,
            secondaryColor: result.theme.secondaryColor,
            backgroundColor: result.theme.backgroundColor,
            accentColor: result.theme.accentColor,
            textColor: result.theme.textColor,
            fontFamily: result.theme.fontFamily,
            defaultAnimation: result.theme.defaultAnimation as Animation,
            defaultLayout: result.theme.defaultLayout as FormLayout,
            defaultSpacing: result.theme.defaultSpacing as FormSpacing,
            borderRadius: result.theme.borderRadius,
          };
          setFormTheme(theme);
        }

        const baseUrl = window.location.origin;
        setFormUrl(`${baseUrl}/submission/${formId}`);
      } catch (error) {
        console.error("Error fetching form:", error);
        toast.error(t("errorFetchingForm"));
      }
    };
    fetchForm();
  }, [formId, t]);

  const fetchResponses = async (page = 1) => {
    setResponsesLoading(true);
    setResponsesError(null);
    try {
      const response = await apiClient.get(
        `/api/forms/${formId}/responses?page=${page}&limit=10`
      );
      const data = response.data as ResponsesData;
      setResponses(data.responses);
      setResponsePagination({
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages,
        total: data.pagination.total,
      });
    } catch (error) {
      console.error("Error fetching responses:", error);
      setResponsesError(t("errorFetchingResponses"));
    } finally {
      setResponsesLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    if (value === "responses" && responses.length === 0 && !responsesLoading) {
      fetchResponses();
    }
  };

  const handlePageChange = (page: number) => {
    fetchResponses(page);
  };

  const exportResponsesToCSV = () => {
    if (!form || !responses.length) return;

    const fieldLabels = new Set<string>();
    responses.forEach((response) => {
      Object.keys(response.fields).forEach((label) => {
        fieldLabels.add(label);
      });
    });

    const headers = ["ID", "Email", "Submitted At", ...Array.from(fieldLabels)];

    const csvRows = [headers.join(",")];

    responses.forEach((response) => {
      const row = [
        response.id,
        response.email || "",
        new Date(response.createdAt).toLocaleString(),
      ];

      Array.from(fieldLabels).forEach((label) => {
        const field = response.fields[label];
        row.push(field ? `"${field.value}"` : "");
      });

      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${form.name.replace(/\s+/g, "_")}_responses.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const handlePublishForm = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.put(`/api/forms/${formId}/publish`);
      const result = response.data;

      if (result.success) {
        setForm((prevForm) =>
          prevForm ? { ...prevForm, status: "active" } : null
        );
        toast.success(t("formPublished"));
        setPublishDialogOpen(false);
      } else {
        toast.error(result.message || t("errorPublishingForm"));
      }
    } catch (error) {
      console.error("Error publishing form:", error);
      toast.error(t("errorPublishingForm"));
    } finally {
      setIsLoading(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard
      .writeText(formUrl)
      .then(() => {
        toast.success(t("linkCopied"));
      })
      .catch(() => {
        toast.error(t("errorCopyingLink"));
      });
  };

  const duplicateForm = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(`/api/forms/${formId}/duplicate`);
      const result = response.data;

      if (result.success) {
        toast.success(t("formDuplicated"));
        router.push(`/dashboard/forms/${result.data.id}`);
      } else {
        toast.error(result.message || t("errorDuplicatingForm"));
      }
    } catch (error) {
      console.error("Error duplicating form:", error);
      toast.error(t("errorDuplicatingForm"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!form) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-4 space-y-4">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold">{form.name}</h1>
          <div className="flex items-center mt-1">
            {getStatusBadge(form.status)}
            <span className="ml-2 text-sm text-muted-foreground">
              {t("lastUpdated")}:{" "}
              {new Date(form.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {form.status.toLowerCase() === "draft" && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setPublishDialogOpen(true)}
            >
              <Globe className="mr-2 h-4 w-4" />
              {t("publish")}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShareDialogOpen(true)}
          >
            <Share className="mr-2 h-4 w-4" />
            {t("share")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={duplicateForm}
            disabled={isLoading}
          >
            <Copy className="mr-2 h-4 w-4" />
            {t("duplicate")}
          </Button>
          <Button asChild>
            <Link href={`/dashboard/forms/${formId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              {t("edit")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs
        defaultValue="preview"
        className="w-full"
        onValueChange={handleTabChange}
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="preview">
            <FileText className="h-4 w-4 mr-2" />
            {t("tabPreview")}
          </TabsTrigger>
          <TabsTrigger value="responses">
            <BarChart className="h-4 w-4 mr-2" />
            {t("tabResponses")}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            {t("tabSettings")}
          </TabsTrigger>
          <TabsTrigger value="share">
            <Share className="h-4 w-4 mr-2" />
            {t("tabShare")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4 ">
          <Card>
            <CardHeader>
              <CardTitle>{t("formPreview")}</CardTitle>
            </CardHeader>
            <CardContent>
              <FormPreview
                formName={form.name}
                formDescription={form.description || ""}
                fields={form.fields}
                theme={formTheme}
                animation={form.animation}
                animationSpeed={form.animationSpeed}
                showAnimationPreview={true}
                showProgressBar={form.showProgressBar}
                collectEmails={form.collectEmails}
                layout={form.layout || "standard"}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses">
          <Card>
            <CardHeader className="flex flex-col gap-4">
              <CardTitle>
                {t("responses", { count: form.responseCount })}
              </CardTitle>
              {responses.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportResponsesToCSV}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t("exportCSV")}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {responsesLoading ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">
                    {t("loadingResponses")}
                  </p>
                </div>
              ) : responsesError ? (
                <div className="py-8 text-center">
                  <p className="text-destructive">{responsesError}</p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => fetchResponses()}
                  >
                    {t("tryAgain")}
                  </Button>
                </div>
              ) : responses.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">
                  {t("noResponses")}
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("submittedAt")}</TableHead>
                          {form.collectEmails && (
                            <TableHead>{t("email")}</TableHead>
                          )}
                          {form.fields.map((field) => (
                            <TableHead key={field.id}>{field.label}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {responses.map((response) => (
                          <TableRow key={response.id}>
                            <TableCell className="font-medium">
                              {new Date(response.createdAt).toLocaleString()}
                            </TableCell>
                            {form.collectEmails && (
                              <TableCell>{response.email || "-"}</TableCell>
                            )}
                            {form.fields.map((field) => {
                              const responseField = Object.entries(
                                response.fields
                              ).find(([label]) => label === field.label);
                              return (
                                <TableCell key={field.id}>
                                  {responseField ? responseField[1].value : "-"}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {responsePagination.totalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              handlePageChange(
                                Math.max(1, responsePagination.currentPage - 1)
                              )
                            }
                            disabled={responsePagination.currentPage === 1}
                          />
                        </PaginationItem>

                        {Array.from({
                          length: responsePagination.totalPages,
                        }).map((_, i) => {
                          const page = i + 1;
                          if (
                            page === 1 ||
                            page === responsePagination.totalPages ||
                            (page >= responsePagination.currentPage - 1 &&
                              page <= responsePagination.currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  isActive={
                                    page === responsePagination.currentPage
                                  }
                                  onClick={() => handlePageChange(page)}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            (page === 2 &&
                              responsePagination.currentPage > 3) ||
                            (page === responsePagination.totalPages - 1 &&
                              responsePagination.currentPage <
                                responsePagination.totalPages - 2)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              handlePageChange(
                                Math.min(
                                  responsePagination.totalPages,
                                  responsePagination.currentPage + 1
                                )
                              )
                            }
                            disabled={
                              responsePagination.currentPage ===
                              responsePagination.totalPages
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>{t("formSettings")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">
                      {t("collectEmails")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {form.collectEmails ? t("yes") : t("no")}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">
                      {t("limitOneResponse")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {form.limitOneResponsePerUser ? t("yes") : t("no")}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">
                      {t("showProgressBar")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {form.showProgressBar ? t("yes") : t("no")}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">
                      {t("shuffleQuestions")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {form.shuffleQuestions ? t("yes") : t("no")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share">
          <Card>
            <CardHeader>
              <CardTitle>{t("shareForm")}</CardTitle>
            </CardHeader>
            <CardContent>
              {form.status.toLowerCase() === "active" ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {t("shareDescription")}
                  </p>
                  <div className="flex flex-col gap-2">
                    <Input value={formUrl} readOnly />
                    <Button variant="outline" size="sm" onClick={copyShareLink}>
                      <Copy className="h-4 w-4 mr-2" />
                      {t("copyLink")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {t("publishFirstToShare")}
                  </p>
                  <Button onClick={() => setPublishDialogOpen(true)}>
                    <Globe className="mr-2 h-4 w-4" />
                    {t("publishNow")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Publish Dialog */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("publishForm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("publishDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handlePublishForm} disabled={isLoading}>
              {isLoading ? t("publishing") : t("publishNow")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("shareForm")}</DialogTitle>
            <DialogDescription>{t("shareFormDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col gap-2">
              <Input value={formUrl} readOnly />
              <Button variant="outline" size="sm" onClick={copyShareLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col space-y-2">
              <h4 className="text-sm font-medium">{t("embedCode")}</h4>
              <Input
                value={`<iframe src="${formUrl}" width="100%" height="650" frameborder="0"></iframe>`}
                readOnly
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              {t("done")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
