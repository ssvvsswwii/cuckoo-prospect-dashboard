export type Role = 'admin' | 'branch_manager' | 'client_consultant'
export type UserStatus = 'pending' | 'active' | 'inactive'
export type ProspectStatus = 'new' | 'contacted' | 'in_progress' | 'converted' | 'lost'

export interface Branch {
  id: string
  name: string
  created_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  role: Role
  branch_id: string | null
  status: UserStatus
  created_at: string
  branch?: Branch
}

export interface Prospect {
  id: string
  created_at: string
  updated_at: string
  full_name: string
  ic: string
  date_of_birth: string | null
  mobile_number: string | null
  email: string | null
  installation_address: string | null
  postcode: string | null
  employer_name: string | null
  emergency_contact_name: string | null
  emergency_contact_number: string | null
  status: ProspectStatus
  assigned_to: string | null
  branch_id: string | null
  notes: string | null
  source: string | null
  profile?: Profile
  branch?: Branch
}
