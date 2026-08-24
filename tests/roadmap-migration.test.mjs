import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const migrationUrl = new URL('../supabase/migrations/20260824131824_automate_roadmap_publishing.sql', import.meta.url)
const sql = await readFile(migrationUrl, 'utf8')

function valuesBlock(tableName, nextStatement) {
  const pattern = new RegExp(`insert into ${tableName}[\\s\\S]*?values\\n([\\s\\S]*?);\\n\\n${nextStatement}`, 'i')
  const match = sql.match(pattern)
  assert.ok(match, `Could not find values for ${tableName}`)
  return match[1]
}

test('migration contains the complete canonical roadmap', () => {
  const dayBlock = valuesBlock('private\\.dsa_roadmap_days', 'insert into private\\.dsa_roadmap_items')
  const itemBlock = valuesBlock('private\\.dsa_roadmap_items', 'create table public\\.schedule_days')
  const dayRows = dayBlock.match(/^  \(/gm) ?? []
  const itemRows = itemBlock.match(/^  \(/gm) ?? []

  assert.equal(dayRows.length, 90)
  assert.equal(itemRows.length, 126)
  assert.equal((dayBlock.match(/, 'rest',/g) ?? []).length, 12)
  assert.equal((dayBlock.match(/, 'revision',/g) ?? []).length, 1)
  assert.match(dayBlock, /\(102, 89, 13, 'mock'/)
})

test('migration preserves the restart and key roadmap checkpoints', () => {
  assert.match(sql, /\(13, 1, 'Sum 1\.\.N using loops'/)
  assert.match(sql, /\(14, 1, 'Count digits'/)
  assert.match(sql, /\(14, 2, 'Reverse Integer'/)
  assert.match(sql, /\(18, 1, 'Fibonacci: iterative \+ memoized'/)
  assert.match(sql, /\(101, 1, 'Search a 2D Matrix'/)
  assert.match(sql, /\(101, 2, 'Decode Ways'/)
  assert.doesNotMatch(sql, /\(102, [12],/)
})

test('migration enforces publication and idempotent installation', () => {
  assert.match(sql, /publish_at <= now\(\)/)
  assert.match(sql, /problems\.publish_at <= now\(\)/)
  assert.match(sql, /on conflict \(schedule_day_id, display_order\)/)
  assert.match(sql, /at time zone 'Asia\/Kolkata'/)
  assert.match(sql, /revoke all on function private\.install_dsa_roadmap/)
})
