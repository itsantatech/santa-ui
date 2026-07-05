"use client";

export function getTransactionToastCopy(locale: "th" | "en") {
  if (locale === "th") {
    return {
      created: "สร้างข้อมูลสำเร็จ",
      deleted: "ลบข้อมูลสำเร็จ",
      error: "เกิดข้อผิดพลาด",
      imported: "นำเข้าข้อมูลสำเร็จ",
      submitted: "ส่งข้อมูลสำเร็จ",
      updated: "บันทึกข้อมูลสำเร็จ",
      uploaded: "อัปโหลดไฟล์สำเร็จ",
    };
  }

  return {
    created: "Created successfully",
    deleted: "Deleted successfully",
    error: "Something went wrong",
    imported: "Import completed",
    submitted: "Submitted successfully",
    updated: "Saved successfully",
    uploaded: "Upload completed",
  };
}
