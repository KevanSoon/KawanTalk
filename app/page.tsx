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
  const [isTalking, setIsTalking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [transcribedText, setTranscribedText] = useState<string>("")
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null)
  const [avatarReplyAudioUrl, setAvatarReplyAudioUrl] = useState<string | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const userAudioStream = useRef<MediaStream | null>(null)
  const avatarAudioRef = useRef<HTMLAudioElement>(null)
  const recognitionRef = useRef<any>(null)

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

  useEffect(() => {
    return () => {
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl)
      if (avatarReplyAudioUrl) URL.revokeObjectURL(avatarReplyAudioUrl)
      if (userAudioStream.current) userAudioStream.current.getTracks().forEach(track => track.stop())
    }
  }, [recordedAudioUrl, avatarReplyAudioUrl])

  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
  }

  const startWebSpeechRecognition = () => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SpeechRecognition) {
    alert("Your browser does not support Web Speech API.")
    return
  }

  const recognition = new SpeechRecognition()
  recognition.lang = "en-SG"
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.onstart = () => setIsTranscribing(true)

  recognition.onresult = (event: any) => {
    const text = event.results[0][0].transcript
    setTranscribedText(text)

    fetch("https://kevansoon-tts-endpoint.hf.space/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.response) {
          setTranscribedText(data.response) // show backend response text

          // Speak the response using browser TTS
          if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(data.response)
            utterance.lang = "en-US"
            utterance.onstart = () => setIsTalking(true)
            utterance.onend = () => setIsTalking(false)
            window.speechSynthesis.speak(utterance)
          }
        } else {
          setTranscribedText("No response received from backend.")
        }
      })
      .catch((err) => {
        console.error("Gemini error:", err)
        setTranscribedText("Error getting response.")
      })
  }

  recognition.onerror = () => setIsTranscribing(false)
  recognition.onend = () => setIsTranscribing(false)

  recognitionRef.current = recognition
  recognition.start()
}

  const stopWebSpeechRecognition = () => {
    recognitionRef.current?.stop()
    setIsTranscribing(false)
  }

  const handleAvatarAudioPlay = () => setIsTalking(true)
  const handleAvatarAudioPause = () => setIsTalking(false)
  const handleAvatarAudioEnded = () => setIsTalking(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Singapore Avatar Speaker</h1>
          <p className="text-gray-600">Transcribe your speech and hear a Gemini AI reply!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className="relative bg-gradient-to-b from-blue-100 to-blue-50 rounded-2xl aspect-square flex items-center justify-center">
                <Avatar race={selectedRace} isTalking={isTalking} className="w-80 h-80 transition-all duration-200" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800">{raceOptions[selectedRace].label} Avatar</h3>
                <p className="text-sm text-gray-600">{raceOptions[selectedRace].description}</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🇸🇬</span> Select Race
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

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Mic className="w-5 h-5" /> Web Speech Recognition
                </h3>
                <div className="space-y-4">
                  {!isTranscribing ? (
                    <Button onClick={startWebSpeechRecognition} className="w-full h-12">
                      <Mic className="w-4 h-4 mr-2" /> Start Live Transcription
                    </Button>
                  ) : (
                    <Button onClick={stopWebSpeechRecognition} variant="destructive" className="w-full h-12">
                      <StopCircle className="w-4 h-4 mr-2" /> Stop Transcription
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MessageSquareText className="w-5 h-5" /> Transcribed Text
                </h3>
                <div className="min-h-[80px] bg-gray-50 p-4 rounded-md border border-gray-200 flex items-center justify-center text-center text-gray-700 italic">
                  {isTranscribing ? (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader2 className="w-5 h-5 animate-spin" /> Listening...
                    </div>
                  ) : transcribedText ? (
                    <p className="not-italic text-gray-800">{transcribedText}</p>
                  ) : (
                    <p>Your transcribed text will appear here.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Volume2 className="w-5 h-5" /> Avatar's Reply
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
          </div>
        </div>
      </div>
    </div>
  )
}
