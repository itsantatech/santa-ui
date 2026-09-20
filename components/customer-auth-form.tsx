"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

export function CustomerAuthForm({ error, locale, mode, returnTo = `/${locale}/profile` }: { error?: "client" | "credentials" | "missing" | "unavailable"; locale: Locale; mode: "login" | "register"; returnTo?: string }) {
  const thai = locale === "th";
  const registering = mode === "register";
  const googleHref = `/api/auth/login?locale=${locale}&returnTo=${encodeURIComponent(returnTo)}&idp=google`;
  return <section className="customer-auth-page"><div className="customer-auth-card"><h1>{registering ? (thai ? "สมัครสมาชิก" : "Create account") : (thai ? "เข้าสู่ระบบ" : "Sign in")}</h1><p>{registering ? (thai ? "สร้างบัญชีลูกค้าสำหรับสั่งซื้อและติดตามสินค้า" : "Create a customer account to order and track deliveries.") : (thai ? "เข้าสู่ระบบเพื่อสั่งซื้อและจัดการคำสั่งซื้อ" : "Sign in to order and manage your purchases.")}</p>{error ? <p className="customer-auth-form-error" role="alert">{getLoginErrorMessage(error, thai)}</p> : null}{registering ? <form action="/api/auth/register" method="post"><input name="locale" type="hidden" value={locale} /><div className="customer-auth-name-fields"><label><span>{thai ? "ชื่อ" : "First name"}</span><input autoComplete="given-name" name="firstName" required /></label><label><span>{thai ? "นามสกุล" : "Last name"}</span><input autoComplete="family-name" name="lastName" required /></label></div><label><span>{thai ? "ชื่อผู้ใช้ (username ที่ใช้ลงชื่อเข้าใช้)" : "Username (used to sign in)"}</span><input autoComplete="username" name="username" pattern="[A-Za-z0-9._-]{3,64}" required /></label><label><span>{thai ? "อีเมล" : "Email"}</span><input autoComplete="email" name="email" required type="email" /></label><PasswordField autoComplete="new-password" label={thai ? "รหัสผ่าน" : "Password"} minLength={8} name="password" /><button className="customer-auth-primary" type="submit">{thai ? "สมัครสมาชิก" : "Create account"}</button></form> : <form action="/api/auth/password" method="post"><input name="locale" type="hidden" value={locale} /><input name="returnTo" type="hidden" value={returnTo} /><label><span>{thai ? "ชื่อผู้ใช้" : "Username"}</span><input autoComplete="username" name="username" required /></label><PasswordField autoComplete="current-password" label={thai ? "รหัสผ่าน" : "Password"} name="password" /><button className="customer-auth-primary" type="submit">{thai ? "เข้าสู่ระบบ" : "Sign in"}</button></form>}<div className="customer-auth-divider"><span>{thai ? "หรือ" : "or"}</span></div><a className="customer-auth-social customer-auth-google" href={googleHref}><GoogleIcon />Google</a>{!registering ? <><Link className="customer-auth-link" href={`/${locale}/forgot-password`}>{thai ? "ลืมรหัสผ่าน?" : "Forgot password?"}</Link><p className="customer-auth-switch">{thai ? "ยังไม่มีบัญชี?" : "New customer?"} <Link href={`/${locale}/register`}>{thai ? "สมัครสมาชิก" : "Create account"}</Link></p></> : <p className="customer-auth-switch">{thai ? "มีบัญชีแล้ว?" : "Already registered?"} <Link href={`/${locale}/login`}>{thai ? "เข้าสู่ระบบ" : "Sign in"}</Link></p>}</div></section>;
}

function GoogleIcon() {
  return <svg aria-hidden="true" className="customer-auth-google-icon" viewBox="0 0 18 18"><path d="M17.64 9.205c0-.638-.057-1.251-.164-1.84H9v3.48h4.844a4.14 4.14 0 0 1-1.797 2.716v2.259h2.909c1.703-1.568 2.684-3.877 2.684-6.615Z" fill="#4285f4" /><path d="M9 18c2.43 0 4.468-.806 5.956-2.18l-2.909-2.259c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.71H.957v2.333A9 9 0 0 0 9 18Z" fill="#34a853" /><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.594.102-1.17.282-1.71V4.957H.957A9 9 0 0 0 0 9c0 1.452.348 2.827.957 4.043l3.007-2.333Z" fill="#fbbc05" /><path d="M9 3.58c1.321 0 2.507.454 3.441 1.345l2.582-2.582C13.464.891 11.426 0 9 0A9 9 0 0 0 .957 4.957L3.964 7.29C4.672 5.164 6.656 3.58 9 3.58Z" fill="#ea4335" /></svg>;
}

function PasswordField({ autoComplete, label, minLength, name }: { autoComplete: string; label: string; minLength?: number; name: string }) {
  const [visible, setVisible] = useState(false);
  return <label><span>{label}</span><span className="customer-password-input"><input autoComplete={autoComplete} minLength={minLength} name={name} required type={visible ? "text" : "password"} /><button aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible((current) => !current)} type="button"><span aria-hidden="true" className="material-symbols-outlined">{visible ? "visibility_off" : "visibility"}</span></button></span></label>;
}

function getLoginErrorMessage(error: "client" | "credentials" | "missing" | "unavailable", thai: boolean) {
  if (error === "credentials") return thai ? "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" : "Incorrect username or password.";
  if (error === "client") return thai ? "ระบบเข้าสู่ระบบยังไม่ได้เปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ" : "The sign-in client is not configured.";
  if (error === "missing") return thai ? "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" : "Enter your username and password.";
  return thai ? "ระบบเข้าสู่ระบบไม่พร้อมใช้งาน กรุณาลองใหม่" : "Sign-in is temporarily unavailable. Please try again.";
}
