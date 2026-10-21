import Link from 'next/link';
import { ArrowRight, HeartPulse, ShieldCheck } from 'lucide-react';
import { LoginForm } from './LoginForm';

export function LoginScreen() {
  return (
    <section className="relative flex flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_#eaf4ff_0%,_#f8fbff_36%,_#ffffff_76%)] px-4 py-6 sm:px-6 sm:py-8">
      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.12em] text-emerald-700">
            Cổng bệnh nhân
          </p>
          {/* <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Chào mừng trở lại
          </h1> */}
          {/* <p className="mt-2 text-sm leading-6 text-slate-600">
            Đăng nhập để tiếp tục chăm sóc sức khỏe cùng MedConnect.
          </p> */}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.3)]">
          <div aria-hidden="true" className="h-1.5 bg-gradient-to-r from-blue-700 via-blue-500 to-emerald-400" />
          <div className="p-6 sm:p-9">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <HeartPulse aria-hidden="true" className="h-7 w-7" />
          </div>

            <div className="mb-7">
              <h2 className="text-xl font-bold text-slate-900 text-center">Đăng nhập</h2>
            </div>

            <LoginForm />

            <div className="my-7 h-px bg-slate-100" />

            <p className="flex flex-wrap items-center justify-center gap-1.5 text-center text-sm text-slate-600">
              Chưa có tài khoản?
              <Link
                className="inline-flex items-center gap-1 font-bold text-blue-700 transition-colors hover:text-blue-800"
                href="#patient-registration"
              >
                Đăng ký ngay
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck aria-hidden="true" className="h-4 w-4 text-emerald-700" />
          Thông tin cá nhân của bạn được bảo mật.
        </p>
      </div>
    </section>
  );
}