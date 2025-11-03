import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/theme.css'
import '../styles/reels.css'
import axios from 'axios'

// Home will fetch published videos from backend. If the backend is not available,
// fallback to a small local sample list.
const localFallback = [
  {
    id: 1,
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://interactive-examples.mdn.mozilla.net/media/cc0-images/flower.jpg',
    desc: 'Fresh organic meals available at our downtown store. Order now for a special discount!',
    store: 'https://example.com/store/1'
  },
  {
    id: 2,
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://interactive-examples.mdn.mozilla.net/media/cc0-images/flower.jpg',
    desc: 'Daily specials from local food partners — limited time only.',
    store: 'https://example.com/store/2'
  }
]

const Home = () => {
  const containerRef = useRef(null)
  const [videos, setVideos] = useState([])
  const [activeComments, setActiveComments] = useState(null) // {videoId, comments}
  const [newComment, setNewComment] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    // make sure user is authenticated before showing videos
    axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, { withCredentials: true })
      .then(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/videos`, { withCredentials: true })
          .then(res => {
            if (!mounted) return
            const list = (res.data && res.data.videos) ? res.data.videos.map(v => ({
              id: v._id,
              src: v.url.startsWith('/') ? `${import.meta.env.VITE_API_URL}${v.url}` : v.url,
              poster: v.poster,
              desc: v.desc,
              store: v.store,
              likesCount: v.likesCount || 0,
              savesCount: v.savesCount || 0,
              isLiked: !!v.isLiked,
              isSaved: !!v.isSaved
            })) : localFallback
            setVideos(list.length ? list : localFallback)
          })
          .catch(() => setVideos(localFallback))
      })
      .catch(() => {
        // not authenticated -> redirect to login
        window.location.href = '/user/login'
      })

    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const vids = container.querySelectorAll('video')

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      })
    }, { threshold: 0.6 })

    vids.forEach(v => observer.observe(v))

    // start the first video muted and play
    if (vids[0]) {
      vids[0].muted = true
      vids[0].play().catch(() => {})
    }

    return () => observer.disconnect()
  }, [videos])

  const toggleLike = async (id) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/videos/${id}/like`, {}, { withCredentials: true })
      setVideos(prev => prev.map(v => v.id === id ? { ...v, isLiked: !v.isLiked, likesCount: res.data.likesCount } : v))
    } catch {
      // optionally show error
    }
  }

  const toggleSave = async (id) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/videos/${id}/save`, {}, { withCredentials: true })
      setVideos(prev => prev.map(v => v.id === id ? { ...v, isSaved: !v.isSaved, savesCount: res.data.savesCount } : v))
    } catch {
      // optionally show error
    }
  }

  const loadComments = async (videoId) => {
    try {
      if (activeComments?.videoId === videoId) {
        setActiveComments(null)
        return
      }
      const res = await axios.get(`http://localhost:3000/api/videos/${videoId}/comments`, { withCredentials: true })
      setActiveComments({ videoId, comments: res.data.comments })
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }

  const submitComment = async (videoId) => {
    if (!newComment.trim()) return
    try {
      const res = await axios.post(
        `http://localhost:3000/api/videos/${videoId}/comments`,
        { text: newComment },
        { withCredentials: true }
      )
      setActiveComments(prev => ({
        videoId,
        comments: [...(prev?.comments || []), res.data.comment]
      }))
      setNewComment('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

    return (
    <div className="reels-container" ref={containerRef}>
      <button 
        className="upload-fab"
        onClick={() => navigate('/upload')}
        aria-label="Upload new video"
      >
        <span>+</span>
      </button>
      {(videos.length ? videos : localFallback).map(item => (
        <section className="reel-item" key={item.id}>
          <video
            className="reel-video"
            src={item.src}
            poster={item.poster}
            playsInline
            muted
            loop
            preload="metadata"
            aria-label={item.desc}
          />

          <div className="reel-overlay">
            <div className="reel-left">
              <div className="reel-desc">{item.desc}</div>
              <a className="reel-cta" href={item.store} target="_blank" rel="noreferrer">Visit store</a>
            </div>
            <div className="reel-controls">
              <button
                className="reel-cta"
                onClick={() => toggleLike(item.id)}
                style={{ marginBottom: '0.5rem', display: 'block' }}
              >
                {item.isLiked ? '♥' : '♡'} {item.likesCount || 0}
              </button>
              <button
                className="reel-cta"
                onClick={() => toggleSave(item.id)}
                style={{ display: 'block' }}
              >
                {item.isSaved ? '💾' : '📁'} {item.savesCount || 0}
              </button>
              <button
                className="reel-cta"
                onClick={() => loadComments(item.id)}
                style={{ display: 'block', marginTop: '0.5rem' }}
              >
                💬 Comments
              </button>
            </div>
            {activeComments?.videoId === item.id && (
              <div className="reel-comments">
                <div className="comments-list">
                  {activeComments.comments.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <strong>{comment.user.name}</strong>
                      <p>{comment.text}</p>
                      <small>{new Date(comment.createdAt).toLocaleString()}</small>
                    </div>
                  ))}
                </div>
                <div className="comment-form">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                  />
                  <button onClick={() => submitComment(item.id)}>Post</button>
                </div>
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  )
}

export default Home
