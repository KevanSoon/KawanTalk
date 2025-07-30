"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, StopCircle, Loader2, MessageSquareText, Headphones, Volume2 } from "lucide-react"
import { Avatar } from "@/components/avatar"

type Race = "chinese" | "indian" | "malay"

export default function SingaporeAvatar() {
  const [selectedRace, setSelectedRace] = useState<Race>("chinese")
  const [isRecording, setIsRecording] = useState(false)
  const [isTalking, setIsTalking] = useState(false) // Avatar talking animation (only when avatar speaks)
  const [isLoading, setIsLoading] = useState(false) // For backend transcription/TTS
  const [transcribedText, setTranscribedText] = useState<string>("")
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null) // User's recorded audio URL
  const [avatarReplyAudioUrl, setAvatarReplyAudioUrl] = useState<string | null>(null) // Avatar's reply audio URL

  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const userAudioStream = useRef<MediaStream | null>(null) // To store the user's microphone stream
  const avatarAudioRef = useRef<HTMLAudioElement>(null) // Ref for avatar's reply audio

  const raceOptions = {
    chinese: {
      label: "Chinese",
      description: "East Asian features with warm skin tone",
    },
    indian: {
      label: "Indian",
      description: "South Asian features with rich skin tone",
    },
    malay: {
      label: "Malay",
      description: "Southeast Asian features with golden skin tone",
    },
  }

  // Cleanup recorded audio URLs and streams when component unmounts or new recording starts
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl)
      }
      if (avatarReplyAudioUrl) {
        URL.revokeObjectURL(avatarReplyAudioUrl)
      }
      if (userAudioStream.current) {
        userAudioStream.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [recordedAudioUrl, avatarReplyAudioUrl])

  const startRecording = async () => {
    setTranscribedText("") // Clear previous text
    setRecordedAudioUrl(null) // Clear previous user recording
    setAvatarReplyAudioUrl(null) // Clear previous avatar reply
    setIsLoading(false) // Reset loading state
    setIsTalking(false) // Ensure avatar is not talking

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      userAudioStream.current = stream // Store stream for cleanup
      const recorder = new MediaRecorder(stream)

      recorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" })
        const url = URL.createObjectURL(audioBlob)
        setRecordedAudioUrl(url) // Set URL for user's playback
        sendAudioToBackend(audioBlob)
        audioChunks.current = [] // Clear chunks for next recording
        stream.getTracks().forEach((track) => track.stop()) // Stop microphone access
      }

      recorder.start()
      mediaRecorder.current = recorder
      setIsRecording(true)
    } catch (err) {
      console.error("Error accessing microphone:", err)
      setIsRecording(false)
      alert("Could not access microphone. Please ensure it's connected and permissions are granted.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop()
    }
    setIsRecording(false)
  }

  const sendAudioToBackend = async (audioBlob: Blob) => {
    setIsLoading(true) // Start loading for backend processing
    setIsTalking(false) // Avatar is not talking during processing

    const formData = new FormData()
    formData.append("audio", audioBlob, "recording.webm")

    try {
      // Replace with your actual FastAPI backend endpoint
      // This endpoint should now return both transcribed text AND avatar's reply audio
      const response = await fetch("http://localhost:8000/transcribe_and_reply", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setTranscribedText(data.transcribed_text || "No transcription received.")

      // Assuming backend returns a base64 encoded audio string or a direct audio URL
      if (data.reply_audio_base64) {
        const audioBlob = base64ToBlob(data.reply_audio_base64, "audio/mpeg") // Assuming mp3 for reply
        const url = URL.createObjectURL(audioBlob)
        setAvatarReplyAudioUrl(url)
      } else if (data.reply_audio_url) {
        setAvatarReplyAudioUrl(data.reply_audio_url)
      }
    } catch (error) {
      console.error("Error sending audio to backend:", error)
      setTranscribedText("Error transcribing audio.")
      setAvatarReplyAudioUrl(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper to convert base64 to Blob (if backend sends base64 audio)
  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
  }

  // Play avatar's reply audio automatically once loaded
  useEffect(() => {
    if (avatarReplyAudioUrl && avatarAudioRef.current) {
      avatarAudioRef.current.load() // Load the new audio source
      avatarAudioRef.current.play().catch((e) => console.error("Error playing avatar audio:", e))
    }
  }, [avatarReplyAudioUrl])

  // Handle avatar audio playback events
  const handleAvatarAudioPlay = () => {
    setIsTalking(true)
  }

  const handleAvatarAudioPause = () => {
    setIsTalking(false)
  }

  const handleAvatarAudioEnded = () => {
    setIsTalking(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Singapore Avatar Speaker</h1>
          <p className="text-gray-600">Record your voice, get transcription, and hear the avatar's reply!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Avatar Display */}
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className="relative bg-gradient-to-b from-blue-100 to-blue-50 rounded-2xl aspect-square flex items-center justify-center">
                <div className="relative">
                  <Avatar race={selectedRace} isTalking={isTalking} className="w-80 h-80 transition-all duration-200" />
                </div>
              </div>

              {/* Avatar Info */}
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800">{raceOptions[selectedRace].label} Avatar</h3>
                <p className="text-sm text-gray-600">{raceOptions[selectedRace].description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="space-y-6">
            {/* Race Selection */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🇸🇬</span>
                  Select Race
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(raceOptions).map(([race, config]) => (
                    <Button
                      key={race}
                      variant={selectedRace === race ? "default" : "outline"}
                      onClick={() => setSelectedRace(race as Race)}
                      className="h-12 justify-start"
                    >
                      <div className="text-left">
                        <div className="font-medium">{config.label}</div>
                        <div className="text-xs opacity-70">{config.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Voice Recording Controls */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Your Voice Recording
                </h3>
                <div className="space-y-4">
                  {!isRecording ? (
                    <Button onClick={startRecording} disabled={isLoading || isTalking} className="w-full h-12">
                      <Mic className="w-4 h-4 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button onClick={stopRecording} variant="destructive" className="w-full h-12">
                      <StopCircle className="w-4 h-4 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recorded Audio Playback (User's) */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Headphones className="w-5 h-5" />
                  Your Recorded Audio
                </h3>
                <div className="min-h-[60px] flex items-center justify-center">
                  {recordedAudioUrl ? (
                    <audio controls src={recordedAudioUrl} className="w-full" />
                  ) : (
                    <p className="text-sm text-gray-600 italic">Record something to play it back.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transcribed Text Display */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MessageSquareText className="w-5 h-5" />
                  Your Transcribed Text
                </h3>
                <div className="min-h-[80px] bg-gray-50 p-4 rounded-md border border-gray-200 flex items-center justify-center text-center text-gray-700 italic">
                  {isLoading && !isTalking ? ( // Only show transcribing if avatar isn't talking yet
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Transcribing & Generating Reply...
                    </div>
                  ) : transcribedText ? (
                    <p className="not-italic text-gray-800">{transcribedText}</p>
                  ) : (
                    <p>Your transcribed text will appear here.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Avatar's Reply Audio */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Avatar's Reply
                </h3>
                <div className="min-h-[60px] flex items-center justify-center">
                  {avatarReplyAudioUrl ? (
                    <audio
                      ref={avatarAudioRef}
                      controls
                      src={avatarReplyAudioUrl}
                      className="w-full"
                      onPlay={handleAvatarAudioPlay}
                      onPause={handleAvatarAudioPause}
                      onEnded={handleAvatarAudioEnded}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 italic">Avatar's reply will play here.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isRecording || isLoading || isTalking
                        ? "bg-green-100 text-green-800 shadow-lg"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full transition-all ${
                        isRecording || isLoading || isTalking ? "bg-green-500 animate-pulse" : "bg-gray-400"
                      }`}
                    ></div>
                    {isRecording
                      ? "Recording..."
                      : isLoading
                        ? "Processing..."
                        : isTalking
                          ? "Avatar Speaking..."
                          : "Ready"}
                  </div>

                  {isTalking && <div className="mt-2 text-xs text-gray-500">🎤 Avatar is animated and speaking</div>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
