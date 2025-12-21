import { CodingQuestion } from '../models/exam';

export const SAMPLE_CODING_QUESTIONS: CodingQuestion[] = [
  {
    id: '1',
    title: 'Array Rotation',
    problem: 'Write a function that rotates an array to the right by k steps, where k is non-negative. The array should be modified in-place.',
    examples: [
      {
        input: 'nums = [1,2,3,4,5,6,7], k = 3',
        output: '[5,6,7,1,2,3,4]',
        explanation: 'Rotate 1 steps to the right: [7,1,2,3,4,5,6]\nRotate 2 steps to the right: [6,7,1,2,3,4,5]\nRotate 3 steps to the right: [5,6,7,1,2,3,4]'
      },
      {
        input: 'nums = [-1,-100,3,99], k = 2',
        output: '[3,99,-1,-100]',
        explanation: 'Rotate 1 steps to the right: [99,-1,-100,3]\nRotate 2 steps to the right: [3,99,-1,-100]'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-2^31 <= nums[i] <= 2^31 - 1',
      '0 <= k <= 10^5'
    ],
    testCases: [
      { input: '[1,2,3,4,5,6,7]\n3', expected: '[5,6,7,1,2,3,4]' },
      { input: '[-1,-100,3,99]\n2', expected: '[3,99,-1,-100]' },
      { input: '[1,2]\n3', expected: '[2,1]' }
    ],
    language: 'javascript',
    starterCode: 'function rotate(nums: number[], k: number): void {\n    // Your code here\n};',
    course: 'Computer Science',
    difficulty: 'medium'
  },
  {
    id: '2',
    title: 'Binary Tree Level Order Traversal',
    problem: 'Given the root of a binary tree, return the level order traversal of its nodes\' values. (i.e., from left to right, level by level).',
    examples: [
      {
        input: 'root = [3,9,20,null,null,15,7]',
        output: '[[3],[9,20],[15,7]]',
        explanation: 'Level 1: [3]\nLevel 2: [9,20]\nLevel 3: [15,7]'
      },
      {
        input: 'root = [1]',
        output: '[[1]]',
        explanation: 'There is only one level with a single node.'
      }
    ],
    constraints: [
      'The number of nodes in the tree is in the range [0, 2000].',
      '-1000 <= Node.val <= 1000'
    ],
    testCases: [
      { input: '[3,9,20,null,null,15,7]', expected: '[[3],[9,20],[15,7]]' },
      { input: '[1]', expected: '[[1]]' },
      { input: '[]', expected: '[]' }
    ],
    language: 'javascript',
    starterCode: '/**\n * Definition for a binary tree node.\n * class TreeNode {\n *     val: number\n *     left: TreeNode | null\n *     right: TreeNode | null\n *     constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {\n *         this.val = (val===undefined ? 0 : val)\n *         this.left = (left===undefined ? null : left)\n *         this.right = (right===undefined ? null : right)\n *     }\n * }\n */\n\nfunction levelOrder(root: TreeNode | null): number[][] {\n    // Your code here\n};',
    course: 'Computer Science',
    difficulty: 'medium'
  },
  {
    id: '3',
    title: 'Longest Substring Without Repeating Characters',
    problem: 'Given a string s, find the length of the longest substring without repeating characters.',
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3.'
      }
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    testCases: [
      { input: '"abcabcbb"', expected: '3' },
      { input: '"bbbbb"', expected: '1' },
      { input: '"pwwkew"', expected: '3' },
      { input: '" "', expected: '1' }
    ],
    language: 'javascript',
    starterCode: 'function lengthOfLongestSubstring(s: string): number {\n    // Your code here\n};',
    course: 'Computer Science',
    difficulty: 'medium'
  }
];
