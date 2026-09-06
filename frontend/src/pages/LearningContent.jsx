import { useEffect, useState } from 'react'
import api from '../lib/api'
import {
  Loader2,
  Plus,
  Trash2,
  BookOpen,
  Video,
  FileText,
  Eye,
  EyeOff,
  Pencil,
  Save,
  X
} from 'lucide-react'

export default function LearningContent() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [chapters, setChapters] = useState([])
  const [lessons, setLessons] = useState({})

  const [loading, setLoading] = useState(true)
  const [openChapter, setOpenChapter] = useState(null)

  const [chapterTitle, setChapterTitle] = useState('')
  const [chapterDescription, setChapterDescription] = useState('')

  const [editingChapter, setEditingChapter] = useState(null)
  const [chapterEditData, setChapterEditData] = useState({})

  const [lessonData, setLessonData] = useState({})
  const [editingLesson, setEditingLesson] = useState(null)
  const [editData, setEditData] = useState({})
  const [uploading, setUploading] = useState({})

  // -----------------------------
  // LOAD CLASSES
  // -----------------------------
  const loadClasses = async () => {
    try {
      setLoading(true)

      const res = await api.get('/classes')
      const data = Array.isArray(res.data) ? res.data : []

      setClasses(data)

      if (data.length && !selectedClass) {
        setSelectedClass(String(data[0].id))
      }
    } catch (error) {
      console.error(error)
      alert('Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  // -----------------------------
  // LOAD SUBJECTS
  // -----------------------------
  const loadSubjects = async () => {
    if (!selectedClass) {
      setSubjects([])
      setSelectedSubject('')
      return
    }

    try {
      const res = await api.get(`/classes/${selectedClass}/subjects`)
      const data = Array.isArray(res.data) ? res.data : []

      setSubjects(data)

      if (data.length) {
        setSelectedSubject(String(data[0].id))
      } else {
        setSelectedSubject('')
      }
    } catch (error) {
      console.error(error)
      setSubjects([])
      setSelectedSubject('')
      alert('Failed to load subjects')
    }
  }

  // -----------------------------
  // LOAD CHAPTERS + LESSONS
  // -----------------------------
  const loadChapters = async () => {
    if (!selectedSubject) {
      setChapters([])
      setLessons({})
      return
    }

    try {
      const res = await api.get(
        `/classes/subjects/${selectedSubject}/chapters`
      )

      const chapterData = Array.isArray(res.data) ? res.data : []

      setChapters(chapterData)

      const lessonMap = {}

      await Promise.all(
        chapterData.map(async chapter => {
          try {
            const lessonRes = await api.get(
              `/classes/chapters/${chapter.id}/lessons`
            )

            lessonMap[chapter.id] = Array.isArray(lessonRes.data)
              ? lessonRes.data
              : []
          } catch (error) {
            console.error(error)
            lessonMap[chapter.id] = []
          }
        })
      )

      setLessons(lessonMap)
    } catch (error) {
      console.error(error)
      setChapters([])
      setLessons({})
      alert('Failed to load chapters')
    }
  }

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    loadSubjects()
  }, [selectedClass])

  useEffect(() => {
    loadChapters()
  }, [selectedSubject])

  // -----------------------------
  // ADD CHAPTER
  // -----------------------------
  const addChapter = async () => {
    if (!selectedSubject) {
      alert('Please select a subject')
      return
    }

    if (!chapterTitle.trim()) {
      alert('Chapter title is required')
      return
    }

    try {
      await api.post(
        `/classes/subjects/${selectedSubject}/chapters`,
        {
          title: chapterTitle.trim(),
          description: chapterDescription.trim(),
          display_order: chapters.length,
          is_published: true
        }
      )

      setChapterTitle('')
      setChapterDescription('')

      await loadChapters()
    } catch (error) {
      console.error(error)
      alert('Failed to add chapter')
    }
  }

  // -----------------------------
  // DELETE CHAPTER
  // -----------------------------
  const deleteChapter = async chapter => {
    const ok = window.confirm(
      `Delete "${chapter.title}"?\n\nAll lessons inside this chapter will also be deleted.`
    )

    if (!ok) return

    try {
      await api.delete(`/classes/chapters/${chapter.id}`)
      await loadChapters()
    } catch (error) {
      console.error(error)
      alert('Failed to delete chapter')
    }
  }

  // -----------------------------
  // START EDIT CHAPTER
  // -----------------------------
  const startEditChapter = chapter => {
    setEditingChapter(chapter.id)

    setChapterEditData({
      title: chapter.title || '',
      description: chapter.description || '',
      display_order: chapter.display_order ?? 0
    })
  }

  // -----------------------------
  // CANCEL EDIT CHAPTER
  // -----------------------------
  const cancelEditChapter = () => {
    setEditingChapter(null)
    setChapterEditData({})
  }

  // -----------------------------
  // SAVE CHAPTER
  // -----------------------------
  const saveEditChapter = async chapter => {
    if (!chapterEditData.title?.trim()) {
      alert('Chapter title is required')
      return
    }

    try {
      await api.put(`/classes/chapters/${chapter.id}`, {
        title: chapterEditData.title.trim(),
        description: chapterEditData.description?.trim() || '',
        display_order: Number(chapterEditData.display_order) || 0,
        is_published: chapter.is_published
      })

      setEditingChapter(null)
      setChapterEditData({})

      await loadChapters()
    } catch (error) {
      console.error(error)
      alert('Failed to update chapter')
    }
  }

  // -----------------------------
  // TOGGLE CHAPTER PUBLISH
  // -----------------------------
  const toggleChapter = async chapter => {
    try {
      await api.put(`/classes/chapters/${chapter.id}`, {
        is_published: !chapter.is_published
      })

      await loadChapters()
    } catch (error) {
      console.error(error)
      alert('Failed to update chapter status')
    }
  }

  // -----------------------------
  // LESSON FORM
  // -----------------------------
  const updateLessonField = (chapterId, field, value) => {
    setLessonData(prev => ({
      ...prev,
      [chapterId]: {
        ...(prev[chapterId] || {}),
        [field]: value
      }
    }))
  }

  // -----------------------------
  // UPLOAD FILE
  // -----------------------------
  const uploadFile = async (file, type, chapterId, lessonId = null) => {
    if (!file) return null

    const key = `${type}-${chapterId}-${lessonId || 'new'}`

    try {
      setUploading(prev => ({
        ...prev,
        [key]: true
      }))

      const formData = new FormData()
      formData.append('file', file)

      const res = await api.post(
        '/learning-content',
        formData
      )

      const fileUrl = res.data?.file_url

      if (!fileUrl) {
        throw new Error('Upload URL missing')
      }

      if (lessonId) {
        setEditData(prev => ({
          ...prev,
          [type === 'video' ? 'video_url' : 'notes_file_path']: fileUrl
        }))
      } else {
        updateLessonField(
          chapterId,
          type === 'video' ? 'video_url' : 'notes_file_path',
          fileUrl
        )
      }

      return fileUrl
    } catch (error) {
      console.error(error)
      alert(
        error.response?.data?.error ||
        `Failed to upload ${type === 'video' ? 'video' : 'notes'}`
      )
      return null
    } finally {
      setUploading(prev => ({
        ...prev,
        [key]: false
      }))
    }
  }

  // -----------------------------
  // ADD LESSON
  // -----------------------------
  const addLesson = async chapter => {
    const data = lessonData[chapter.id] || {}

    if (!data.title?.trim()) {
      alert('Lesson title is required')
      return
    }

    try {
      const existingLessons = lessons[chapter.id] || []

      await api.post(
        `/classes/chapters/${chapter.id}/lessons`,
        {
          title: data.title.trim(),
          description: data.description?.trim() || '',
          video_url: data.video_url?.trim() || '',
          notes_file_path: data.notes_file_path?.trim() || '',
          display_order: existingLessons.length,
          is_published: true
        }
      )

      setLessonData(prev => ({
        ...prev,
        [chapter.id]: {}
      }))

      await loadChapters()
    } catch (error) {
      console.error(error)
      alert('Failed to add lesson')
    }
  }

  // -----------------------------
  // DELETE LESSON
  // -----------------------------
  const deleteLesson = async lesson => {
    const ok = window.confirm(
      `Delete "${lesson.title}"?`
    )

    if (!ok) return

    try {
      await api.delete(`/classes/lessons/${lesson.id}`)
      await loadChapters()
    } catch (error) {
      console.error(error)
      alert('Failed to delete lesson')
    }
  }

  // -----------------------------
  // START EDIT LESSON
  // -----------------------------
  const startEditLesson = lesson => {
    setEditingLesson(lesson.id)

    setEditData({
      title: lesson.title || '',
      description: lesson.description || '',
      video_url: lesson.video_url || '',
      notes_file_path: lesson.notes_file_path || ''
    })
  }

  // -----------------------------
  // CANCEL EDIT LESSON
  // -----------------------------
  const cancelEditLesson = () => {
    setEditingLesson(null)
    setEditData({})
  }

  // -----------------------------
  // SAVE LESSON
  // -----------------------------
  const saveEditLesson = async lesson => {
    if (!editData.title?.trim()) {
      alert('Lesson title is required')
      return
    }

    try {
      await api.put(`/classes/lessons/${lesson.id}`, {
        title: editData.title.trim(),
        description: editData.description?.trim() || '',
        video_url: editData.video_url?.trim() || '',
        notes_file_path: editData.notes_file_path?.trim() || '',
        is_published: lesson.is_published
      })

      setEditingLesson(null)
      setEditData({})

      await loadChapters()
    } catch (error) {
      console.error(error)
      alert('Failed to update lesson')
    }
  }

  // -----------------------------
  // TOGGLE LESSON PUBLISH
  // -----------------------------
  const toggleLesson = async lesson => {
    try {
      await api.put(`/classes/lessons/${lesson.id}`, {
        is_published: !lesson.is_published
      })

      await loadChapters()
    } catch (error) {
      console.error(error)
      alert('Failed to update lesson status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          Learning Content
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage chapters, lessons, videos and study material.
        </p>
      </div>

      {/* CLASS + SUBJECT */}
      <div className="bg-white rounded-2xl border p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium mb-2">
              Class
            </label>

            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 bg-white"
            >
              <option value="">
                Select Class
              </option>

              {classes.map(cls => (
                <option
                  key={cls.id}
                  value={cls.id}
                >
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Subject
            </label>

            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 bg-white"
            >
              <option value="">
                Select Subject
              </option>

              {subjects.map(subject => (
                <option
                  key={subject.id}
                  value={subject.id}
                >
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* ADD CHAPTER */}
      {selectedSubject && (
        <div className="bg-white rounded-2xl border p-4 md:p-5">

          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={20} />
            <h2 className="font-semibold">
              Add Chapter
            </h2>
          </div>

          <div className="space-y-3">

            <input
              type="text"
              value={chapterTitle}
              onChange={e => setChapterTitle(e.target.value)}
              placeholder="Chapter title"
              className="w-full border rounded-xl px-3 py-2.5"
            />

            <textarea
              value={chapterDescription}
              onChange={e => setChapterDescription(e.target.value)}
              placeholder="Chapter description"
              rows={3}
              className="w-full border rounded-xl px-3 py-2.5"
            />

            <button
              onClick={addChapter}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white"
            >
              <Plus size={18} />
              Add Chapter
            </button>

          </div>
        </div>
      )}

      {/* CHAPTERS */}
      <div className="space-y-4">

        {chapters.length === 0 && selectedSubject && (
          <div className="bg-white border rounded-2xl p-8 text-center text-gray-500">
            No chapters found for this subject.
          </div>
        )}

        {chapters.map(chapter => {
          const chapterLessons = lessons[chapter.id] || []
          const isOpen = openChapter === chapter.id
          const isEditing = editingChapter === chapter.id

          return (
            <div
              key={chapter.id}
              className="bg-white border rounded-2xl overflow-hidden"
            >

              {/* CHAPTER HEADER */}
              <div className="p-4">

                {isEditing ? (
                  <div className="space-y-3">

                    <input
                      type="text"
                      value={chapterEditData.title || ''}
                      onChange={e =>
                        setChapterEditData(prev => ({
                          ...prev,
                          title: e.target.value
                        }))
                      }
                      placeholder="Chapter title"
                      className="w-full border rounded-xl px-3 py-2.5"
                    />

                    <textarea
                      value={chapterEditData.description || ''}
                      onChange={e =>
                        setChapterEditData(prev => ({
                          ...prev,
                          description: e.target.value
                        }))
                      }
                      placeholder="Chapter description"
                      rows={3}
                      className="w-full border rounded-xl px-3 py-2.5"
                    />

                    <input
                      type="number"
                      value={chapterEditData.display_order ?? 0}
                      onChange={e =>
                        setChapterEditData(prev => ({
                          ...prev,
                          display_order: e.target.value
                        }))
                      }
                      placeholder="Display order"
                      className="w-full border rounded-xl px-3 py-2.5"
                    />

                    <div className="flex flex-wrap gap-2">

                      <button
                        onClick={() => saveEditChapter(chapter)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white"
                      >
                        <Save size={17} />
                        Save
                      </button>

                      <button
                        onClick={cancelEditChapter}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border"
                      >
                        <X size={17} />
                        Cancel
                      </button>

                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                    <div className="min-w-0">

                      <div className="flex items-center gap-2 flex-wrap">

                        <h2 className="font-semibold text-lg">
                          {chapter.title}
                        </h2>

                        {chapter.is_published ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                            Published
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                            Unpublished
                          </span>
                        )}

                      </div>

                      {chapter.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {chapter.description}
                        </p>
                      )}

                      <p className="text-xs text-gray-400 mt-2">
                        {chapterLessons.length} lesson
                        {chapterLessons.length === 1 ? '' : 's'}
                      </p>

                    </div>

                    <div className="flex items-center gap-2 flex-wrap">

                      <button
                        onClick={() => startEditChapter(chapter)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        onClick={() => toggleChapter(chapter)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm"
                      >
                        {chapter.is_published ? (
                          <>
                            <EyeOff size={16} />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye size={16} />
                            Publish
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => deleteChapter(chapter)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 text-sm"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>

                      <button
                        onClick={() =>
                          setOpenChapter(isOpen ? null : chapter.id)
                        }
                        className="px-3 py-2 rounded-xl bg-gray-100 text-sm"
                      >
                        {isOpen ? 'Hide Lessons' : 'View Lessons'}
                      </button>

                    </div>

                  </div>
                )}

              </div>

              {/* LESSON AREA */}
              {isOpen && (
                <div className="border-t bg-gray-50 p-4 space-y-4">

                  {/* ADD LESSON */}
                  <div className="bg-white border rounded-2xl p-4">

                    <div className="flex items-center gap-2 mb-4">
                      <Plus size={19} />
                      <h3 className="font-semibold">
                        Add Lesson
                      </h3>
                    </div>

                    <div className="space-y-3">

                      <input
                        type="text"
                        value={lessonData[chapter.id]?.title || ''}
                        onChange={e =>
                          updateLessonField(
                            chapter.id,
                            'title',
                            e.target.value
                          )
                        }
                        placeholder="Lesson title"
                        className="w-full border rounded-xl px-3 py-2.5"
                      />

                      <textarea
                        value={lessonData[chapter.id]?.description || ''}
                        onChange={e =>
                          updateLessonField(
                            chapter.id,
                            'description',
                            e.target.value
                          )
                        }
                        placeholder="Lesson description"
                        rows={3}
                        className="w-full border rounded-xl px-3 py-2.5"
                      />

                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          Video
                        </label>

                        <input
                          type="file"
                          accept=".mp4,.webm,.mov,.mkv,video/mp4,video/webm,video/quicktime"
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) {
                              uploadFile(
                                file,
                                'video',
                                chapter.id
                              )
                            }
                          }}
                          className="w-full border rounded-xl px-3 py-2.5 bg-white"
                        />

                        {uploading[`video-${chapter.id}-new`] && (
                          <p className="text-sm text-blue-600">
                            Uploading video...
                          </p>
                        )}

                        {lessonData[chapter.id]?.video_url && (
                          <p className="text-xs text-green-600 break-all">
                            Video uploaded: {lessonData[chapter.id].video_url}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          Notes / Study Material
                        </label>

                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,application/pdf"
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) {
                              uploadFile(
                                file,
                                'notes',
                                chapter.id
                              )
                            }
                          }}
                          className="w-full border rounded-xl px-3 py-2.5 bg-white"
                        />

                        {uploading[`notes-${chapter.id}-new`] && (
                          <p className="text-sm text-blue-600">
                            Uploading notes...
                          </p>
                        )}

                        {lessonData[chapter.id]?.notes_file_path && (
                          <p className="text-xs text-green-600 break-all">
                            Notes uploaded: {lessonData[chapter.id].notes_file_path}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => addLesson(chapter)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white"
                      >
                        <Plus size={18} />
                        Add Lesson
                      </button>

                    </div>
                  </div>

                  {/* LESSON LIST */}
                  {chapterLessons.length === 0 ? (
                    <div className="bg-white border rounded-2xl p-6 text-center text-gray-500">
                      No lessons in this chapter yet.
                    </div>
                  ) : (
                    <div className="space-y-3">

                      {chapterLessons.map(lesson => {

                        const isEditingLesson =
                          editingLesson === lesson.id

                        return (
                          <div
                            key={lesson.id}
                            className="bg-white border rounded-2xl p-4"
                          >

                            {isEditingLesson ? (
                              <div className="space-y-3">

                                <input
                                  type="text"
                                  value={editData.title || ''}
                                  onChange={e =>
                                    setEditData(prev => ({
                                      ...prev,
                                      title: e.target.value
                                    }))
                                  }
                                  placeholder="Lesson title"
                                  className="w-full border rounded-xl px-3 py-2.5"
                                />

                                <textarea
                                  value={editData.description || ''}
                                  onChange={e =>
                                    setEditData(prev => ({
                                      ...prev,
                                      description: e.target.value
                                    }))
                                  }
                                  placeholder="Lesson description"
                                  rows={3}
                                  className="w-full border rounded-xl px-3 py-2.5"
                                />

                                <div className="space-y-2">
                                  <label className="block text-sm font-medium">
                                    Replace Video
                                  </label>

                                  <input
                                    type="file"
                                    accept=".mp4,.webm,.mov,.mkv,video/mp4,video/webm,video/quicktime"
                                    onChange={e => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        uploadFile(
                                          file,
                                          'video',
                                          chapter.id,
                                          lesson.id
                                        )
                                      }
                                    }}
                                    className="w-full border rounded-xl px-3 py-2.5 bg-white"
                                  />

                                  {uploading[`video-${chapter.id}-${lesson.id}`] && (
                                    <p className="text-sm text-blue-600">
                                      Uploading video...
                                    </p>
                                  )}

                                  {editData.video_url && (
                                    <p className="text-xs text-green-600 break-all">
                                      Current video: {editData.video_url}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <label className="block text-sm font-medium">
                                    Replace Notes / Study Material
                                  </label>

                                  <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,application/pdf"
                                    onChange={e => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        uploadFile(
                                          file,
                                          'notes',
                                          chapter.id,
                                          lesson.id
                                        )
                                      }
                                    }}
                                    className="w-full border rounded-xl px-3 py-2.5 bg-white"
                                  />

                                  {uploading[`notes-${chapter.id}-${lesson.id}`] && (
                                    <p className="text-sm text-blue-600">
                                      Uploading notes...
                                    </p>
                                  )}

                                  {editData.notes_file_path && (
                                    <p className="text-xs text-green-600 break-all">
                                      Current notes: {editData.notes_file_path}
                                    </p>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-2">

                                  <button
                                    onClick={() =>
                                      saveEditLesson(lesson)
                                    }
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white"
                                  >
                                    <Save size={17} />
                                    Save
                                  </button>

                                  <button
                                    onClick={cancelEditLesson}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border"
                                  >
                                    <X size={17} />
                                    Cancel
                                  </button>

                                </div>

                              </div>
                            ) : (
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                <div className="flex items-start gap-3 min-w-0">

                                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                    {lesson.video_url ? (
                                      <Video size={19} />
                                    ) : (
                                      <FileText size={19} />
                                    )}
                                  </div>

                                  <div className="min-w-0">

                                    <h4 className="font-medium">
                                      {lesson.title}
                                    </h4>

                                    {lesson.description && (
                                      <p className="text-sm text-gray-500 mt-1">
                                        {lesson.description}
                                      </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-2 mt-2">

                                      {lesson.is_published ? (
                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                          Published
                                        </span>
                                      ) : (
                                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                          Unpublished
                                        </span>
                                      )}

                                      {lesson.video_url && (
                                        <span className="text-xs text-gray-500">
                                          Video
                                        </span>
                                      )}

                                      {lesson.notes_file_path && (
                                        <span className="text-xs text-gray-500">
                                          Notes
                                        </span>
                                      )}

                                    </div>

                                  </div>

                                </div>

                                <div className="flex items-center gap-2 flex-wrap">

                                  <button
                                    onClick={() =>
                                      startEditLesson(lesson)
                                    }
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm"
                                  >
                                    <Pencil size={16} />
                                    Edit
                                  </button>

                                  <button
                                    onClick={() =>
                                      toggleLesson(lesson)
                                    }
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm"
                                  >
                                    {lesson.is_published ? (
                                      <>
                                        <EyeOff size={16} />
                                        Unpublish
                                      </>
                                    ) : (
                                      <>
                                        <Eye size={16} />
                                        Publish
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() =>
                                      deleteLesson(lesson)
                                    }
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 text-sm"
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>

                                </div>

                              </div>
                            )}

                          </div>
                        )
                      })}

                    </div>
                  )}

                </div>
              )}

            </div>
          )
        })}

      </div>

    </div>
  )
}
