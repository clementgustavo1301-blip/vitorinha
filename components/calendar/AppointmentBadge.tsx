"use client"
import React from 'react'

interface BadgeProps {
  type: 'home' | 'clinic'
  label?: string
}

export default function AppointmentBadge({ type, label }: BadgeProps) {
  const isClinic = type === 'clinic'
  
  return (
    <span 
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
        isClinic 
          ? 'bg-[#A58079]/10 text-[#A58079] border-[#A58079]/20' 
          : 'bg-[#2D2422]/10 text-[#2D2422] border-[#2D2422]/20'
      }`}
    >
      {label || (isClinic ? 'Clínica' : 'Domiciliar')}
    </span>
  )
}
