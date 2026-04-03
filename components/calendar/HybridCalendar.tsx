"use client"
import React, { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { ptBR } from 'date-fns/locale'
import 'react-day-picker/dist/style.css'

type CalendarEvent = {
  id: string
  date: Date
  type: 'home' | 'clinic'
  patientName: string
}

export default function HybridCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Mock events for the UI
  const events: CalendarEvent[] = [
    { id: '1', date: new Date(), type: 'clinic', patientName: 'Maria Silva' },
    { id: '2', date: new Date(), type: 'home', patientName: 'João Oliveira' },
    { id: '3', date: new Date(new Date().setDate(new Date().getDate() + 2)), type: 'home', patientName: 'Carlos Santos' },
  ]

  const customModifiers = {
    hasClinicEvent: events.filter(e => e.type === 'clinic').map(e => e.date),
    hasHomeEvent: events.filter(e => e.type === 'home').map(e => e.date)
  }

  const customModifiersClassNames = {
    hasClinicEvent: 'relative font-medium text-[#A58079] after:content-[""] after:w-1 after:h-1 after:bg-[#A58079] after:rounded-full after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2',
    hasHomeEvent: 'relative font-medium text-[#6B5C59] after:content-[""] after:w-1 after:h-1 after:bg-[#6B5C59] after:rounded-full after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2',
  }

  return (
    <div className="bg-transparent">
      <style>{`
        .rdp-root {
          --rdp-accent-color: #A58079;
          --rdp-accent-background-color: #fdf5f3; 
          margin: 0;
          width: 100%;
        }
        .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
          background-color: #A58079;
          border-radius: 9999px;
          color: white !important;
          font-weight: 500;
          box-shadow: 0 4px 10px rgba(165, 128, 121, 0.3);
        }
        .rdp-day_button:hover:not([disabled]):not(.rdp-day_selected) {
          background-color: #FDFBFA;
          color: #A58079;
          border-radius: 9999px;
        }
        .rdp-caption_label {
          font-weight: 500;
          font-size: 1rem;
          color: #2D2422;
          text-transform: capitalize;
        }
        .rdp-head_cell {
          font-weight: 400;
          font-size: 0.75rem;
          color: #A58079;
          text-transform: uppercase;
        }
      `}</style>
      
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        locale={ptBR}
        modifiers={customModifiers}
        modifiersClassNames={customModifiersClassNames}
        className="mx-auto"
      />
      
      <div className="mt-6 flex gap-6 pt-4 border-t border-[#A58079]/10 justify-center">
        <div className="flex items-center gap-2 text-xs text-[#6B5C59]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#A58079]"></div>
          <span>Em Clínica</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6B5C59]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#6B5C59]"></div>
          <span>Domiciliar</span>
        </div>
      </div>
    </div>
  )
}
