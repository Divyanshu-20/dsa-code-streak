export type Difficulty = 'Easy' | 'Medium' | 'Hard'

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
  url: string
  platform: string
  difficulty: Difficulty
  problem_date: string
  note: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Completion {
  id: string
  problem_id: string
  user_id: string
  completed_at: string
}

export interface Comment {
  id: string
  problem_id: string
  user_id: string
  message: string
  created_at: string
  profile: Profile
}
