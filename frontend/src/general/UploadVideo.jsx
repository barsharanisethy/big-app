import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../styles/theme.css'

const UploadVideo = () => {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [desc, setDesc] = useState('')
  const [store, setStore] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile)
        // Create video preview URL
        const previewUrl = URL.createObjectURL(selectedFile)
        setPreview(previewUrl)
        setError('')
      } else {
        setError('Please select a video file')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a video file')
      return
    }

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('video', file)
    formData.append('desc', desc)
    formData.append('store', store)

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/videos/upload`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      // Redirect to home page after successful upload
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload video')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="upload-container">
      <h2>Upload New Video</h2>
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="video">Select Video</label>
          <input
            type="file"
            id="video"
            accept="video/*"
            onChange={handleFileChange}
            className="file-input"
          />
        </div>

        {preview && (
          <div className="video-preview">
            <video
              src={preview}
              controls
              style={{ maxWidth: '100%', maxHeight: '400px' }}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="desc">Description</label>
          <textarea
            id="desc"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Enter video description"
            className="text-input"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="store">Store Link (Optional)</label>
          <input
            type="url"
            id="store"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            placeholder="https://your-store-link.com"
            className="text-input"
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <button 
          type="submit" 
          className="upload-button"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  )
}

export default UploadVideo