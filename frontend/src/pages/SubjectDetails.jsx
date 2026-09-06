import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../lib/api'
import {
  Loader2,
  ArrowLeft,
  BookOpen,
  ChevronRight,
  GraduationCap
} from 'lucide-react'

export default function SubjectDetails() {
  const { subjectId } = useParams()
  const [chapters, setChapters] = useState(null)

  useEffect(() => {
    api.get(`/classes/subjects/${subjectId}/chapters`)
      .then(({ data }) => setChapters(data))
      .catch(() => setChapters([]))
  }, [subjectId])

  if (chapters === null) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-24">
      <Link
        to="/app/browse-courses"
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </Link>

      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-brand-600 to-blue-700 text-white p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 grid place-items-center">
            <BookOpen className="w-8 h-8" />
          </div>

          <div>
            <p className="text-sm text-white/70">
              Hitesh Coaching Classes
            </p>
            <h1 className="text-2xl font-bold">
              Subject Learning
            </h1>
            <p className="text-sm text-white/75 mt-1">
              Chapters & lessons
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Chapters
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Select a chapter to continue learning
        </p>
      </div>

      {!chapters.length ? (
        <div className="card p-10 text-center">
          <GraduationCap className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h2 className="font-semibold text-slate-800">
            No chapters available
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Learning content will appear here when it is published.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {chapters.map((chapter, index) => (
            <Link
              key={chapter.id}
              to={`/app/chapter/${chapter.id}`}
              className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 grid place-items-center font-bold">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800">
                  {chapter.title}
                </h3>

                {chapter.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {chapter.description}
                  </p>
                )}
              </div>

              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
