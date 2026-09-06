import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../lib/api'
import {
  Loader2,
  ArrowLeft,
  PlayCircle,
  FileText,
  BookOpen
} from 'lucide-react'

export default function LessonDetails() {
  const { lessonId } = useParams()
  const [lesson, setLesson] = useState(null)

  useEffect(() => {
    api.get(`/classes/lessons/${lessonId}`)
      .then(({ data }) => setLesson(data))
      .catch(() => setLesson(false))
  }, [lessonId])

  if (lesson === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-600" size={28} />
      </div>
    )
  }

  if (lesson === false) {
    return (
      <div className="p-6 text-center">
        <p className="font-semibold text-slate-700">
          Lesson not found
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-24">

      <Link
        to={`/app/chapter/${lesson.chapter_id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
      >
        <ArrowLeft size={18} />
        Back to Chapter
      </Link>

      <div>
        <p className="text-sm font-semibold text-brand-600">
          {lesson.subject_name}
        </p>

        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          {lesson.title}
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          {lesson.chapter_title}
        </p>
      </div>

      {lesson.video_url ? (
        <div className="overflow-hidden rounded-2xl bg-black shadow-sm">
          <video
            controls
            className="w-full aspect-video"
            src={lesson.video_url}
          >
            Your browser does not support video playback.
          </video>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-center">
          <PlayCircle
            className="mx-auto text-slate-400 mb-2"
            size={40}
          />
          <p className="font-semibold text-slate-700">
            No video available
          </p>
        </div>
      )}

      {lesson.description && (
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={19} className="text-brand-600" />
            <h2 className="font-bold text-slate-900">
              About this lesson
            </h2>
          </div>

          <p className="text-sm leading-6 text-slate-600 whitespace-pre-line">
            {lesson.description}
          </p>
        </div>
      )}

      {lesson.notes_file_path && (
        <a
          href={lesson.notes_file_path}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 p-4"
        >
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 grid place-items-center">
            <FileText size={22} />
          </div>

          <div className="flex-1">
            <p className="font-bold text-slate-900">
              Lesson Notes
            </p>
            <p className="text-sm text-slate-500">
              Open notes / study material
            </p>
          </div>
        </a>
      )}

    </div>
  )
}
