import { useEffect, useState } from 'react'
import api from '../lib/api'
import { Loader2, BookOpen, GraduationCap, ChevronRight } from 'lucide-react'

export default function BrowseCourses() {
  const [courses, setCourses] = useState(null)

  useEffect(() => {
    api.get('/classes')
      .then(({ data }) => setCourses(data))
      .catch(() => setCourses([]))
  }, [])

  if (courses === null) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Browse Courses
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore courses available at Hitesh Coaching Classes
        </p>
      </div>

      {!courses.length ? (
        <div className="card p-10 text-center">
          <GraduationCap className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h2 className="font-semibold text-slate-800">
            No courses available
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            New coaching courses will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map(course => (
            <div
              key={course.id}
              className="card overflow-hidden"
            >
              <div className="p-5 bg-gradient-to-br from-brand-600 to-blue-700 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/15 grid place-items-center">
                    <GraduationCap className="w-8 h-8" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold">
                      {course.name}
                    </h2>
                    <p className="text-sm text-white/75 mt-1">
                      Academic Year {course.academic_year}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-brand-600" />
                  <h3 className="font-semibold text-slate-800">
                    Subjects
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(course.subjects || []).map(subject => (
                    <span
                      key={subject.id}
                      className="px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium"
                    >
                      {subject.name}
                    </span>
                  ))}

                  {!course.subjects?.length && (
                    <span className="text-xs text-slate-400">
                      Subjects not added yet
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => window.location.href = `/app/course/${course.id}`}
                  className="w-full mt-4 py-3 rounded-xl bg-slate-50 text-brand-700 font-semibold text-sm flex items-center justify-center gap-2"
                >
                  View Course
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
