import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  formatCheckInCounts,
  memberDayProgress,
  summarizeCheckIns,
} from '../src/lib/checkIns.ts'

const checkIns = [
  { id: '1', problem_id: 'p1', user_id: 'u1', status: 'solved', created_at: '', updated_at: '' },
  { id: '2', problem_id: 'p1', user_id: 'u2', status: 'attempted', created_at: '', updated_at: '' },
  { id: '3', problem_id: 'p1', user_id: 'u3', status: 'needs_help', created_at: '', updated_at: '' },
]

test('daily check-in summary includes every mutually exclusive state', () => {
  const counts = summarizeCheckIns(checkIns, 4)

  assert.deepEqual(counts, {
    solved: 1,
    attempted: 1,
    needsHelp: 1,
    notStarted: 1,
    checkedIn: 3,
    total: 4,
  })
  assert.equal(formatCheckInCounts(counts), '1 solved · 1 attempted · 1 need help · 1 not started')
})

test('seven-day progress treats effort as partial and only all solved as done', () => {
  assert.equal(memberDayProgress(['p1'], checkIns, 'u1').state, 'done')
  assert.equal(memberDayProgress(['p1'], checkIns, 'u2').state, 'partial')
  assert.equal(memberDayProgress(['p1'], checkIns, 'u3').state, 'partial')
  assert.equal(memberDayProgress(['p1'], checkIns, 'u4').state, 'missed')
  assert.equal(memberDayProgress([], checkIns, 'u1').state, 'empty')
})

test('migration preserves solved records and secures status updates', async () => {
  const migrationUrl = new URL('../supabase/migrations/20260824142422_add_problem_check_in_statuses.sql', import.meta.url)
  const sql = await readFile(migrationUrl, 'utf8')

  assert.match(sql, /alter table public\.completions rename to problem_check_ins/i)
  assert.match(sql, /update public\.problem_check_ins set status = 'solved'/i)
  assert.match(sql, /status in \('attempted', 'needs_help', 'solved'\)/i)
  assert.match(sql, /for update[\s\S]*using \([\s\S]*auth\.uid\(\)[\s\S]*with check \(/i)
  assert.match(sql, /grant update \(status\) on table public\.problem_check_ins to authenticated/i)
  assert.match(sql, /revoke all on table public\.problem_check_ins from anon, authenticated/i)
})
