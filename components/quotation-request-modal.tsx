"use client";

import { type FormEvent, useState } from "react";

type QuotationRequestModalProps = {
  defaultQuantity: number;
  locale: "th" | "en";
  onClose: () => void;
  productNameEn: string;
  productNameTh: string;
  productSku: string;
  productSlug: string;
};

export function QuotationRequestModal({
  defaultQuantity,
  locale,
  onClose,
  productNameEn,
  productNameTh,
  productSku,
  productSlug,
}: QuotationRequestModalProps) {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [requestedQuantity, setRequestedQuantity] = useState(String(defaultQuantity));
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const labels =
    locale === "th"
      ? {
          additional: "อื่นๆ",
          company: "องค์กร/บริษัท",
          email: "อีเมล",
          fullName: "ชื่อ-สกุล",
          phoneNumber: "เบอร์โทรศัพท์",
          quantity: "จำนวนสินค้าที่ต้องการ",
        }
      : {
          additional: "Additional details",
          company: "Organization / Company",
          email: "Email",
          fullName: "Full name",
          phoneNumber: "Phone number",
          quantity: "Requested quantity",
        };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/quotation-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName,
          email,
          fullName,
          note,
          phoneNumber,
          productNameEn,
          productNameTh,
          productSku,
          productSlug,
          requestedQuantity: Number(requestedQuantity || 0),
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to submit quotation request.");
      }

      setIsSubmitted(true);
    } catch {
      setError(
        locale === "th"
          ? "ไม่สามารถส่งคำขอใบเสนอราคาได้ในขณะนี้"
          : "Unable to submit the quotation request right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-product-modal-backdrop" onClick={onClose} role="presentation">
      <div
        aria-modal="true"
        className="admin-product-modal admin-faq-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="admin-product-modal-header">
          <h2>{locale === "th" ? "ขอใบเสนอราคา" : "Request quotation"}</h2>
          <button
            aria-label={locale === "th" ? "ปิด" : "Close"}
            className="admin-product-modal-close"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        {isSubmitted ? (
          <div className="admin-product-form quotation-modal-success">
            <h2>{locale === "th" ? "ส่งคำขอเรียบร้อยแล้ว" : "Request submitted"}</h2>
            <p>
              {locale === "th"
                ? "เจ้าหน้าที่จะติดต่อกลับพร้อมใบเสนอราคาภายใน 24 ชม."
                : "Our team will contact you with a quotation within 24 hours."}
            </p>
            <button className="admin-product-add-button" onClick={onClose} type="button">
              {locale === "th" ? "ปิด" : "Close"}
            </button>
          </div>
        ) : (
          <form className="admin-product-form" onSubmit={handleSubmit}>
            <fieldset className="quotation-modal-grid">
              <legend>{locale === "th" ? "ข้อมูลสำหรับใบเสนอราคา" : "Quotation request details"}</legend>
              <label className="admin-product-field">
                <span>
                  <span className="quotation-modal-required">*</span> {labels.fullName}
                </span>
                <input
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder={labels.fullName}
                  required
                  value={fullName}
                />
              </label>

              <label className="admin-product-field">
                <span>
                  <span className="quotation-modal-required">*</span> {labels.phoneNumber}
                </span>
                <input
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder={labels.phoneNumber}
                  required
                  value={phoneNumber}
                />
              </label>

              <label className="admin-product-field admin-product-field-wide">
                <span>{labels.company}</span>
                <input
                  onChange={(event) => setCompanyName(event.target.value)}
                  placeholder={labels.company}
                  value={companyName}
                />
              </label>

              <label className="admin-product-field">
                <span>
                  <span className="quotation-modal-required">*</span> {labels.email}
                </span>
                <input
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={labels.email}
                  required
                  type="email"
                  value={email}
                />
              </label>

              <label className="admin-product-field">
                <span>
                  <span className="quotation-modal-required">*</span> {labels.quantity}
                </span>
                <input
                  min="1"
                  onChange={(event) => setRequestedQuantity(event.target.value)}
                  placeholder={labels.quantity}
                  required
                  type="number"
                  value={requestedQuantity}
                />
              </label>

              <label className="admin-product-field admin-product-field-wide">
                <span>{labels.additional}</span>
                <textarea
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={labels.additional}
                  rows={4}
                  value={note}
                />
              </label>
            </fieldset>

            {error ? <p className="admin-product-form-error">{error}</p> : null}

            <div className="admin-product-modal-actions">
              <button className="admin-product-secondary-button" onClick={onClose} type="button">
                {locale === "th" ? "ยกเลิก" : "Cancel"}
              </button>
              <button className="admin-product-add-button" disabled={isSubmitting} type="submit">
                {isSubmitting
                  ? locale === "th"
                    ? "กำลังส่ง..."
                    : "Submitting..."
                  : locale === "th"
                    ? "ส่งคำขอใบเสนอราคา"
                    : "Submit quotation request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
