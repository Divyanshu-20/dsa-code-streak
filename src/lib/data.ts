import type { Group, Member, Problem, Profile } from '../types'
import { requireSupabase } from './supabase'

function profileFromRelation(value: unknown): Profile {
  const profile = Array.isArray(value) ? value[0] : value
  if (!profile || typeof profile !== 'object') {
    throw new Error('A member profile could not be loaded.')
  }
  return profile as Profile
}

export async function loadGroup(groupId: string) {
  const { data, error } = await requireSupabase()
    .from('groups')
    .select('id,name,owner_id,invite_code,created_at')
    .eq('id', groupId)
    .single()

  if (error) throw error
  return data as Group
}

export async function loadMembers(groupId: string) {
  const { data, error } = await requireSupabase()
    .from('group_members')
    .select('group_id,user_id,joined_at,profile:profiles(id,display_name,avatar_url)')
    .eq('group_id', groupId)
    .order('joined_at')

  if (error) throw error
  return (data ?? []).map((row) => ({
    group_id: row.group_id,
    user_id: row.user_id,
    joined_at: row.joined_at,
    profile: profileFromRelation(row.profile),
  })) as Member[]
}

export async function loadProblems(groupId: string, date: string) {
  const { data, error } = await requireSupabase()
    .from('problems')
    .select('*')
    .eq('group_id', groupId)
    .eq('problem_date', date)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as Problem[]
}
