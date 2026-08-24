begin;

create table if not exists private.dsa_roadmap_days (
  day_number integer primary key check (day_number between 13 and 102),
  day_offset integer not null unique check (day_offset between 0 and 89),
  week_number integer not null check (week_number between 1 and 13),
  kind text not null check (kind in ('problem', 'rest', 'revision', 'mock')),
  topic text not null,
  difficulty_summary text not null,
  milestone text not null,
  instructions text not null
);

create table if not exists private.dsa_roadmap_items (
  day_number integer not null references private.dsa_roadmap_days(day_number) on delete cascade,
  display_order smallint not null check (display_order > 0),
  title text not null,
  platform text not null,
  difficulty text not null check (difficulty in ('Basic', 'Easy', 'Medium', 'Hard')),
  url text check (url is null or url ~* '^https?://'),
  prompt text check (prompt is null or char_length(trim(prompt)) between 1 and 4000),
  primary key (day_number, display_order)
);

revoke all on private.dsa_roadmap_days from public, anon, authenticated;
revoke all on private.dsa_roadmap_items from public, anon, authenticated;

truncate private.dsa_roadmap_items, private.dsa_roadmap_days;

insert into private.dsa_roadmap_days
  (day_number, day_offset, week_number, kind, topic, difficulty_summary, milestone, instructions)
values
  (13, 0, 1, 'problem', 'Loops + conditions', 'Basic', 'Write clean input/output and trace one example', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (14, 1, 1, 'problem', 'Digit operations', 'Basic + Med', 'Use %, / and handle overflow', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (15, 2, 1, 'problem', 'Digit decomposition', 'Easy x2', 'Recognize rebuild-and-compare', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (16, 3, 1, 'problem', 'Math', 'Easy', 'Explain Euclid''s invariant', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (17, 4, 1, 'problem', 'Math + sieve', 'Easy + Med', 'Move from O(n) checks to sqrt(n)/sieve', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (18, 5, 1, 'problem', 'Recursion basics', 'Basic', 'Checkpoint: base case, stack, complexity', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (19, 6, 1, 'rest', 'Recovery', '-', 'No backlog penalty; join the next day', 'REST / onboarding catch-up'),
  (20, 7, 2, 'problem', 'Elementary sorting', 'Easy x2', 'State loop invariant and O(n^2)', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (21, 8, 2, 'problem', 'Sorting', 'Easy + Med', 'Compare in-place vs auxiliary memory', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (22, 9, 2, 'problem', 'Divide and conquer', 'Med', 'Partition correctly; discuss worst case', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (23, 10, 2, 'problem', 'Array scan', 'Easy', 'One pass, constant space', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (24, 11, 2, 'problem', 'Array invariants', 'Easy', 'Practice index ownership', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (25, 12, 2, 'problem', 'Reversal + two pointers', 'Med + Easy', 'Checkpoint: in-place array transformations', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (26, 13, 2, 'rest', 'Recovery', '-', 'Re-solve without notes only if rested', 'REST / re-solve one sorting problem'),
  (27, 14, 3, 'problem', 'Array + set/two pointers', 'Easy x2', 'Choose structure from constraints', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (28, 15, 3, 'problem', 'Hashing', 'Easy x2', 'Map/set lookup pattern', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (29, 16, 3, 'problem', 'Partition + voting', 'Med + Easy', 'Dutch flag and Boyer-Moore', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (30, 17, 3, 'problem', 'Running optimum', 'Med + Easy', 'Connect both to best-so-far state', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (31, 18, 3, 'problem', 'Prefix sum + hash map', 'Med', 'Know what the prefix map stores', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (32, 19, 3, 'problem', 'Set + prefix/suffix', 'Med x2', 'Checkpoint: O(n), no sorting/division', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (33, 20, 3, 'rest', 'Recovery', '-', 'Post one insight, not just code', 'REST / catch-up'),
  (34, 21, 4, 'problem', 'Matrix in-place', 'Med x2', 'Use markers and layer traversal', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (35, 22, 4, 'problem', 'Intervals', 'Med', 'Sort/merge boundary conditions', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (36, 23, 4, 'problem', 'String frequency', 'Easy + Med', 'Canonical key design', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (37, 24, 4, 'problem', 'String two pointers', 'Easy', 'Normalize, scan, compare', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (38, 25, 4, 'problem', 'String scanning', 'Easy', 'Use a shrinking prefix invariant', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (39, 26, 4, 'revision', 'Milestone 1', 'Re-solve', '20 min each; explain before coding', 'REVISION: timed re-solve Two Sum + Maximum Subarray'),
  (40, 27, 4, 'rest', 'Recovery', '-', 'Four-week baseline complete', 'REST'),
  (41, 28, 5, 'problem', 'Binary search basics', 'Easy', 'Closed vs half-open interval', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (42, 29, 5, 'problem', 'Boundary search', 'Med + Easy', 'Write one reusable boundary template', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (43, 30, 5, 'problem', 'Rotated search', 'Med x2', 'Identify the sorted half', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (44, 31, 5, 'problem', 'Binary-search invariants', 'Med', 'Use index parity', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (45, 32, 5, 'problem', 'Search on answer', 'Med', 'Define monotonic feasibility', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (46, 33, 5, 'problem', 'Search on answer', 'Med x2', 'Checkpoint: answer-space binary search', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (47, 34, 5, 'rest', 'Recovery', '-', 'Record invariant and off-by-one traps', 'REST / formula sheet update'),
  (48, 35, 6, 'problem', 'Pointer basics', 'Easy x2', 'Draw pointer movement first', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (49, 36, 6, 'problem', 'Fast/slow pointers', 'Easy + Med', 'Detection vs entry proof', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (50, 37, 6, 'problem', 'Merge + reversal', 'Easy x2', 'Dummy node and restore discussion', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (51, 38, 6, 'problem', 'Gap pointers', 'Med + Easy', 'Sentinel and equal-distance idea', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (52, 39, 6, 'problem', 'List construction', 'Med', 'Carry and stable relinking', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (53, 40, 6, 'problem', 'Divide/merge + cloning', 'Med x2', 'Checkpoint: pointer-safe transformations', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (54, 41, 6, 'rest', 'Recovery', '-', 'Re-draw one hard pointer problem', 'REST'),
  (55, 42, 7, 'problem', 'Stack state', 'Easy + Med', 'Store only what future operations need', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (56, 43, 7, 'problem', 'Data-structure design', 'Easy', 'Amortized analysis', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (57, 44, 7, 'problem', 'Monotonic stack', 'Med', 'What stays on the stack?', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (58, 45, 7, 'problem', 'Monotonic stack', 'Hard', 'Boundary widths and sentinel', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (59, 46, 7, 'problem', 'Stack simulation', 'Med', 'Translate process into state', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (60, 47, 7, 'problem', 'Monotonic deque', 'Hard', 'Checkpoint: discard dominated candidates', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (61, 48, 7, 'rest', 'Recovery', '-', 'Aim for a five-minute pattern recall', 'REST / re-solve Daily Temperatures'),
  (62, 49, 8, 'problem', 'Opposite-end pointers', 'Med', 'Prove which pointer can move', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (63, 50, 8, 'problem', 'Sort + pointers', 'Med + Hard', 'Duplicate control and boundary maxima', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (64, 51, 8, 'problem', 'Variable window', 'Med x2', 'Define valid-window condition', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (65, 52, 8, 'problem', 'Variable window', 'Med', 'At-most-K template', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (66, 53, 8, 'problem', 'Shrinkable window', 'Med', 'Why positivity matters', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (67, 54, 8, 'problem', 'Frequency window', 'Hard', 'Checkpoint: formed/required counts', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (68, 55, 8, 'rest', 'Recovery', '-', 'Window patterns complete', 'REST'),
  (69, 56, 9, 'problem', 'Recursion + decisions', 'Med x2', 'Shrink input / choose-skip tree', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (70, 57, 9, 'problem', 'Backtracking', 'Med x2', 'Choose, explore, undo', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (71, 58, 9, 'problem', 'Constrained backtracking', 'Med x2', 'Prune invalid branches early', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (72, 59, 9, 'problem', 'Grid backtracking', 'Med', 'Visited state and safe restoration', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (73, 60, 9, 'problem', 'Bit fundamentals', 'Easy x2', 'XOR cancellation and n&(n-1)', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (74, 61, 9, 'problem', 'Bit patterns', 'Easy', 'Checkpoint: reuse smaller states', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (75, 62, 9, 'rest', 'Recovery', '-', 'Explain one recursion tree on paper', 'REST / mock explanation'),
  (76, 63, 10, 'problem', 'DFS + BFS', 'Easy + Med', 'Recursive, iterative, queue', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (77, 64, 10, 'problem', 'Postorder state', 'Easy x2', 'Return height and failure together', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (78, 65, 10, 'problem', 'Tree recursion', 'Easy x2', 'Local answer vs returned answer', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (79, 66, 10, 'problem', 'Tree search/view', 'Med x2', 'Subtree evidence and level boundary', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (80, 67, 10, 'problem', 'BST', 'Med x2', 'Range invariant and inorder order', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (81, 68, 10, 'problem', 'Tree construction + DP', 'Med + Hard', 'Checkpoint: subtree contracts', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (82, 69, 10, 'rest', 'Recovery', '-', 'Trees milestone complete', 'REST'),
  (83, 70, 11, 'problem', 'Heap / buckets', 'Med x2', 'Choose heap size and key', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (84, 71, 11, 'problem', 'Heap design', 'Hard x2', 'K-way merge and two-heap balance', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (85, 72, 11, 'problem', 'Greedy', 'Med x2', 'Derive greedy state, do not guess', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (86, 73, 11, 'problem', 'Greedy', 'Med x2', 'Reset proof and earliest finish', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (87, 74, 11, 'problem', 'Graph traversal', 'Easy x2', 'Adjacency list + visited', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (88, 75, 11, 'problem', 'Grid DFS/BFS', 'Med x2', 'Checkpoint: components vs multi-source BFS', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (89, 76, 11, 'rest', 'Recovery', '-', 'Prepare for graph/DP finish', 'REST'),
  (90, 77, 12, 'problem', 'Grid BFS', 'Med', 'Multi-source BFS', 'Complete today''s 1 roadmap problem. Share your approach, tests, and time/space complexity.'),
  (91, 78, 12, 'problem', 'Cycle detection', 'Med x2', 'Parent tracking vs directed states', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (92, 79, 12, 'problem', 'Topo + components', 'Med x2', 'Order and connectivity', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (93, 80, 12, 'problem', 'Graph modeling', 'Med + Hard', 'Map old-to-new; BFS shortest steps', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (94, 81, 12, 'problem', 'Dijkstra + MST', 'Med x2', 'Weighted shortest path vs spanning tree', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (95, 82, 12, 'problem', '1D DP', 'Easy + Med', 'Checkpoint: state, transition, base cases', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (96, 83, 12, 'rest', 'Recovery', '-', 'Graph core complete', 'REST'),
  (97, 84, 13, 'problem', 'Knapsack DP', 'Med x2', 'Unbounded vs 0/1 choices', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (98, 85, 13, 'problem', 'Grid DP', 'Med x2', 'Count vs optimize', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (99, 86, 13, 'problem', 'Sequence DP', 'Med x2', '2D match/skip and 1D subsequence state', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (100, 87, 13, 'problem', 'DP + trie', 'Med x2', 'Prefix decisions and trie operations', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (101, 88, 13, 'mock', 'Mixed interview', 'Med x2', '60 min pair mock; communicate tradeoffs', 'Complete today''s 2 roadmap problems. Share your approach, tests, and time/space complexity.'),
  (102, 89, 13, 'mock', 'Final assessment', 'Re-solve', '75 min; score reasoning, code, tests, complexity', 'MOCK 2: re-solve one random array + one tree/graph problem');

insert into private.dsa_roadmap_items
  (day_number, display_order, title, platform, difficulty, url, prompt)
values
  (13, 1, 'Sum 1..N using loops', 'Community Drill', 'Basic', null, 'Given a positive integer n, compute the sum of every integer from 1 through n using a loop. Show one traced example and state the time and space complexity.'),
  (14, 1, 'Count digits', 'Community Drill', 'Basic', null, 'Given an integer n, return the number of decimal digits. Handle zero and negative values without converting the number to a string.'),
  (14, 2, 'Reverse Integer', 'LeetCode 7', 'Medium', 'https://leetcode.com/problems/reverse-integer/', null),
  (15, 1, 'Palindrome Number', 'LeetCode 9', 'Easy', 'https://leetcode.com/problems/palindrome-number/', null),
  (15, 2, 'Armstrong Number', 'takeUforward', 'Easy', null, 'Given an integer n, determine whether it equals the sum of each digit raised to the number of digits. Explain the digit extraction loop.'),
  (16, 1, 'GCD (Euclid)', 'takeUforward', 'Easy', null, 'Given two non-negative integers, return their greatest common divisor using Euclid''s algorithm and explain why replacing (a, b) with (b, a % b) preserves the answer.'),
  (17, 1, 'Print all divisors', 'takeUforward', 'Easy', null, 'Given a positive integer n, return all divisors in ascending order. Use the square-root pairing observation and avoid duplicate output for perfect squares.'),
  (17, 2, 'Count Primes (Sieve)', 'LeetCode 204', 'Medium', 'https://leetcode.com/problems/count-primes/', null),
  (18, 1, 'Fibonacci: iterative + memoized', 'Community Drill', 'Basic', null, 'Return the nth Fibonacci number in two ways: an iterative O(n) solution and a top-down memoized solution. State base cases and compare stack and auxiliary space.'),
  (20, 1, 'Selection Sort', 'takeUforward', 'Easy', null, 'Sort an integer array in ascending order using selection sort. State the invariant for the sorted prefix and analyze swaps and comparisons.'),
  (20, 2, 'Bubble Sort', 'takeUforward', 'Easy', null, 'Sort an integer array using bubble sort. Stop early when a pass makes no swaps and state the best and worst time complexity.'),
  (21, 1, 'Insertion Sort', 'takeUforward', 'Easy', null, 'Sort an integer array using insertion sort. Explain the sorted-prefix invariant and how elements shift to make room for the current value.'),
  (21, 2, 'Sort an Array (Merge Sort)', 'LeetCode 912', 'Medium', 'https://leetcode.com/problems/sort-an-array/', null),
  (22, 1, 'Quick Sort', 'takeUforward', 'Medium', null, 'Implement quick sort with an explicit partition routine. Explain the partition invariant and the average and worst-case complexity.'),
  (23, 1, 'Second Largest without sorting', 'takeUforward', 'Easy', null, 'Return the second-largest distinct value in an integer array using one pass and constant extra space. Define behavior when no second distinct value exists.'),
  (24, 1, 'Remove Duplicates from Sorted Array', 'LeetCode 26', 'Easy', 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/', null),
  (25, 1, 'Rotate Array', 'LeetCode 189', 'Medium', 'https://leetcode.com/problems/rotate-array/', null),
  (25, 2, 'Move Zeroes', 'LeetCode 283', 'Easy', 'https://leetcode.com/problems/move-zeroes/', null),
  (27, 1, 'Missing Number', 'LeetCode 268', 'Easy', 'https://leetcode.com/problems/missing-number/', null),
  (27, 2, 'Union of Two Sorted Arrays', 'takeUforward', 'Easy', null, 'Given two sorted arrays, return their sorted union without duplicates. Use two pointers and handle remaining suffixes.'),
  (28, 1, 'Two Sum', 'LeetCode 1', 'Easy', 'https://leetcode.com/problems/two-sum/', null),
  (28, 2, 'Contains Duplicate', 'LeetCode 217', 'Easy', 'https://leetcode.com/problems/contains-duplicate/', null),
  (29, 1, 'Sort Colors', 'LeetCode 75', 'Medium', 'https://leetcode.com/problems/sort-colors/', null),
  (29, 2, 'Majority Element', 'LeetCode 169', 'Easy', 'https://leetcode.com/problems/majority-element/', null),
  (30, 1, 'Maximum Subarray', 'LeetCode 53', 'Medium', 'https://leetcode.com/problems/maximum-subarray/', null),
  (30, 2, 'Best Time to Buy and Sell Stock', 'LeetCode 121', 'Easy', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', null),
  (31, 1, 'Subarray Sum Equals K', 'LeetCode 560', 'Medium', 'https://leetcode.com/problems/subarray-sum-equals-k/', null),
  (32, 1, 'Longest Consecutive Sequence', 'LeetCode 128', 'Medium', 'https://leetcode.com/problems/longest-consecutive-sequence/', null),
  (32, 2, 'Product of Array Except Self', 'LeetCode 238', 'Medium', 'https://leetcode.com/problems/product-of-array-except-self/', null),
  (34, 1, 'Set Matrix Zeroes', 'LeetCode 73', 'Medium', 'https://leetcode.com/problems/set-matrix-zeroes/', null),
  (34, 2, 'Rotate Image', 'LeetCode 48', 'Medium', 'https://leetcode.com/problems/rotate-image/', null),
  (35, 1, 'Merge Intervals', 'LeetCode 56', 'Medium', 'https://leetcode.com/problems/merge-intervals/', null),
  (36, 1, 'Valid Anagram', 'LeetCode 242', 'Easy', 'https://leetcode.com/problems/valid-anagram/', null),
  (36, 2, 'Group Anagrams', 'LeetCode 49', 'Medium', 'https://leetcode.com/problems/group-anagrams/', null),
  (37, 1, 'Valid Palindrome', 'LeetCode 125', 'Easy', 'https://leetcode.com/problems/valid-palindrome/', null),
  (38, 1, 'Longest Common Prefix', 'LeetCode 14', 'Easy', 'https://leetcode.com/problems/longest-common-prefix/', null),
  (41, 1, 'Binary Search', 'LeetCode 704', 'Easy', 'https://leetcode.com/problems/binary-search/', null),
  (42, 1, 'First and Last Position', 'LeetCode 34', 'Medium', 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/', null),
  (42, 2, 'Lower Bound / Upper Bound', 'takeUforward', 'Easy', null, 'Implement lower_bound (first index with value >= target) and upper_bound (first index with value > target) using binary search.'),
  (43, 1, 'Search in Rotated Sorted Array', 'LeetCode 33', 'Medium', 'https://leetcode.com/problems/search-in-rotated-sorted-array/', null),
  (43, 2, 'Find Minimum in Rotated Sorted Array', 'LeetCode 153', 'Medium', 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', null),
  (44, 1, 'Single Element in Sorted Array', 'LeetCode 540', 'Medium', 'https://leetcode.com/problems/single-element-in-a-sorted-array/', null),
  (45, 1, 'Koko Eating Bananas', 'LeetCode 875', 'Medium', 'https://leetcode.com/problems/koko-eating-bananas/', null),
  (46, 1, 'Capacity to Ship Packages', 'LeetCode 1011', 'Medium', 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/', null),
  (46, 2, 'Aggressive Cows', 'takeUforward', 'Medium', null, 'Place k cows in sorted stall positions so that the minimum distance between any pair is maximized. Use binary search on the answer with a greedy feasibility check.'),
  (48, 1, 'Reverse Linked List', 'LeetCode 206', 'Easy', 'https://leetcode.com/problems/reverse-linked-list/', null),
  (48, 2, 'Middle of the Linked List', 'LeetCode 876', 'Easy', 'https://leetcode.com/problems/middle-of-the-linked-list/', null),
  (49, 1, 'Linked List Cycle', 'LeetCode 141', 'Easy', 'https://leetcode.com/problems/linked-list-cycle/', null),
  (49, 2, 'Linked List Cycle II', 'LeetCode 142', 'Medium', 'https://leetcode.com/problems/linked-list-cycle-ii/', null),
  (50, 1, 'Merge Two Sorted Lists', 'LeetCode 21', 'Easy', 'https://leetcode.com/problems/merge-two-sorted-lists/', null),
  (50, 2, 'Palindrome Linked List', 'LeetCode 234', 'Easy', 'https://leetcode.com/problems/palindrome-linked-list/', null),
  (51, 1, 'Remove Nth Node From End', 'LeetCode 19', 'Medium', 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', null),
  (51, 2, 'Intersection of Two Linked Lists', 'LeetCode 160', 'Easy', 'https://leetcode.com/problems/intersection-of-two-linked-lists/', null),
  (52, 1, 'Add Two Numbers', 'LeetCode 2', 'Medium', 'https://leetcode.com/problems/add-two-numbers/', null),
  (53, 1, 'Sort List', 'LeetCode 148', 'Medium', 'https://leetcode.com/problems/sort-list/', null),
  (53, 2, 'Copy List with Random Pointer', 'LeetCode 138', 'Medium', 'https://leetcode.com/problems/copy-list-with-random-pointer/', null),
  (55, 1, 'Valid Parentheses', 'LeetCode 20', 'Easy', 'https://leetcode.com/problems/valid-parentheses/', null),
  (55, 2, 'Min Stack', 'LeetCode 155', 'Medium', 'https://leetcode.com/problems/min-stack/', null),
  (56, 1, 'Queue using Stacks', 'LeetCode 232', 'Easy', 'https://leetcode.com/problems/implement-queue-using-stacks/', null),
  (57, 1, 'Daily Temperatures', 'LeetCode 739', 'Medium', 'https://leetcode.com/problems/daily-temperatures/', null),
  (58, 1, 'Largest Rectangle in Histogram', 'LeetCode 84', 'Hard', 'https://leetcode.com/problems/largest-rectangle-in-histogram/', null),
  (59, 1, 'Evaluate Reverse Polish Notation', 'LeetCode 150', 'Medium', 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', null),
  (60, 1, 'Sliding Window Maximum', 'LeetCode 239', 'Hard', 'https://leetcode.com/problems/sliding-window-maximum/', null),
  (62, 1, 'Container With Most Water', 'LeetCode 11', 'Medium', 'https://leetcode.com/problems/container-with-most-water/', null),
  (63, 1, '3Sum', 'LeetCode 15', 'Medium', 'https://leetcode.com/problems/3sum/', null),
  (63, 2, 'Trapping Rain Water', 'LeetCode 42', 'Hard', 'https://leetcode.com/problems/trapping-rain-water/', null),
  (64, 1, 'Longest Substring Without Repeating Characters', 'LeetCode 3', 'Medium', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', null),
  (64, 2, 'Longest Repeating Character Replacement', 'LeetCode 424', 'Medium', 'https://leetcode.com/problems/longest-repeating-character-replacement/', null),
  (65, 1, 'Max Consecutive Ones III', 'LeetCode 1004', 'Medium', 'https://leetcode.com/problems/max-consecutive-ones-iii/', null),
  (66, 1, 'Minimum Size Subarray Sum', 'LeetCode 209', 'Medium', 'https://leetcode.com/problems/minimum-size-subarray-sum/', null),
  (67, 1, 'Minimum Window Substring', 'LeetCode 76', 'Hard', 'https://leetcode.com/problems/minimum-window-substring/', null),
  (69, 1, 'Pow(x, n)', 'LeetCode 50', 'Medium', 'https://leetcode.com/problems/powx-n/', null),
  (69, 2, 'Subsets', 'LeetCode 78', 'Medium', 'https://leetcode.com/problems/subsets/', null),
  (70, 1, 'Combination Sum', 'LeetCode 39', 'Medium', 'https://leetcode.com/problems/combination-sum/', null),
  (70, 2, 'Permutations', 'LeetCode 46', 'Medium', 'https://leetcode.com/problems/permutations/', null),
  (71, 1, 'Palindrome Partitioning', 'LeetCode 131', 'Medium', 'https://leetcode.com/problems/palindrome-partitioning/', null),
  (71, 2, 'Generate Parentheses', 'LeetCode 22', 'Medium', 'https://leetcode.com/problems/generate-parentheses/', null),
  (72, 1, 'Word Search', 'LeetCode 79', 'Medium', 'https://leetcode.com/problems/word-search/', null),
  (73, 1, 'Single Number', 'LeetCode 136', 'Easy', 'https://leetcode.com/problems/single-number/', null),
  (73, 2, 'Number of 1 Bits', 'LeetCode 191', 'Easy', 'https://leetcode.com/problems/number-of-1-bits/', null),
  (74, 1, 'Counting Bits', 'LeetCode 338', 'Easy', 'https://leetcode.com/problems/counting-bits/', null),
  (76, 1, 'Binary Tree Inorder Traversal', 'LeetCode 94', 'Easy', 'https://leetcode.com/problems/binary-tree-inorder-traversal/', null),
  (76, 2, 'Binary Tree Level Order Traversal', 'LeetCode 102', 'Medium', 'https://leetcode.com/problems/binary-tree-level-order-traversal/', null),
  (77, 1, 'Maximum Depth', 'LeetCode 104', 'Easy', 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', null),
  (77, 2, 'Balanced Binary Tree', 'LeetCode 110', 'Easy', 'https://leetcode.com/problems/balanced-binary-tree/', null),
  (78, 1, 'Diameter of Binary Tree', 'LeetCode 543', 'Easy', 'https://leetcode.com/problems/diameter-of-binary-tree/', null),
  (78, 2, 'Invert Binary Tree', 'LeetCode 226', 'Easy', 'https://leetcode.com/problems/invert-binary-tree/', null),
  (79, 1, 'LCA of Binary Tree', 'LeetCode 236', 'Medium', 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', null),
  (79, 2, 'Right Side View', 'LeetCode 199', 'Medium', 'https://leetcode.com/problems/binary-tree-right-side-view/', null),
  (80, 1, 'Validate BST', 'LeetCode 98', 'Medium', 'https://leetcode.com/problems/validate-binary-search-tree/', null),
  (80, 2, 'Kth Smallest in BST', 'LeetCode 230', 'Medium', 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', null),
  (81, 1, 'Build Tree from Preorder + Inorder', 'LeetCode 105', 'Medium', 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', null),
  (81, 2, 'Binary Tree Maximum Path Sum', 'LeetCode 124', 'Hard', 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', null),
  (83, 1, 'Kth Largest Element', 'LeetCode 215', 'Medium', 'https://leetcode.com/problems/kth-largest-element-in-an-array/', null),
  (83, 2, 'Top K Frequent Elements', 'LeetCode 347', 'Medium', 'https://leetcode.com/problems/top-k-frequent-elements/', null),
  (84, 1, 'Merge K Sorted Lists', 'LeetCode 23', 'Hard', 'https://leetcode.com/problems/merge-k-sorted-lists/', null),
  (84, 2, 'Find Median from Data Stream', 'LeetCode 295', 'Hard', 'https://leetcode.com/problems/find-median-from-data-stream/', null),
  (85, 1, 'Task Scheduler', 'LeetCode 621', 'Medium', 'https://leetcode.com/problems/task-scheduler/', null),
  (85, 2, 'Jump Game', 'LeetCode 55', 'Medium', 'https://leetcode.com/problems/jump-game/', null),
  (86, 1, 'Gas Station', 'LeetCode 134', 'Medium', 'https://leetcode.com/problems/gas-station/', null),
  (86, 2, 'Non-overlapping Intervals', 'LeetCode 435', 'Medium', 'https://leetcode.com/problems/non-overlapping-intervals/', null),
  (87, 1, 'BFS of Graph', 'takeUforward', 'Easy', null, 'Given an adjacency list and a start vertex, return breadth-first traversal order. Use a queue and mark vertices visited when enqueued.'),
  (87, 2, 'DFS of Graph', 'takeUforward', 'Easy', null, 'Given an adjacency list and a start vertex, return depth-first traversal order. Track visited vertices and state the time and space complexity.'),
  (88, 1, 'Number of Islands', 'LeetCode 200', 'Medium', 'https://leetcode.com/problems/number-of-islands/', null),
  (88, 2, 'Rotting Oranges', 'LeetCode 994', 'Medium', 'https://leetcode.com/problems/rotting-oranges/', null),
  (90, 1, '01 Matrix', 'LeetCode 542', 'Medium', 'https://leetcode.com/problems/01-matrix/', null),
  (91, 1, 'Detect Cycle in Undirected Graph', 'takeUforward', 'Medium', null, 'Given an undirected graph, determine whether it contains a cycle using BFS or DFS while tracking each vertex''s parent.'),
  (91, 2, 'Course Schedule', 'LeetCode 207', 'Medium', 'https://leetcode.com/problems/course-schedule/', null),
  (92, 1, 'Course Schedule II', 'LeetCode 210', 'Medium', 'https://leetcode.com/problems/course-schedule-ii/', null),
  (92, 2, 'Number of Provinces', 'LeetCode 547', 'Medium', 'https://leetcode.com/problems/number-of-provinces/', null),
  (93, 1, 'Clone Graph', 'LeetCode 133', 'Medium', 'https://leetcode.com/problems/clone-graph/', null),
  (93, 2, 'Word Ladder', 'LeetCode 127', 'Hard', 'https://leetcode.com/problems/word-ladder/', null),
  (94, 1, 'Network Delay Time', 'LeetCode 743', 'Medium', 'https://leetcode.com/problems/network-delay-time/', null),
  (94, 2, 'Min Cost to Connect All Points', 'LeetCode 1584', 'Medium', 'https://leetcode.com/problems/min-cost-to-connect-all-points/', null),
  (95, 1, 'Climbing Stairs', 'LeetCode 70', 'Easy', 'https://leetcode.com/problems/climbing-stairs/', null),
  (95, 2, 'House Robber', 'LeetCode 198', 'Medium', 'https://leetcode.com/problems/house-robber/', null),
  (97, 1, 'Coin Change', 'LeetCode 322', 'Medium', 'https://leetcode.com/problems/coin-change/', null),
  (97, 2, 'Partition Equal Subset Sum', 'LeetCode 416', 'Medium', 'https://leetcode.com/problems/partition-equal-subset-sum/', null),
  (98, 1, 'Unique Paths', 'LeetCode 62', 'Medium', 'https://leetcode.com/problems/unique-paths/', null),
  (98, 2, 'Minimum Path Sum', 'LeetCode 64', 'Medium', 'https://leetcode.com/problems/minimum-path-sum/', null),
  (99, 1, 'Longest Common Subsequence', 'LeetCode 1143', 'Medium', 'https://leetcode.com/problems/longest-common-subsequence/', null),
  (99, 2, 'Longest Increasing Subsequence', 'LeetCode 300', 'Medium', 'https://leetcode.com/problems/longest-increasing-subsequence/', null),
  (100, 1, 'Word Break', 'LeetCode 139', 'Medium', 'https://leetcode.com/problems/word-break/', null),
  (100, 2, 'Implement Trie', 'LeetCode 208', 'Medium', 'https://leetcode.com/problems/implement-trie-prefix-tree/', null),
  (101, 1, 'Search a 2D Matrix', 'LeetCode 74', 'Medium', 'https://leetcode.com/problems/search-a-2d-matrix/', null),
  (101, 2, 'Decode Ways', 'LeetCode 91', 'Medium', 'https://leetcode.com/problems/decode-ways/', null);

create table public.schedule_days (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  day_number integer not null check (day_number between 13 and 102),
  schedule_date date not null,
  week_number integer not null check (week_number between 1 and 13),
  cadence text not null,
  kind text not null check (kind in ('problem', 'rest', 'revision', 'mock')),
  topic text not null,
  difficulty_summary text not null,
  milestone text not null,
  instructions text not null,
  publish_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (group_id, day_number),
  unique (group_id, schedule_date)
);

create index schedule_days_group_date_idx on public.schedule_days(group_id, schedule_date);
create index schedule_days_publish_at_idx on public.schedule_days(publish_at);

alter table public.schedule_days enable row level security;

create policy "Members can read published schedule days"
on public.schedule_days for select
to authenticated
using (
  (select private.is_group_owner(group_id))
  or (publish_at <= now() and (select private.is_group_member(group_id)))
);

revoke all on public.schedule_days from anon;
grant select on public.schedule_days to authenticated;

alter table public.problems drop constraint if exists problems_url_check;
alter table public.problems alter column url drop not null;
alter table public.problems add constraint problems_url_check check (url is null or url ~* '^https?://');

alter table public.problems drop constraint if exists problems_difficulty_check;
alter table public.problems add constraint problems_difficulty_check
  check (difficulty in ('Basic', 'Easy', 'Medium', 'Hard'));

alter table public.problems
  add column schedule_day_id uuid references public.schedule_days(id) on delete cascade,
  add column source text not null default 'manual' check (source in ('manual', 'roadmap')),
  add column display_order smallint not null default 1 check (display_order > 0),
  add column prompt text check (prompt is null or char_length(trim(prompt)) between 1 and 4000),
  add column publish_at timestamptz not null default now();

alter table public.problems add constraint problems_destination_check
  check (url is not null or prompt is not null);

create unique index problems_schedule_day_order_key
  on public.problems(schedule_day_id, display_order)
  where schedule_day_id is not null;
create index problems_group_publish_at_idx on public.problems(group_id, publish_at);

drop policy "Members can read group problems" on public.problems;
create policy "Members can read published group problems"
on public.problems for select
to authenticated
using (
  (select private.is_group_owner(group_id))
  or (publish_at <= now() and (select private.is_group_member(group_id)))
);

drop policy "Members can read group completions" on public.completions;
create policy "Members can read published problem completions"
on public.completions for select
to authenticated
using (
  exists (
    select 1 from public.problems
    where problems.id = completions.problem_id
      and problems.publish_at <= now()
      and (select private.is_group_member(problems.group_id))
  )
);

drop policy "Members can create their own completion" on public.completions;
create policy "Members can complete published problems"
on public.completions for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.problems
    where problems.id = completions.problem_id
      and problems.publish_at <= now()
      and (select private.is_group_member(problems.group_id))
  )
);

drop policy "Members can delete their own completion" on public.completions;
create policy "Members can undo published problem completions"
on public.completions for delete
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.problems
    where problems.id = completions.problem_id
      and problems.publish_at <= now()
      and (select private.is_group_member(problems.group_id))
  )
);

drop policy "Members can read group comments" on public.comments;
create policy "Members can read published problem comments"
on public.comments for select
to authenticated
using (
  exists (
    select 1 from public.problems
    where problems.id = comments.problem_id
      and problems.publish_at <= now()
      and (select private.is_group_member(problems.group_id))
  )
);

drop policy "Members can create their own comments" on public.comments;
create policy "Members can comment on published problems"
on public.comments for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.problems
    where problems.id = comments.problem_id
      and problems.publish_at <= now()
      and (select private.is_group_member(problems.group_id))
      and (
        comments.image_path is null
        or (
          split_part(comments.image_path, '/', 1) = problems.group_id::text
          and split_part(comments.image_path, '/', 2) = (select auth.uid())::text
        )
      )
  )
);

create or replace function private.install_dsa_roadmap(
  target_group uuid,
  sprint_start date default date '2026-08-24'
)
returns table (schedule_day_count bigint, roadmap_problem_count bigint)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_owner uuid;
begin
  select owner_id into target_owner
  from public.groups
  where id = target_group;

  if target_owner is null then
    raise exception 'Group not found';
  end if;

  insert into public.schedule_days (
    group_id, day_number, schedule_date, week_number, cadence, kind, topic,
    difficulty_summary, milestone, instructions, publish_at
  )
  select
    target_group,
    template.day_number,
    sprint_start + template.day_offset,
    template.week_number,
    to_char(sprint_start + template.day_offset, 'Dy DD Mon'),
    template.kind,
    template.topic,
    template.difficulty_summary,
    template.milestone,
    template.instructions,
    (sprint_start + template.day_offset)::timestamp at time zone 'Asia/Kolkata'
  from private.dsa_roadmap_days template
  on conflict (group_id, day_number) do update set
    schedule_date = excluded.schedule_date,
    week_number = excluded.week_number,
    cadence = excluded.cadence,
    kind = excluded.kind,
    topic = excluded.topic,
    difficulty_summary = excluded.difficulty_summary,
    milestone = excluded.milestone,
    instructions = excluded.instructions,
    publish_at = excluded.publish_at;

  insert into public.problems (
    group_id, title, url, platform, difficulty, problem_date, note, created_by,
    schedule_day_id, source, display_order, prompt, publish_at
  )
  select
    target_group,
    item.title,
    item.url,
    item.platform,
    item.difficulty,
    schedule.schedule_date,
    schedule.milestone,
    target_owner,
    schedule.id,
    'roadmap',
    item.display_order,
    item.prompt,
    schedule.publish_at
  from private.dsa_roadmap_items item
  join public.schedule_days schedule
    on schedule.group_id = target_group
   and schedule.day_number = item.day_number
  on conflict (schedule_day_id, display_order) where schedule_day_id is not null
  do update set
    title = excluded.title,
    url = excluded.url,
    platform = excluded.platform,
    difficulty = excluded.difficulty,
    problem_date = excluded.problem_date,
    note = excluded.note,
    created_by = excluded.created_by,
    source = excluded.source,
    prompt = excluded.prompt,
    publish_at = excluded.publish_at;

  return query
  select
    (select count(*) from public.schedule_days where group_id = target_group),
    (select count(*) from public.problems where group_id = target_group and source = 'roadmap');
end;
$$;

revoke all on function private.install_dsa_roadmap(uuid, date) from public, anon, authenticated;

comment on table public.schedule_days is
  'Published daily roadmap metadata for a private CodeStreak group.';
comment on function private.install_dsa_roadmap(uuid, date) is
  'Idempotently installs the canonical Day 13-102 DSA roadmap for one group.';

commit;
