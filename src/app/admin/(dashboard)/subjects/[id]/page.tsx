import { requireAdmin } from "@/lib/admin-auth";
import SubjectEditorClient from "@/components/admin/SubjectEditorClient";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SubjectEditorPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  return (
    <div className="py-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link
            href="/admin/subjects"
            className="hover:text-blue-600 transition-colors"
          >
            מקצועות
          </Link>
          <svg
            className="w-3.5 h-3.5 rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          <span className="text-slate-700">עריכת מקצוע</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          עריכת מקצוע
        </h1>
      </div>

      <SubjectEditorClient subjectId={id} />
    </div>
  );
}
