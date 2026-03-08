'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Clock,
  Save,
  FileAudio,
  MoreHorizontal,
  Download,
  Volume2,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react'

interface VoiceNote {
  id: string
  title: string
  duration: number
  createdAt: string
  transcript?: string
  tags: string[]
  isProcessing?: boolean
}

interface VoiceNotesProps {
  onSaveNote?: (note: { title: string; transcript: string; duration: number }) => void
}

export function VoiceNotes({ onSaveNote }: VoiceNotesProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordings, setRecordings] = useState<VoiceNote[]>([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedNote, setSelectedNote] = useState<VoiceNote | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        const newRecording: VoiceNote = {
          id: Date.now().toString(),
          title: `Recording ${recordings.length + 1}`,
          duration: recordingTime,
          createdAt: new Date().toISOString(),
          transcript: 'Transcript processing...',
          tags: [],
          isProcessing: true
        }
        
        setRecordings(prev => [newRecording, ...prev])
        
        // Simulate transcript processing
        setTimeout(() => {
          setRecordings(prev => prev.map(r => 
            r.id === newRecording.id 
              ? { ...r, isProcessing: false, transcript: generateMockTranscript() }
              : r
          ))
        }, 2000)
        
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      setIsPaused(false)
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
      setIsPaused(!isPaused)
    }
  }

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id))
    if (selectedNote?.id === id) {
      setSelectedNote(null)
    }
  }

  const playRecording = (id: string) => {
    if (currentlyPlaying === id) {
      audioRef.current?.pause()
      setCurrentlyPlaying(null)
    } else {
      setCurrentlyPlaying(id)
      // In real implementation, would play actual audio
    }
  }

  const generateMockTranscript = () => {
    const transcripts = [
      "Just finished my coffee chat with Sarah from Goldman. She mentioned they're ramping up hiring for the tech group. Key takeaway: focus on showing deal experience in my resume.",
      "Post-interview thoughts: Technical questions were tough but fair. Need to review DCF modeling more thoroughly. The culture fit portion went really well though.",
      "Reminder to follow up with John at Evercore next week. He offered to make a warm intro to the recruiting team.",
      "Superday prep notes: Practice the walk-me-through-your-resume story. Emphasize the leadership experience from my internship.",
      "Network event at Morgan Stanley - collected 5 new contacts. Remember to send personalized LinkedIn requests within 24 hours.",
    ]
    return transcripts[Math.floor(Math.random() * transcripts.length)]
  }

  const saveToNotes = (recording: VoiceNote) => {
    onSaveNote?.({
      title: recording.title,
      transcript: recording.transcript || '',
      duration: recording.duration
    })
  }

  return (
    <div className="space-y-6">
      {/* Recording Interface */}
      <div className="glass-card p-8">
        <div className="flex flex-col items-center">
          {/* Recording Button */}
          <div className="relative mb-6">
            <motion.button
              onClick={isRecording ? stopRecording : startRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:shadow-xl hover:shadow-blue-500/25'
              }`}
            >
              {isRecording ? (
                <Square className="w-10 h-10 text-white" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
              
              {/* Recording rings */}
              {isRecording && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-red-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-red-400"
                    animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </>
              )}
            </motion.button>
          </div>

          {/* Timer */}
          <div className="text-center mb-4">
            <div className={`text-5xl font-mono font-bold ${isRecording ? 'text-red-400' : 'text-white'}`}>
              {formatTime(recordingTime)}
            </div>
            <p className="text-slate-400 mt-2">
              {isRecording 
                ? isPaused ? 'Recording paused' : 'Recording in progress...'
                : 'Tap to start recording'
              }
            </p>
          </div>

          {/* Controls */}
          {isRecording && (
            <div className="flex items-center gap-4">
              <button
                onClick={pauseRecording}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                {isPaused ? <Play className="w-5 h-5 text-slate-300" /> : <Pause className="w-5 h-5 text-slate-300" />}
              </button>
              <button
                onClick={stopRecording}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
              >
                Stop Recording
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recordings List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileAudio className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">Your Recordings</h3>
            <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">
              {recordings.length}
            </span>
          </div>
          {recordings.length > 0 && (
            <button
              onClick={() => setRecordings([])}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {recordings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400">No recordings yet</p>
            <p className="text-sm text-slate-500 mt-1">Tap the microphone to start</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {recordings.map((recording) => (
              <motion.div
                key={recording.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 hover:bg-slate-800/30 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  {/* Play Button */}
                  <button
                    onClick={() => playRecording(recording.id)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      currentlyPlaying === recording.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {currentlyPlaying === recording.id ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white">{recording.title}</h4>
                      {recording.isProcessing && (
                        <span className="text-xs text-amber-400 flex items-center gap-1">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full"
                          />
                          Processing...
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(recording.duration)}
                      </span>
                      <span>•</span>
                      <span>{new Date(recording.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Transcript Preview */}
                    {recording.transcript && !recording.isProcessing && (
                      <p className="text-sm text-slate-400 line-clamp-2">
                        {recording.transcript}
                      </p>
                    )}

                    {/* Progress bar for playing */}
                    {currentlyPlaying === recording.id && (
                      <div className="mt-3">
                        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-blue-500"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: recording.duration }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(recording.duration)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => saveToNotes(recording)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Save to Notes"
                    >
                      <Save className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => setSelectedNote(recording)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => deleteRecording(recording.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="glass-card p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-white mb-1">Pro Tips for Voice Notes</h4>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• Record immediately after meetings while details are fresh</li>
              <li>• Mention names, dates, and key action items clearly</li>
              <li>• Tag recordings with firm names for easy searching</li>
              <li>• Review and transcribe to written notes weekly</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setSelectedNote(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <FileAudio className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{selectedNote.title}</h3>
                    <p className="text-sm text-slate-400">
                      {formatTime(selectedNote.duration)} • {new Date(selectedNote.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Audio Player */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => playRecording(selectedNote.id)}
                      className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-colors"
                    >
                      {currentlyPlaying === selectedNote.id ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full w-0 bg-blue-500" />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>0:00</span>
                        <span>{formatTime(selectedNote.duration)}</span>
                      </div>
                    </div>
                    <Volume2 className="w-5 h-5 text-slate-400" />
                  </div>
                </div>

                {/* Transcript */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Transcript
                  </h4>
                  {selectedNote.isProcessing ? (
                    <div className="flex items-center gap-2 text-amber-400">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full"
                      />
                      <span className="text-sm">Processing transcript...</span>
                    </div>
                  ) : (
                    <textarea
                      value={selectedNote.transcript}
                      onChange={(e) => {
                        setRecordings(prev => prev.map(r => 
                          r.id === selectedNote.id ? { ...r, transcript: e.target.value } : r
                        ))
                        setSelectedNote({ ...selectedNote, transcript: e.target.value })
                      }}
                      className="w-full h-40 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  )}
                </div>

                {/* Tags */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.tags.length === 0 ? (
                      <span className="text-sm text-slate-500">No tags</span>
                    ) : (
                      selectedNote.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-full">
                          {tag}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => deleteRecording(selectedNote.id)}
                  className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const blob = new Blob([], { type: 'audio/wav' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${selectedNote.title}.wav`
                      a.click()
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => {
                      saveToNotes(selectedNote)
                      setSelectedNote(null)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save to Notes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VoiceNotes
