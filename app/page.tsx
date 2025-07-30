"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, StopCircle, Loader2, MessageSquareText, Headphones, Volume2 } from "lucide-react"
import { Avatar } from "@/components/avatar"

type Race = "chinese" | "indian" | "malay"
type Language = "en-SG" | "zh-CN" | "ms-MY" | "hi-IN"

export default function SingaporeAvatar() {
  const [selectedRace, setSelectedRace] = useState<Race>("chinese")
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en-SG")

  const [isRecording, setIsRecording] = useState(false)
  const [isTalking, setIsTalking] = useState(false) // Avatar talking animation (only when avatar speaks)
  const [isLoading, setIsLoading] = useState(false) // For backend transcription/TTS
  const [isTranscribing, setIsTranscribing] = useState(false)

  const [transcribedText, setTranscribedText] = useState<string>("")
  const [avatarReplyText, setAvatarReplyText] = useState<string>("")
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null) // User's recorded audio URL
  const [avatarReplyAudioUrl, setAvatarReplyAudioUrl] = useState<string | null>(null) // Avatar's reply audio URL

  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const userAudioStream = useRef<MediaStream | null>(null) // To store the user's microphone stream
  const avatarAudioRef = useRef<HTMLAudioElement>(null) // Ref for avatar's reply audio
  const recognitionRef = useRef<any>(null) // Web Speech API instance

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

  const languageOptions: { [key in Language]: string } = {
    "en-SG": "English (Singapore)",
    "zh-CN": "Chinese (Mandarin)",
    "ms-MY": "Malay",
    "hi-IN": "Hindi",
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
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [recordedAudioUrl, avatarReplyAudioUrl])

  // Web Speech API recognition start
  const startWebSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Your browser does not support the Web Speech API.")
      return
    }

    setTranscribedText("")
    setAvatarReplyText("")
    setRecordedAudioUrl(null)
    setAvatarReplyAudioUrl(null)
    setIsLoading(true)
    setIsTalking(false)

    const recognition = new SpeechRecognition()
    recognition.lang = selectedLanguage
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsTranscribing(true)
      setIsRecording(true)
    }

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      setTranscribedText(text)
      callGeminiAPI(text)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error)
      setIsTranscribing(false)
      setIsLoading(false)
      setIsRecording(false)
      alert("Speech recognition error: " + event.error)
    }

    recognition.onend = () => {
      setIsTranscribing(false)
      setIsRecording(false)
      // Note: If you want continuous listening, you could restart here
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopWebSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
    setIsTranscribing(false)
  }

  // Call Gemini endpoint with prompt and handle response
  const callGeminiAPI = async (prompt: string) => {
    setIsLoading(true)
    setIsTalking(false)
    setAvatarReplyText("")
    setAvatarReplyAudioUrl(null)

    try {
      const res = await fetch("https://kevansoon-tts-endpoint.hf.space/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()

      if (data.response) {
        const replyText = data.response.trim()
        setAvatarReplyText(replyText)

        // Speak the text with Web Speech API TTS
        speakText(replyText)
      } else {
        setAvatarReplyText("No response from Gemini.")
      }
    } catch (err) {
      console.error("Error calling Gemini:", err)
      setAvatarReplyText("Error calling Gemini API.")
    } finally {
      setIsLoading(false)
    }
  }

  // Text-to-Speech with Web Speech API
  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Your browser does not support speech synthesis.")
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)

    // Optionally set voice based on selectedLanguage:
    // This tries to pick a voice matching language
    const voices = window.speechSynthesis.getVoices()
    const voice = voices.find((v) => v.lang.toLowerCase().startsWith(selectedLanguage.split("-")[0]))
    if (voice) utterance.voice = voice

    utterance.onstart = () => setIsTalking(true)
    utterance.onend = () => setIsTalking(false)
    utterance.onerror = () => setIsTalking(false)

    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Singapore Avatar Speaker</h1>
          <p className="text-gray-600">Speak in English, Chinese, Malay or Hindi, get transcription and avatar reply!</p>
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

            {/* Language Selection */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🌐 Select Language (for speech recognition)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(languageOptions).map(([lang, label]) => (
                    <Button
                      key={lang}
                      variant={selectedLanguage === lang ? "default" : "outline"}
                      onClick={() => setSelectedLanguage(lang as Language)}
                      className="h-12 justify-center"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Voice Recognition Controls */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Speak Now
                </h3>
                <div className="space-y-4">
                  {!isRecording ? (
                    <Button onClick={startWebSpeechRecognition} disabled={isLoading || isTalking} className="w-full h-12">
                      <Mic className="w-4 h-4 mr-2" />
                      Start Speaking
                    </Button>
                  ) : (
                    <Button onClick={stopWebSpeechRecognition} variant="destructive" className="w-full h-12">
                      <StopCircle className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  )}
                </div>
                {isTranscribing && (
                  <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Listening...
                  </div>
                )}
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
                  {transcribedText ? (
                    <p className="not-italic text-gray-800">{transcribedText}</p>
                  ) : (
                    <p>Your transcribed text will appear here.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Avatar's Reply Text Display */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🗣️ Avatar's Reply (Text)
                </h3>
                <div className="min-h-[60px] p-4 bg-gray-100 rounded-md text-gray-800">
                  {avatarReplyText || "The avatar's reply will appear here after speaking."}
                </div>
              </CardContent>
            </Card>

            {/* Avatar's Reply Audio */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Avatar's Reply Audio
                </h3>
                <div className="min-h-[60px] flex items-center justify-center">
                  {avatarReplyAudioUrl ? (
                    <audio
                      ref={avatarAudioRef}
                      controls
                      src={avatarReplyAudioUrl}
                      className="w-full"
                      onPlay={() => setIsTalking(true)}
                      onPause={() => setIsTalking(false)}
                      onEnded={() => setIsTalking(false)}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 italic">If backend returns audio, it will play here.</p>
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
                      ? "Listening..."
                      : isLoading
                      ? "Processing..."
                      : isTalking
                      ? "Speaking..."
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
