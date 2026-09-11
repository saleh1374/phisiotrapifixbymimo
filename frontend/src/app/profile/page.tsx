"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  Save,
  Shield,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { apiFetch, errorMessage } from "@/lib/api";
import { cn, faDate, faNum } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import type { User as UserType } from "@/types";

const profileSchema = z.object({
  full_name: z.string().min(1, "نام و نام خانوادگی الزامی است").max(100),
  phone_number: z
    .string()
    .regex(/^09\d{9}$/, "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود")
    .or(z.literal("")),
  email: z
    .string()
    .email("ایمیل معتبر نیست")
    .or(z.literal(""))
    .nullable(),
  national_code: z
    .string()
    .length(10, "کد ملی باید ۱۰ رقم باشد")
    .regex(/^\d+$/, "کد ملی فقط عدد می‌پذیرد")
    .or(z.literal(""))
    .nullable(),
  bio: z.string().max(500).optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, accessToken, hasHydrated, setUser } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (hasHydrated && (!accessToken || !user)) router.replace("/login");
  }, [accessToken, user, hasHydrated, router]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => apiFetch<UserType>("/auth/me/"),
    enabled: !!accessToken,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: profile?.full_name ?? "",
      phone_number: profile?.phone_number ?? "",
      email: profile?.email ?? "",
      national_code: profile?.national_code ?? "",
      bio: profile?.bio ?? "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileForm) =>
      apiFetch<UserType>("/auth/me/", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: data.full_name,
          phone_number: data.phone_number || undefined,
          email: data.email || null,
          national_code: data.national_code || null,
          bio: data.bio || null,
        }),
      }),
    onSuccess: async (updatedUser) => {
      setErrorMsg(null);
      // Update auth store so header/nav reflects changes immediately
      setUser(updatedUser);
      // Update query cache
      queryClient.setQueryData(["my-profile"], updatedUser);
      // Reset form to new values so isDirty becomes false
      reset({
        full_name: updatedUser.full_name ?? "",
        phone_number: updatedUser.phone_number ?? "",
        email: updatedUser.email ?? "",
        national_code: updatedUser.national_code ?? "",
        bio: updatedUser.bio ?? "",
      });
      setSuccessMsg("پروفایل با موفقیت به‌روزرسانی شد ✅");
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (e) => {
      setSuccessMsg(null);
      setErrorMsg(errorMessage((e as { data?: unknown }).data, "خطا در ذخیره تغییرات"));
      setTimeout(() => setErrorMsg(null), 5000);
    },
  });

  if (!user || !accessToken) return null;

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-l from-navy to-navy-light p-6 text-white shadow-xl sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl font-black">
            {profile?.full_name?.[0] || "👤"}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-black">
              {profile?.full_name || "نام ثبت نشده"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald px-3 py-1 text-xs font-bold">
                {profile?.role_display}
              </span>
              {profile?.specialty && (
                <span className="rounded-full bg-gold/90 px-3 py-1 text-xs font-bold text-navy">
                  {profile.specialty}
                </span>
              )}
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                عضو از {faDate(profile?.created_at ?? new Date().toISOString())}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-navy/10 bg-white p-4 text-center shadow-sm">
          <User className="mx-auto h-5 w-5 text-emerald" />
          <p className="mt-2 text-xs text-navy/50">نام کاربری</p>
          <p className="mt-0.5 truncate text-sm font-bold">{profile?.username}</p>
        </div>
        <div className="rounded-xl border border-navy/10 bg-white p-4 text-center shadow-sm">
          <Phone className="mx-auto h-5 w-5 text-emerald" />
          <p className="mt-2 text-xs text-navy/50">موبایل</p>
          <p className="mt-0.5 text-sm font-bold" dir="ltr">
            {faNum(profile?.phone_number ?? "—")}
          </p>
        </div>
        <div className="rounded-xl border border-navy/10 bg-white p-4 text-center shadow-sm">
          <CreditCard className="mx-auto h-5 w-5 text-emerald" />
          <p className="mt-2 text-xs text-navy/50">کد ملی</p>
          <p className="mt-0.5 text-sm font-bold" dir="ltr">
            {faNum(profile?.national_code ?? "—")}
          </p>
        </div>
        <div className="rounded-xl border border-navy/10 bg-white p-4 text-center shadow-sm">
          <Shield className="mx-auto h-5 w-5 text-emerald" />
          <p className="mt-2 text-xs text-navy/50">نقش</p>
          <p className="mt-0.5 text-sm font-bold">{profile?.role_display}</p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="mt-8 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-black">ویرایش اطلاعات شخصی</h2>
        <p className="mt-1 text-sm text-navy/50">
          اطلاعات زیر را تکمیل کنید تا پزشک و کلینیک شما را بهتر بشناسند.
        </p>

        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald/10 px-4 py-3 text-sm font-semibold text-emerald">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {errorMsg}
          </div>
        )}

        <form
          onSubmit={handleSubmit((data) => updateMutation.mutate(data))}
          className="mt-6 space-y-5"
        >
          {/* Full Name */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
              <User className="h-4 w-4 text-emerald" />
              نام و نام خانوادگی <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register("full_name")}
              placeholder="مثال: علی رضایی"
              className={cn(
                "w-full rounded-xl border bg-cream/50 px-4 py-3 text-sm outline-none transition-colors focus:border-emerald focus:bg-white",
                errors.full_name ? "border-red-400" : "border-navy/15"
              )}
            />
            {errors.full_name && (
              <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
              <Phone className="h-4 w-4 text-emerald" />
              شماره موبایل
            </label>
            <input
              type="text"
              maxLength={11}
              dir="ltr"
              {...register("phone_number")}
              placeholder="0912xxxxxxx"
              className={cn(
                "w-full rounded-xl border bg-cream/50 px-4 py-3 text-sm outline-none transition-colors focus:border-emerald focus:bg-white",
                errors.phone_number ? "border-red-400" : "border-navy/15"
              )}
            />
            {errors.phone_number && (
              <p className="mt-1 text-xs text-red-500">{errors.phone_number.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
              <Mail className="h-4 w-4 text-emerald" />
              ایمیل
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="example@email.com"
              className={cn(
                "w-full rounded-xl border bg-cream/50 px-4 py-3 text-sm outline-none transition-colors focus:border-emerald focus:bg-white",
                errors.email ? "border-red-400" : "border-navy/15"
              )}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* National Code */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
              <CreditCard className="h-4 w-4 text-emerald" />
              کد ملی
            </label>
            <input
              type="text"
              maxLength={10}
              dir="ltr"
              {...register("national_code")}
              placeholder="۱۰ رقم"
              className={cn(
                "w-full rounded-xl border bg-cream/50 px-4 py-3 text-sm outline-none transition-colors focus:border-emerald focus:bg-white",
                errors.national_code ? "border-red-400" : "border-navy/15"
              )}
            />
            {errors.national_code && (
              <p className="mt-1 text-xs text-red-500">
                {errors.national_code.message}
              </p>
            )}
            <p className="mt-1 text-xs text-navy/40">
              کد ملی برای احراز هویت و صدور گواهینامه ضروری است
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
              درباره من
            </label>
            <textarea
              {...register("bio")}
              rows={3}
              placeholder="توضیحات کوتاه درباره خودتان..."
              className={cn(
                "w-full rounded-xl border bg-cream/50 px-4 py-3 text-sm outline-none transition-colors focus:border-emerald focus:bg-white resize-none",
                errors.bio ? "border-red-400" : "border-navy/15"
              )}
            />
            {errors.bio && (
              <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>
            )}
          </div>

          {/* Doctor-only fields (read-only info) */}
          {user.role === "doctor" && (
            <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
              <p className="text-sm font-bold text-navy/70">اطلاعات پزشکی</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-navy/50">شماره نظام پزشکی</p>
                  <p className="mt-0.5 text-sm font-bold" dir="ltr">
                    {profile?.medical_license_number || "ثبت نشده"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-navy/50">تخصص</p>
                  <p className="mt-0.5 text-sm font-bold">
                    {profile?.specialty || "ثبت نشده"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={!isDirty || updateMutation.isPending}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald px-8 text-sm font-bold text-white shadow-md transition-colors hover:bg-emerald-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              ذخیره تغییرات
            </button>
            {isDirty && (
              <p className="text-xs text-navy/40">تغییرات ذخیره نشده دارید</p>
            )}
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="mt-6 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-black">اطلاعات حساب کاربری</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-cream/50 px-4 py-3">
            <span className="text-sm text-navy/60">نام کاربری</span>
            <span className="text-sm font-bold">{profile?.username}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-cream/50 px-4 py-3">
            <span className="text-sm text-navy/60">شماره موبایل</span>
            <span className="text-sm font-bold" dir="ltr">
              {faNum(profile?.phone_number ?? "—")}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-cream/50 px-4 py-3">
            <span className="text-sm text-navy/60">تاریخ عضویت</span>
            <span className="text-sm font-bold">
              {faDate(profile?.created_at ?? new Date().toISOString())}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
