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
    { id: "rank", label: labels.fields.rank },
    { id: "nameTh", label: labels.fields.nameTh },
    { id: "nameEn", label: labels.fields.nameEn },
    { id: "shortDescriptionTh", label: labels.fields.shortDescriptionTh },
    { id: "shortDescriptionEn", label: labels.fields.shortDescriptionEn },
    { id: "descriptionTh", label: labels.fields.descriptionTh },
    { id: "descriptionEn", label: labels.fields.descriptionEn },
    { id: "datasheetUrl", label: labels.fields.datasheetUrl },
    { id: "slug", label: labels.fields.slug },
    { id: "price", label: labels.fields.price },
    { id: "deliveryFee", label: labels.fields.deliveryFee },
    { id: "model", label: labels.fields.model },
    { id: "seoTitleTh", label: labels.fields.seoTitleTh },
    { id: "seoTitleEn", label: labels.fields.seoTitleEn },
    { id: "seoDescriptionTh", label: labels.fields.seoDescriptionTh },
    { id: "seoDescriptionEn", label: labels.fields.seoDescriptionEn },
    { id: "googleCategoryId", label: labels.fields.googleCategoryId },
    { id: "isActive", label: labels.fields.isActive },
    { id: "isNewProduct", label: labels.fields.isNewProduct },
    { id: "isBestSeller", label: labels.fields.isBestSeller },
    { id: "isPromotion", label: labels.fields.isPromotion },
    { id: "discountedPrice", label: labels.fields.discountedPrice },
    { id: "categoryCodes", label: labels.fields.categoryCodes },
    { id: "subCategoryCodes", label: labels.fields.subCategoryCodes },
    { id: "brandCodes", label: labels.fields.brandCodes },
  ];
}
