"use client"

import { useState, useEffect } from "react"

interface AvatarProps {
  race: "chinese" | "indian" | "malay"
  isTalking: boolean
  className?: string
}

export function Avatar({ race, isTalking, className = "" }: AvatarProps) {
  const [mouthOpen, setMouthOpen] = useState(false)
  const [selectedRace, setSelectedRace] = useState(race)

  // Animate mouth when talking
  useEffect(() => {
    if (isTalking) {
      const interval = setInterval(() => {
        setMouthOpen((prev) => !prev)
      }, 150) // Changed from 200 to 150 for faster mouth movement
      return () => clearInterval(interval)
    } else {
      setMouthOpen(false)
    }
  }, [isTalking])

  // Define features for each race with more distinct Singaporean characteristics
  const features = {
    chinese: {
      skinColor: "#F5D5AE",
      hairColor: "#1C1C1C",
      eyeShape: "almond", // More almond-shaped eyes
      noseShape: "M30,29 L30,34 M29,32 L31,32",
      hairStyle: "M12,16 Q30,6 48,16 Q44,10 30,8 Q16,10 12,16", // Neat, professional cut
      eyebrowStyle: "straight",
      faceShape: "oval",
    },
    indian: {
      skinColor: "#8B4513",
      hairColor: "#0F0F0F",
      eyeShape: "large", // Larger, more expressive eyes
      noseShape: "M30,27 L30,36 M27,31 L33,31 M28,34 L32,34", // More prominent nose
      hairStyle: "M10,18 Q30,4 50,18 Q46,8 30,6 Q14,8 10,18", // Thicker, wavy hair
      eyebrowStyle: "thick",
      faceShape: "round",
    },
    malay: {
      skinColor: "#D2B48C",
      hairColor: "#2C1810",
      eyeShape: "medium", // Medium-sized eyes
      noseShape: "M30,28 L30,35 M28,32 L32,32", // Broader nose
      hairStyle: "M11,17 Q30,5 49,17 Q45,9 30,7 Q15,9 11,17", // Styled hair
      eyebrowStyle: "arched",
      faceShape: "square",
    },
  }

  const currentFeatures = features[race]

  return (
    <div className={`${className}`}>
      <svg
        width="320"
        height="320"
        viewBox="0 0 60 60"
        className="w-full h-full"
        style={{
          filter: isTalking ? "drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))" : "none",
          transition: "all 0.2s ease-in-out",
        }}
      >
        {/* Background circle */}
        <circle cx="30" cy="30" r="28" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />

        {/* Hair */}
        <path
          d={currentFeatures.hairStyle}
          fill={currentFeatures.hairColor}
          stroke={currentFeatures.hairColor}
          strokeWidth="1"
        />

        {/* Face */}
        {currentFeatures.faceShape === "oval" ? (
          <ellipse cx="30" cy="32" rx="17" ry="21" fill={currentFeatures.skinColor} />
        ) : currentFeatures.faceShape === "round" ? (
          <ellipse cx="30" cy="32" rx="19" ry="19" fill={currentFeatures.skinColor} />
        ) : (
          <ellipse cx="30" cy="32" rx="18.5" ry="20" fill={currentFeatures.skinColor} />
        )}

        {/* Eyes - make them more distinct */}
        <g>
          {/* Left eye */}
          {currentFeatures.eyeShape === "almond" ? (
            <>
              <ellipse cx="22" cy="25" rx="3.5" ry="1.8" fill="white" />
              <ellipse cx="22" cy="25" rx="1.8" ry="1.8" fill="#2C1810" />
              <circle cx="22.3" cy="24.7" r="0.4" fill="white" />
            </>
          ) : currentFeatures.eyeShape === "large" ? (
            <>
              <ellipse cx="22" cy="25" rx="4" ry="2.5" fill="white" />
              <circle cx="22" cy="25" r="2" fill="#2C1810" />
              <circle cx="22.5" cy="24.5" r="0.6" fill="white" />
            </>
          ) : (
            <>
              <ellipse cx="22" cy="25" rx="3.2" ry="2.2" fill="white" />
              <circle cx="22" cy="25" r="1.6" fill="#2C1810" />
              <circle cx="22.4" cy="24.6" r="0.5" fill="white" />
            </>
          )}

          {/* Right eye */}
          {currentFeatures.eyeShape === "almond" ? (
            <>
              <ellipse cx="38" cy="25" rx="3.5" ry="1.8" fill="white" />
              <ellipse cx="38" cy="25" rx="1.8" ry="1.8" fill="#2C1810" />
              <circle cx="37.7" cy="24.7" r="0.4" fill="white" />
            </>
          ) : currentFeatures.eyeShape === "large" ? (
            <>
              <ellipse cx="38" cy="25" rx="4" ry="2.5" fill="white" />
              <circle cx="38" cy="25" r="2" fill="#2C1810" />
              <circle cx="37.5" cy="24.5" r="0.6" fill="white" />
            </>
          ) : (
            <>
              <ellipse cx="38" cy="25" rx="3.2" ry="2.2" fill="white" />
              <circle cx="38" cy="25" r="1.6" fill="#2C1810" />
              <circle cx="37.6" cy="24.6" r="0.5" fill="white" />
            </>
          )}

          {/* Eyebrows - different styles */}
          {currentFeatures.eyebrowStyle === "straight" ? (
            <>
              <path d="M19,21.5 L25,21.5" stroke={currentFeatures.hairColor} strokeWidth="2" />
              <path d="M35,21.5 L41,21.5" stroke={currentFeatures.hairColor} strokeWidth="2" />
            </>
          ) : currentFeatures.eyebrowStyle === "thick" ? (
            <>
              <path d="M18,21 Q22,19 26,21" stroke={currentFeatures.hairColor} strokeWidth="2.5" />
              <path d="M34,21 Q38,19 42,21" stroke={currentFeatures.hairColor} strokeWidth="2.5" />
            </>
          ) : (
            <>
              <path d="M19,22 Q22,19.5 25,21" stroke={currentFeatures.hairColor} strokeWidth="1.8" />
              <path d="M35,21 Q38,19.5 41,22" stroke={currentFeatures.hairColor} strokeWidth="1.8" />
            </>
          )}
        </g>

        {/* Nose */}
        <g stroke={currentFeatures.skinColor} strokeWidth="1" fill="none" opacity="0.6">
          <path d={currentFeatures.noseShape} />
        </g>

        {/* Mouth */}
        <g>
          {isTalking && mouthOpen ? (
            /* Open mouth when talking - make it more oval and animated */
            <>
              <ellipse cx="30" cy="38" rx="4" ry="3" fill="#8B0000" />
              <ellipse cx="30" cy="37" rx="3" ry="1" fill="#FF6B6B" opacity="0.6" />
            </>
          ) : isTalking ? (
            /* Slightly open mouth when talking but closed phase */
            <ellipse cx="30" cy="38" rx="3" ry="1.5" fill="#8B0000" />
          ) : (
            /* Closed mouth when not talking */
            <path d="M27,38 Q30,40 33,38" stroke="#8B0000" strokeWidth="2" fill="none" />
          )}
        </g>

        {/* Cheeks (slight blush) */}
        <circle cx="18" cy="32" r="2" fill="#FF69B4" opacity="0.2" />
        <circle cx="42" cy="32" r="2" fill="#FF69B4" opacity="0.2" />

        {/* Neck */}
        <rect x="25" y="48" width="10" height="8" fill={currentFeatures.skinColor} />

        {/* Shirt collar */}
        <path d="M20,55 L25,50 L35,50 L40,55 L40,60 L20,60 Z" fill="#4A90E2" />
        <path d="M25,50 L30,55 L35,50" stroke="#2563EB" strokeWidth="1" fill="none" />

        {/* Add some cultural accessories */}
        {selectedRace === "indian" && (
          <circle cx="30" cy="20" r="1" fill="#FFD700" opacity="0.8" /> // Small bindi
        )}

        {selectedRace === "malay" && (
          <path d="M25,18 Q30,16 35,18" stroke="#8B4513" strokeWidth="0.5" fill="none" opacity="0.6" /> // Subtle forehead line
        )}
      </svg>
    </div>
  )
}
