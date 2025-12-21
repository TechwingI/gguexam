// src/app/components/results-page/results-page.component.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import * as echarts from 'echarts';
import { ExamService } from '../../services/exam.service';
import { FirebaseRealtimeService } from '../../services/firebase-realtime.service';
import { TimerService } from '../../services/timer.service';
import { User, ExamResult } from '../../models/exam';

@Component({
  selector: 'app-results-page',
  templateUrl: './results-page.component.html',
  styleUrls: ['./results-page.component.css']
})
export class ResultsPageComponent implements OnInit, AfterViewInit {
  finalScore = 0;
  correctAnswers = 0;
  incorrectAnswers = 0;
  totalTime = '00:00';
  user: User | null = null;

  performanceData: number[] = [0, 0, 0, 0];
  sectionNames: string[] = ['Aptitude', 'Verbal', 'Technical', 'Coding'];
  maxScores: number[] = [0, 0, 0, 0];

  private performanceChart?: echarts.ECharts;
  private scoreChart?: echarts.ECharts;

  constructor(
    public examService: ExamService,
    private timerService: TimerService,
    private router: Router,
    private realtime: FirebaseRealtimeService
  ) {}

  ngOnInit(): void {
    this.user = this.examService.getUser();
    if (!this.user) {
      this.router.navigate(['/']);
      return;
    }
    
    this.calculateAndSaveResults();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initializeCharts(), 300);
  }

  async calculateAndSaveResults(): Promise<void> {
    const res: any = this.examService.calculateResults();

    this.finalScore = res.percentage;
    this.correctAnswers = res.correct;
    this.incorrectAnswers = res.incorrect;

    this.performanceData = [
      res.sectionWise.aptitude,
      res.sectionWise.verbal,
      res.sectionWise.technical,
      res.sectionWise.coding
    ];

    const d = this.examService.getExamData();
    this.maxScores = [
      d.aptitude.length,
      d.verbal.length,
      d.technical.length,
      d.coding.length
    ];

    const timeRemaining = this.examService.getTimeRemaining();
    const timeTaken = 3600 - timeRemaining;
    const m = Math.floor(timeTaken / 60);
    const s = timeTaken % 60;
    this.totalTime = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    if (this.user && this.user.uid) {
      const examResult: ExamResult = {
        user_id: this.user.uid,
        username: this.user.username,
        email: this.user.email,
        course: this.user.course,
        score: this.finalScore,
        total_questions: this.examService.getTotalQuestions(),
        correct_answers: this.correctAnswers,
        time_taken: timeTaken,
        answers: this.examService.getAnswers(),
        code_submissions: this.examService.getCodeSubmissions(),
        timestamp: new Date()
      };

      try {
        await this.realtime.saveExamResult(examResult);
      } catch (error) {
        console.error('Failed to save to Firebase, using localStorage', error);
      }
    }

    setTimeout(() => this.updateCharts(), 100);
  }

  initializeCharts(): void {
    const perfDom = document.getElementById('performance-chart');
    const scoreDom = document.getElementById('score-chart');

    if (perfDom) {
      this.performanceChart = echarts.init(perfDom);
    }
    if (scoreDom) {
      this.scoreChart = echarts.init(scoreDom);
    }

    this.updateCharts();
  }

  updateCharts(): void {
    if (this.performanceChart) {
      this.performanceChart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c} out of {a}'
        },
        grid: {
          left: '8%',
          right: '4%',
          bottom: '10%',
          top: '8%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: this.sectionNames,
          axisLine: {
            lineStyle: {
              color: '#9ca3ff'
            }
          },
          axisLabel: {
            color: '#e5e7ff',
            fontSize: 12
          }
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: (value: any) => {
            const maxValue = Math.max(...this.maxScores, value.max);
            return maxValue + 1;
          },
          axisLine: {
            lineStyle: {
              color: '#9ca3ff'
            }
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(148,163,255,0.2)'
            }
          },
          axisLabel: {
            color: '#e5e7ff',
            fontSize: 12
          }
        },
        series: [
          {
            name: 'Score',
            type: 'bar',
            data: this.performanceData,
            barWidth: '45%',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#22c55e' },
                { offset: 1, color: '#16a34a' }
              ]),
              borderRadius: [6, 6, 0, 0],
              shadowColor: 'rgba(34, 197, 94, 0.5)',
              shadowBlur: 10
            },
            label: {
              show: true,
              position: 'top',
              color: '#e5e7ff',
              fontSize: 12,
              fontWeight: 'bold'
            }
          }
        ]
      });
    }

    if (this.scoreChart) {
      this.scoreChart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          bottom: 0,
          textStyle: {
            color: '#e5e7ff',
            fontSize: 12
          }
        },
        series: [
          {
            name: 'Answers',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#0f172a',
              borderWidth: 2
            },
            label: {
              color: '#e5e7ff',
              fontSize: 12
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              lineStyle: {
                color: '#e5e7ff'
              }
            },
            data: [
              {
                value: this.correctAnswers,
                name: 'Correct',
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#22c55e' },
                    { offset: 1, color: '#16a34a' }
                  ])
                }
              },
              {
                value: this.incorrectAnswers,
                name: 'Incorrect',
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#ef4444' },
                    { offset: 1, color: '#dc2626' }
                  ])
                }
              }
            ]
          }
        ]
      });
    }
  }

  getPerformanceText(score: number, max: number): string {
    if (max === 0) return 'No questions';
    const percent = (score / max) * 100;
    if (percent >= 90) return 'Excellent 🎉';
    if (percent >= 70) return 'Good 👍';
    if (percent >= 50) return 'Average ⚖️';
    return 'Needs improvement 📈';
  }

  retryExam(): void {
    // Clear all exam data
    this.examService.resetExam();
    this.timerService.resetTimer();
    
    this.router.navigate(['/registration']);
  }

  viewSolutions(): void {
    const solutions = `
    === Solutions ===
    
    Aptitude:
    1. Speed = Distance/Time = 300/5 = 60 km/h
    2. 25% of 200 = (25/100) * 200 = 50
    3. x + 7 = 15 → x = 15 - 7 = 8
    4. Area = Length × Width = 12 × 8 = 96 sq cm
    5. Pattern: Multiply by 2 → Next: 16 × 2 = 32
    
    Verbal:
    1. Synonym of 'Abundant' is 'Plentiful'
    2. Antonym of 'Optimistic' is 'Pessimistic'
    3. Past tense: He received the prize yesterday
    4. A person who paints is an Artist
    5. Not only intelligent but also hardworking
    
    Technical:
    1. HTML = Hyper Text Markup Language
    2. Mother of all programming languages: C
    3. Binary search time complexity: O(log n)
    4. LIFO data structure: Stack
    5. CSS = Cascading Style Sheets
    
    Coding Solutions:
    
    Find Maximum Number (JavaScript):
    function findMax(nums) {
        let max = nums[0];
        for (let i = 1; i < nums.length; i++) {
            if (nums[i] > max) {
                max = nums[i];
            }
        }
        return max;
    }
    
    Palindrome Check (JavaScript):
    function isPalindrome(str) {
        const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleanStr === cleanStr.split('').reverse().join('');
    }
    `;
    
    alert(solutions);
  }

  getPerformanceColor(score: number, maxScore: number): string {
    if (maxScore === 0) return 'text-gray-400';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 50) return 'text-orange-400';
    return 'text-red-400';
  }
}