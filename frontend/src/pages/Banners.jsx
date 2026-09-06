import React from 'react'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const emptyForm = {
  title: '',
  subtitle: '',
  badge_text: 'Hitesh Coaching Classes',
  button_text: 'Explore Courses',
  button_link: '/app/classes',
  image_url: '',
  background_color: '',
  is_active: true,
  display_order: 0,
}

export default function Banners() {
  const { user } = useAuth()
  const [banners, setBanners] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')

  const token = localStorage.getItem('hm_token')

  async function loadBanners() {
    try {
      setLoading(true)
      setError('')

      const res = await fetch('/api/banners/admin', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load banners')
      }

      setBanners(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBanners()
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
    setError('')
  }

  function openEdit(banner) {
    setEditingId(banner.id)
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      badge_text: banner.badge_text || '',
      button_text: banner.button_text || '',
      button_link: banner.button_link || '',
      image_url: banner.image_url || '',
      background_color: banner.background_color || '',
      is_active: banner.is_active,
      display_order: banner.display_order || 0,
    })
    setShowForm(true)
    setError('')
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  function updateField(field, value) {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  async function saveBanner(e) {
    e.preventDefault()

    if (!form.title.trim()) {
      setError('Banner title is required')
      return
    }

    try {
      setSaving(true)
      setError('')

      const url = editingId
        ? `/api/banners/${editingId}`
        : '/api/banners'

      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          display_order: Number(form.display_order) || 0,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save banner')
      }

      await loadBanners()
      closeForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteBanner(id) {
    if (!window.confirm('Delete this banner?')) return

    try {
      setError('')

      const res = await fetch(`/api/banners/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete banner')
      }

      await loadBanners()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-slate-500">Loading banners...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Admin
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Banner Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage banners shown on the student dashboard.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-bold text-lg">
              {editingId ? 'Edit Banner' : 'Create Banner'}
            </h2>

            <button
              onClick={closeForm}
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={saveBanner} className="p-5 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Title
              </label>
              <input
                value={form.title}
                onChange={e => updateField('title', e.target.value)}
                placeholder="Learn Today. Build Tomorrow."
                className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Subtitle
              </label>
              <textarea
                value={form.subtitle}
                onChange={e => updateField('subtitle', e.target.value)}
                placeholder="Banner description..."
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Badge Text
                </label>
                <input
                  value={form.badge_text}
                  onChange={e => updateField('badge_text', e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Button Text
                </label>
                <input
                  value={form.button_text}
                  onChange={e => updateField('button_text', e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Button Link
                </label>
                <input
                  value={form.button_link}
                  onChange={e => updateField('button_link', e.target.value)}
                  placeholder="/app/classes"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={e => updateField('display_order', e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Banner Image
              </label>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100">
                  <ImageIcon className="w-5 h-5" />
                  Choose Banner Image
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0]
                      if (!file) return

                      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
                        setError('Only PNG, JPG, JPEG and WEBP images are allowed')
                        return
                      }

                      if (file.size > 5 * 1024 * 1024) {
                        setError('Image size must be 5 MB or less')
                        return
                      }

                      try {
                        setUploadingImage(true)
                        setError('')

                        const formData = new FormData()
                        formData.append('image', file)

                        const res = await fetch('/api/banners/upload', {
                          method: 'POST',
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                          body: formData,
                        })

                        const data = await res.json()

                        if (!res.ok) {
                          throw new Error(data.error || 'Failed to upload image')
                        }

                        updateField('image_url', data.image_url)
                      } catch (err) {
                        setError(err.message)
                      } finally {
                        setUploadingImage(false)
                      }

                      e.target.value = ''
                    }}
                  />
                </label>

                {uploadingImage && (
                  <p className="text-xs text-blue-600 font-semibold text-center mt-3">
                    Uploading image...
                  </p>
                )}

                {form.image_url && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <img
                      src={form.image_url}
                      alt="Banner preview"
                      className="w-full max-h-56 object-cover"
                    />
                  </div>
                )}

                <p className="text-xs text-slate-400 mt-2">
                  JPG, PNG, JPEG or WEBP • Maximum 5 MB
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Background Color
              </label>
              <input
                value={form.background_color}
                onChange={e => updateField('background_color', e.target.value)}
                placeholder="#0f172a"
                className="w-full h-11 px-4 rounded-xl border border-slate-200"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => updateField('is_active', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold text-slate-700">
                Show this banner to students
              </span>
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeForm}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-60"
              >
                {saving ? 'Saving...' : editingId ? 'Update Banner' : 'Create Banner'}
              </button>
            </div>
          </form>
        </div>
      )}

      {banners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <ImageIcon className="w-10 h-10 mx-auto text-slate-300" />
          <h2 className="font-bold text-slate-800 mt-3">No banners yet</h2>
          <p className="text-sm text-slate-500 mt-1">
            Create your first student dashboard banner.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {banners.map(banner => (
            <div
              key={banner.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                <div className="flex gap-4 min-w-0">
                  <div
                    className="w-28 h-20 shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
                    style={{
                      background: banner.background_color || '#0f172a',
                    }}
                  >
                    {banner.image_url ? (
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-white/60" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900">
                        {banner.title}
                      </h3>

                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          banner.is_active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {banner.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {banner.subtitle || 'No subtitle'}
                    </p>

                    <p className="text-xs text-slate-400 mt-2">
                      Order: {banner.display_order}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(banner)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>

                  <button
                    onClick={() => deleteBanner(banner.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
