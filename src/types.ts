export type Difficulty = 'Basic' | 'Easy' | 'Medium' | 'Hard'

export type ScheduleDayKind = 'problem' | 'rest' | 'revision' | 'mock'

export interface ScheduleDay {
  id: string
  groupId: string
  dayNumber: number
  date: string
  weekNumber: number
  cadence: string
  kind: ScheduleDayKind
  topic: string
  difficultySummary: string
  milestone: string
  instructions: string
  publishAt: string
}

export interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
}

export interface Group {
  id: string
  name: string
  owner_id: string
  invite_code: string
  created_at: string
}

export interface Member {
  group_id: string
  user_id: string
  joined_at: string
  profile: Profile
}

export interface Problem {
  id: string
  group_id: string
  title: string
  url: string | null
  platform: string
  difficulty: Difficulty
  problem_date: string
  note: string | null
  prompt: string | null
  source: 'manual' | 'roadmap'
  schedule_day_id: string | null
  display_order: number
  publish_at: string
  created_by: string
  created_at: string
  updated_at: string
}

export type CheckInStatus = 'attempted' | 'needs_help' | 'solved'

export interface ProblemCheckIn {
  id: string
  problem_id: string
  user_id: string
  status: CheckInStatus
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  problem_id: string
  user_id: string
  message: string | null
  image_path: string | null
  image_url?: string | null
  code_body: string | null
  code_language: string | null
  created_at: string
  profile: Profile
}
