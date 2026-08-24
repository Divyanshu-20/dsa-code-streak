import type { Group, Member, Problem, Profile, ScheduleDay } from '../types'
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

function scheduleDayFromRow(row: Record<string, unknown>): ScheduleDay {
  return {
    id: row.id as string,
    groupId: row.group_id as string,
    dayNumber: row.day_number as number,
    date: row.schedule_date as string,
    weekNumber: row.week_number as number,
    cadence: row.cadence as string,
    kind: row.kind as ScheduleDay['kind'],
    topic: row.topic as string,
    difficultySummary: row.difficulty_summary as string,
    milestone: row.milestone as string,
    instructions: row.instructions as string,
    publishAt: row.publish_at as string,
  }
}

export async function loadDailySchedule(groupId: string, date: string) {
  const [dayResult, problemResult] = await Promise.all([
    requireSupabase()
      .from('schedule_days')
      .select('*')
      .eq('group_id', groupId)
      .eq('schedule_date', date)
      .maybeSingle(),
    requireSupabase()
      .from('problems')
      .select('*')
      .eq('group_id', groupId)
      .eq('problem_date', date)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true }),
  ])

  if (dayResult.error) throw dayResult.error
  if (problemResult.error) throw problemResult.error

  return {
    day: dayResult.data ? scheduleDayFromRow(dayResult.data as Record<string, unknown>) : null,
    problems: (problemResult.data ?? []) as Problem[],
  }
}
