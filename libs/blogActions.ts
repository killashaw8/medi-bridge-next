"use server";

import { redirect } from "next/navigation";

export async function handleBlogSearch(formData: FormData) {
  const q = String(formData.get("q") ?? "").trim();
  redirect(q ? `/blogs?search=${encodeURIComponent(q)}` : "/blogs");
}
