import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../lib/api'
import { Loader2, ArrowLeft, PlayCircle, FileText, ChevronRight } from 'lucide-react'

export default function ChapterDetails() {
  const { chapterId } = useParams()
  const [lessons, setLessons] = useState(null)

  useEffect(() => {
    api.get(`/classes/chapters/${chapterId}/lessons`)
      .then(({ data }) => setLessons(data))
      .catch(() => setLessons([]))
  }, [chapterId])

  if (lessons === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-600" size={28} />
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-24">
      <Link
        to="/app/browse-courses"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
      >
        <ArrowLeft size={18} />
        Back to Courses
      </Link>

      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-blue-700 p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
          Hitesh Coaching Classes
        </p>
        <h1 className="text-2xl font-bold mt-1">
          Chapter Lessons
        </h1>
        <p className="text-sm mt-2 opacity-90">
          Learn each lesson step by step
        </p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3">
          Lessons
        </h2>

        {lessons.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-center">
            <PlayCircle className="mx-auto text-slate-400 mb-2" size={32} />
            <p className="font-semibold text-slate-700">
              No lessons available
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Lessons will appear here when published.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <Link
                key={lesson.id}
                to={`/app/lesson/${lesson.id}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 grid place-items-center shrink-0">
                  {lesson.video_url ? (
                    <PlayCircle size={22} />
                  ) : (
                    <FileText size={22} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 font-semibold">
                    Lesson {index + 1}
                  </p>
                  <h3 className="font-bold text-slate-900 truncate">
                    {lesson.title}
                  </h3>
                  {lesson.description && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {lesson.description}
                    </p>
                  )}
                </div>

                <ChevronRight size={20} className="text-slate-400 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
