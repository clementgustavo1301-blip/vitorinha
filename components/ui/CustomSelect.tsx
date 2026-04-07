"use client"

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  value: string
  label: string
  description?: string
}

interface CustomSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
  disabled?: boolean
  rounded?: string
}

export default function CustomSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Selecione...", 
  label,
  className = "",
  disabled = false,
  rounded = "rounded-2xl"
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (val: string) => {
    onChange(val)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${isOpen ? 'z-50' : 'z-0'} ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs md:text-sm font-bold text-[#2D2422] mb-2 px-1 uppercase tracking-widest">
          {label}
        </label>
      )}
      
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between
          w-full neumorph-input cursor-pointer transition-all duration-300
          ${rounded}
          ${disabled ? 'opacity-50 cursor-not-allowed !pointer-events-none' : 'hover:border-[#A58079]/40'}
          ${isOpen ? 'border-[#A58079] ring-4 ring-[#A58079]/5' : ''}
        `}
      >
        <span className={`truncate font-bold ${!selectedOption ? 'text-[#6B5C59]/50' : 'text-[#2D2422]'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#A58079] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 neumorph-dropdown animate-select-open overflow-hidden">
          <div className="max-h-60 overflow-y-auto no-scrollbar py-2">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  flex items-center justify-between px-5 py-3.5 cursor-pointer transition-all
                  ${value === option.value 
                    ? 'bg-[#A58079]/10 text-[#A58079] font-bold' 
                    : 'text-[#6B5C59] hover:bg-[#F9F7F6] hover:text-[#2D2422]'}
                `}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{option.label}</span>
                  {option.description && <span className="text-[10px] opacity-70 mt-0.5">{option.description}</span>}
                </div>
                {value === option.value && <Check className="w-4 h-4" />}
              </div>
            ))}
            
            {options.length === 0 && (
              <div className="px-5 py-4 text-center text-xs text-[#6B5C59] italic">
                Nenhuma opção disponível.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
