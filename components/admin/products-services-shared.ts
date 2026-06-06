import type { AdminDataTableContextAction } from "./admin-data-table";

export type ProductLabels = {
  add: string;
  addTitle: string;
  cancel: string;
  confirmDelete: string;
  delete: string;
  deleteBodyTemplate: string;
  deleteTitle: string;
  download: string;
  edit: string;
  editTitle: string;
  error: string;
  fileSelected: string;
  fields: {
    brandCodes: string;
    categoryCodes: string;
    datasheetUrl: string;
    deliveryFee: string;
    descriptionEn: string;
    descriptionTh: string;
    discountedPrice: string;
    googleCategoryId: string;
    isActive: string;
    isBestSeller: string;
    isNewProduct: string;
    isPromotion: string;
    model: string;
    nameEn: string;
    nameTh: string;
    price: string;
    rank: string;
    seoDescriptionEn: string;
    seoDescriptionTh: string;
    seoTitleEn: string;
    seoTitleTh: string;
    shortDescriptionEn: string;
    shortDescriptionTh: string;
    slug: string;
    subCategoryCodes: string;
  };
  noSuggestions: string;
  save: string;
  search: string;
  searchPlaceholder: string;
  searchTooShort: string;
  template: string;
  upload: string;
};

export function getProductContextMenuActions(
  labels: ProductLabels,
): AdminDataTableContextAction[] {
  return [
    { id: "rank", icon: "sort", label: labels.fields.rank },
    { id: "nameTh", icon: "title", label: labels.fields.nameTh },
    { id: "nameEn", icon: "translate", label: labels.fields.nameEn },
    {
      id: "shortDescriptionTh",
      icon: "notes",
      label: labels.fields.shortDescriptionTh,
    },
    {
      id: "shortDescriptionEn",
      icon: "note",
      label: labels.fields.shortDescriptionEn,
    },
    { id: "descriptionTh", icon: "article", label: labels.fields.descriptionTh },
    { id: "descriptionEn", icon: "description", label: labels.fields.descriptionEn },
    {
      id: "datasheetUrl",
      icon: "picture_as_pdf",
      label: labels.fields.datasheetUrl,
    },
    { id: "slug", icon: "link", label: labels.fields.slug },
    { id: "price", icon: "payments", label: labels.fields.price },
    { id: "deliveryFee", icon: "local_shipping", label: labels.fields.deliveryFee },
    {
      id: "model",
      icon: "precision_manufacturing",
      label: labels.fields.model,
    },
    { id: "seoTitleTh", icon: "manage_search", label: labels.fields.seoTitleTh },
    { id: "seoTitleEn", icon: "language", label: labels.fields.seoTitleEn },
    {
      id: "seoDescriptionTh",
      icon: "text_snippet",
      label: labels.fields.seoDescriptionTh,
    },
    {
      id: "seoDescriptionEn",
      icon: "chat_bubble",
      label: labels.fields.seoDescriptionEn,
    },
    {
      id: "googleCategoryId",
      icon: "category",
      label: labels.fields.googleCategoryId,
    },
    { id: "isActive", icon: "toggle_on", label: labels.fields.isActive },
    { id: "isNewProduct", icon: "fiber_new", label: labels.fields.isNewProduct },
    {
      id: "isBestSeller",
      icon: "award_star",
      label: labels.fields.isBestSeller,
    },
    {
      id: "isPromotion",
      icon: "local_fire_department",
      label: labels.fields.isPromotion,
    },
    {
      id: "categoryCodes",
      icon: "folder",
      label: labels.fields.categoryCodes,
    },
    {
      id: "subCategoryCodes",
      icon: "subdirectory_arrow_right",
      label: labels.fields.subCategoryCodes,
    },
    {
      id: "brandCodes",
      icon: "branding_watermark",
      label: labels.fields.brandCodes,
    },
    { id: "delete", icon: "delete", label: labels.delete },
  ];
}
