import assert from 'node:assert/strict'
import test from 'node:test'
import {
  communityDateKey,
  lastSevenDates,
  millisecondsUntilNextCommunityMidnight,
} from '../src/lib/date.ts'

test('community day rolls over at exactly midnight in Asia/Kolkata', () => {
  const justBeforeMidnight = new Date('2026-08-24T18:29:59.999Z')
  const atMidnight = new Date('2026-08-24T18:30:00.000Z')

  assert.equal(communityDateKey(justBeforeMidnight), '2026-08-24')
  assert.equal(communityDateKey(atMidnight), '2026-08-25')
  assert.equal(millisecondsUntilNextCommunityMidnight(justBeforeMidnight), 1)
  assert.equal(millisecondsUntilNextCommunityMidnight(atMidnight), 86_400_000)
})

test('seven-day progress uses community dates across month boundaries', () => {
  assert.deepEqual(lastSevenDates('2026-09-02'), [
    '2026-08-27',
    '2026-08-28',
    '2026-08-29',
    '2026-08-30',
    '2026-08-31',
    '2026-09-01',
    '2026-09-02',
  ])
})
