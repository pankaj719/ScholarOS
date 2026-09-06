import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import { Loader2, ArrowLeft, BookOpen, GraduationCap, ChevronRight } from 'lucide-react'

export default function CourseDetails() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/classes')
      .then(({ data }) => {
        const found = data.find(item => String(item.id) === String(id))
        setCourse(found || null)
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="space-y-4 pb-24">
        <Link
          to="/app/browse-courses"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>

        <div className="card p-8 text-center">
          <GraduationCap className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h2 className="font-semibold text-slate-800">
            Course not found
          </h2>
        </div>
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

      <div className="card overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-brand-600 to-blue-700 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 grid place-items-center">
              <GraduationCap className="w-9 h-9" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                {course.name}
              </h1>
              <p className="text-sm text-white/75 mt-1">
                Academic Year {course.academic_year}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-brand-600" />
            <h2 className="font-bold text-slate-900">
              Subjects
            </h2>
          </div>

          <div className="space-y-3">
            {(course.subjects || []).map(subject => (
              <div
                key={subject.id}
                className="flex items-center gap-3 p-4 rounded-xl bg-slate-50"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 grid place-items-center">
                  <BookOpen className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800">
                    {subject.name}
                  </h3>
                  {subject.code && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {subject.code}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => window.location.href = `/app/subject/${subject.id}`}
                  className="w-9 h-9 rounded-full bg-white grid place-items-center text-brand-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ))}

            {!course.subjects?.length && (
              <p className="text-sm text-slate-500 text-center py-6">
                No subjects available for this course.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
