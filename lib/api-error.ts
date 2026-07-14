type ErrorPayload =
  | string
  | {
      error?: string;
      message?: string | string[];
    };

const thaiCharacterPattern = /[\u0E00-\u0E7F]/;

export async function getErrorMessage(
  response: Response,
  fallbackMessage: string,
) {
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const payload = (await response.json()) as ErrorPayload;
      const message = normalizeErrorPayload(payload);

      return localizeErrorMessage(message || fallbackMessage, fallbackMessage);
    }

    const text = (await response.text()).trim();

    return localizeErrorMessage(text || fallbackMessage, fallbackMessage);
  } catch {
    return fallbackMessage;
  }
}

export function localizeErrorMessage(message: string, fallbackMessage: string) {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    return fallbackMessage;
  }

  if (!isThaiMessageExpected(fallbackMessage) || thaiCharacterPattern.test(trimmedMessage)) {
    return trimmedMessage;
  }

  return translateEnglishErrorToThai(trimmedMessage) ?? trimmedMessage;
}

function normalizeErrorPayload(payload: ErrorPayload) {
  if (typeof payload === "string") {
    return payload.trim();
  }

  if (Array.isArray(payload.message)) {
    return payload.message
      .map((item) => item.trim())
      .filter(Boolean)
      .join(", ");
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message.trim();
  }

  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error.trim();
  }

  return "";
}

function isThaiMessageExpected(message: string) {
  return thaiCharacterPattern.test(message);
}

function translateEnglishErrorToThai(message: string) {
  const directMatch = directTranslationMap[message];

  if (directMatch) {
    return directMatch;
  }

  const requiredMatch = message.match(/^(.+?) is required\.$/);

  if (requiredMatch) {
    return `${translateFieldName(requiredMatch[1])} จำเป็นต้องระบุ`;
  }

  const validNumberMatch = message.match(/^(.+?) must be a valid number\.$/);

  if (validNumberMatch) {
    return `${translateFieldName(validNumberMatch[1])} ต้องเป็นตัวเลขที่ถูกต้อง`;
  }

  const trueFalseMatch = message.match(/^(.+?) must be either true or false\.$/);

  if (trueFalseMatch) {
    return `${translateFieldName(trueFalseMatch[1])} ต้องเป็น true หรือ false`;
  }

  const notFoundByCodeMatch = message.match(/^Resource not found by code: (.+)$/);

  if (notFoundByCodeMatch) {
    return `ไม่พบข้อมูลสำหรับรหัส: ${notFoundByCodeMatch[1]}`;
  }

  const inventoryByIdMatch = message.match(/^Inventory stock not found by id: (.+)$/);

  if (inventoryByIdMatch) {
    return `ไม่พบข้อมูลสต็อกสำหรับรหัส: ${inventoryByIdMatch[1]}`;
  }

  const productBySkuMatch = message.match(/^Product not found by sku: (.+)$/);

  if (productBySkuMatch) {
    return `ไม่พบสินค้าสำหรับ SKU: ${productBySkuMatch[1]}`;
  }

  const roleNotFoundMatch = message.match(/^Role (.+) not found\.$/);

  if (roleNotFoundMatch) {
    return `ไม่พบบทบาท ${roleNotFoundMatch[1]}`;
  }

  const invalidNumberMatch = message.match(/^Invalid number: (.+)$/);

  if (invalidNumberMatch) {
    return `ข้อมูลตัวเลขไม่ถูกต้อง: ${invalidNumberMatch[1]}`;
  }

  const invalidBooleanMatch = message.match(/^Invalid boolean: (.+)$/);

  if (invalidBooleanMatch) {
    return `ค่า boolean ไม่ถูกต้อง: ${invalidBooleanMatch[1]}`;
  }

  const shouldNotBeEmptyMatch = message.match(/^(.+?) should not be empty$/);

  if (shouldNotBeEmptyMatch) {
    return `${translateFieldName(shouldNotBeEmptyMatch[1])} ห้ามเว้นว่าง`;
  }

  const mustBeEmailMatch = message.match(/^(.+?) must be an email$/);

  if (mustBeEmailMatch) {
    return `${translateFieldName(mustBeEmailMatch[1])} ต้องเป็นอีเมลที่ถูกต้อง`;
  }

  const positiveIntegerMatch = message.match(/^(.+?) must be a positive integer$/);

  if (positiveIntegerMatch) {
    return `${translateFieldName(positiveIntegerMatch[1])} ต้องเป็นจำนวนเต็มบวก`;
  }

  const greaterThanMatch = message.match(/^(.+?) must not be greater than (.+)$/);

  if (greaterThanMatch) {
    return `${translateFieldName(greaterThanMatch[1])} ต้องไม่เกิน ${greaterThanMatch[2]}`;
  }

  const lessThanMatch = message.match(/^(.+?) must not be less than (.+)$/);

  if (lessThanMatch) {
    return `${translateFieldName(lessThanMatch[1])} ต้องไม่น้อยกว่า ${lessThanMatch[2]}`;
  }

  return null;
}

function translateFieldName(field: string) {
  return fieldTranslationMap[field] ?? field;
}

const fieldTranslationMap: Record<string, string> = {
  companyName: "ชื่อบริษัท",
  email: "อีเมล",
  file: "ไฟล์",
  fullName: "ชื่อ-สกุล",
  isActive: "สถานะการใช้งาน",
  objectName: "ชื่อไฟล์",
  page: "หน้า",
  pageSize: "จำนวนต่อหน้า",
  phoneNumber: "เบอร์โทรศัพท์",
  productSku: "SKU สินค้า",
  rank: "ลำดับ",
  requestedQuantity: "จำนวนที่ต้องการ",
};

const directTranslationMap: Record<string, string> = {
  'A file field named "file" is required.': 'จำเป็นต้องส่งไฟล์ในฟิลด์ชื่อ "file"',
  "A record with the same unique value already exists.": "มีข้อมูลนี้อยู่ในระบบแล้ว",
  "A referenced relation does not exist.": "ไม่พบข้อมูลความสัมพันธ์ที่อ้างอิง",
  "File must not be empty.": "ไฟล์ต้องไม่ว่าง",
  "Google product category import file is required.": "จำเป็นต้องอัปโหลดไฟล์หมวดหมู่สินค้าของ Google",
  "Invalid objectName.": "ชื่อไฟล์ไม่ถูกต้อง",
  "Inventory stock import file is required.": "จำเป็นต้องอัปโหลดไฟล์นำเข้าสินค้าคงคลัง",
  "Invalid or expired bearer token.": "โทเคนเข้าสู่ระบบไม่ถูกต้องหรือหมดอายุ",
  "Invalid token audience.": "ผู้รับโทเคนไม่ถูกต้อง",
  "Keycloak authentication service is unavailable.":
    "บริการยืนยันตัวตนของ Keycloak ไม่พร้อมใช้งาน",
  "Malformed bearer token.": "รูปแบบ bearer token ไม่ถูกต้อง",
  "Missing bearer token.": "ไม่พบ bearer token",
  "Missing required quotation request fields.": "กรุณากรอกข้อมูลที่จำเป็นสำหรับคำขอใบเสนอราคาให้ครบถ้วน",
  "Product import file has no data rows.": "ไฟล์นำเข้าสินค้าไม่มีข้อมูล",
  "Product import file is required.": "จำเป็นต้องอัปโหลดไฟล์นำเข้าสินค้า",
  "requestedQuantity must be a positive integer.": "จำนวนที่ต้องการต้องเป็นจำนวนเต็มบวก",
  "Superadmin role is required.": "ต้องใช้สิทธิ์ Superadmin",
  "Unexpected database error.": "เกิดข้อผิดพลาดกับฐานข้อมูล",
  "Unable to authenticate with Keycloak admin API.": "ไม่สามารถยืนยันตัวตนกับ Keycloak admin API ได้",
  "Unable to load Keycloak users.": "ไม่สามารถโหลดข้อมูลผู้ใช้งานจาก Keycloak ได้",
  "Unable to load Keycloak roles.": "ไม่สามารถโหลดบทบาทจาก Keycloak ได้",
  "Unable to read product import file.": "ไม่สามารถอ่านไฟล์นำเข้าสินค้าได้",
  "User already exists.": "ผู้ใช้นี้มีอยู่ในระบบแล้ว",
  "User not found.": "ไม่พบผู้ใช้",
};
