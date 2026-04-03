export type Patient = {
  id: string
  full_name: string
  date_of_birth: string | null
  phone: string | null
  address: string | null
  notes: string | null
  created_at: string
}

export type Appointment = {
  id: string
  patient_id: string
  type: 'home' | 'clinic'
  scheduled_at: string
  duration_minutes: number
  status: 'scheduled' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
  patients?: Patient // Joined relation
}

export type WoundRecord = {
  id: string
  appointment_id: string
  patient_id: string
  location: string
  tissue_type: string | null
  exudate: string | null
  pain_level: number | null
  treatment_applied: string | null
  notes: string | null
  recorded_at: string
}

export type WoundImage = {
  id: string
  wound_record_id: string
  storage_path: string
  caption: string | null
  captured_at: string
}
