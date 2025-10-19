import { DifficultyLevel, AccentType } from '../types/learning';

export interface TimeExpression {
  text: string;
  formality: 'formal' | 'casual' | 'educational';
  difficulty: DifficultyLevel;
  context?: string;
  pronunciation?: string;
}

export class EnhancedTimeExpressions {
  private static hourNames = [
    'twelve', 'one', 'two', 'three', 'four', 'five',
    'six', 'seven', 'eight', 'nine', 'ten', 'eleven'
  ];

  static getAllExpressions(hours: number, minutes: number, accent: AccentType = 'us'): TimeExpression[] {
    const displayHours = hours % 12 || 12;
    const nextHour = (hours % 12) + 1 || 1;
    const hourName = this.hourNames[displayHours % 12];
    const nextHourName = this.hourNames[nextHour % 12];
    const expressions: TimeExpression[] = [];

    // O'clock expressions
    if (minutes === 0) {
      expressions.push(
        {
          text: `${hourName} o'clock`,
          formality: 'casual',
          difficulty: 'beginner',
          pronunciation: accent === 'us' ? 'KOR-ter' : 'KWO-ter'
        },
        {
          text: `exactly ${hourName}`,
          formality: 'formal',
          difficulty: 'intermediate'
        },
        {
          text: `${hourName} sharp`,
          formality: 'casual',
          difficulty: 'intermediate'
        }
      );
    }

    // Quarter past
    else if (minutes === 15) {
      expressions.push(
        {
          text: `quarter past ${hourName}`,
          formality: 'educational',
          difficulty: 'beginner'
        },
        {
          text: `fifteen minutes past ${hourName}`,
          formality: 'formal',
          difficulty: 'intermediate'
        },
        {
          text: `a quarter after ${hourName}`,
          formality: 'casual',
          difficulty: 'advanced'
        }
      );
    }

    // Half past
    else if (minutes === 30) {
      expressions.push(
        {
          text: `half past ${hourName}`,
          formality: 'educational',
          difficulty: 'beginner'
        },
        {
          text: `thirty minutes past ${hourName}`,
          formality: 'formal',
          difficulty: 'intermediate'
        },
        {
          text: `${hourName}:thirty`,
          formality: 'casual',
          difficulty: 'advanced'
        }
      );
    }

    // Quarter to
    else if (minutes === 45) {
      expressions.push(
        {
          text: `quarter to ${nextHourName}`,
          formality: 'educational',
          difficulty: 'beginner'
        },
        {
          text: `fifteen minutes to ${nextHourName}`,
          formality: 'formal',
          difficulty: 'intermediate'
        },
        {
          text: `a quarter of ${nextHourName}`,
          formality: 'casual',
          difficulty: 'advanced'
        }
      );
    }

    // Minutes past
    else if (minutes < 30) {
      if (minutes === 1) {
        expressions.push(
          {
            text: `one minute past ${hourName}`,
            formality: 'educational',
            difficulty: 'beginner'
          }
        );
      } else {
        expressions.push(
          {
            text: `${minutes} minutes past ${hourName}`,
            formality: 'educational',
            difficulty: 'beginner'
          },
          {
            text: `${minutes} past ${hourName}`,
            formality: 'casual',
            difficulty: 'intermediate'
          },
          {
            text: `${minutes} after ${hourName}`,
            formality: 'casual',
            difficulty: 'advanced'
          }
        );
      }
    }

    // Minutes to
    else if (minutes > 30) {
      const minutesTo = 60 - minutes;
      if (minutesTo === 1) {
        expressions.push(
          {
            text: `one minute to ${nextHourName}`,
            formality: 'educational',
            difficulty: 'beginner'
          }
        );
      } else {
        expressions.push(
          {
            text: `${minutesTo} minutes to ${nextHourName}`,
            formality: 'educational',
            difficulty: 'beginner'
          },
          {
            text: `${minutesTo} to ${nextHourName}`,
            formality: 'casual',
            difficulty: 'intermediate'
          },
          {
            text: `${minutesTo} of ${nextHourName}`,
            formality: 'casual',
            difficulty: 'advanced'
          }
        );
      }
    }

    return expressions;
  }

  static getExpressionByDifficulty(
    hours: number,
    minutes: number,
    difficulty: DifficultyLevel,
    accent: AccentType = 'us'
  ): TimeExpression[] {
    const allExpressions = this.getAllExpressions(hours, minutes, accent);
    return allExpressions.filter(exp => exp.difficulty === difficulty);
  }

  static getBestExpression(hours: number, minutes: number, difficulty: DifficultyLevel): TimeExpression {
    const expressions = this.getExpressionByDifficulty(hours, minutes, difficulty);

    // Prefer educational expressions for learning
    const educational = expressions.find(exp => exp.formality === 'educational');
    if (educational) return educational;

    // Fallback to first available expression
    return expressions[0] || this.getAllExpressions(hours, minutes)[0];
  }

  static getContextualExamples(hours: number, minutes: number): string[] {
    const timeText = this.getBestExpression(hours, minutes, 'beginner').text;

    return [
      `My school starts at ${timeText}.`,
      `We have dinner at ${timeText} every evening.`,
      `The bus arrives at ${timeText}.`,
      `I go to bed at ${timeText}.`,
      `Our meeting is scheduled for ${timeText}.`
    ];
  }

  static generateQuizQuestion(hours: number, minutes: number, difficulty: DifficultyLevel) {
    const correctAnswer = this.getBestExpression(hours, minutes, difficulty);
    const allExpressions = this.getAllExpressions(hours, minutes);

    // Generate incorrect options
    const wrongOptions = allExpressions
      .filter(exp => exp.text !== correctAnswer.text)
      .slice(0, 3);

    return {
      question: `What time is shown on the clock?`,
      correctAnswer: correctAnswer.text,
      options: [correctAnswer.text, ...wrongOptions.map(opt => opt.text)]
        .sort(() => Math.random() - 0.5), // Shuffle options
      explanation: `The clock shows ${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}, which is correctly expressed as "${correctAnswer.text}".`,
      hints: [
        'Look at where the hour hand is pointing.',
        'Check the position of the minute hand.',
        'Remember: the short hand shows hours, the long hand shows minutes.'
      ]
    };
  }

  private static getPronunciationHint(text: string, accent: AccentType): string {
    const pronunciationMap = {
      'us': {
        'quarter': 'KOR-ter',
        'half': 'HAF',
        'o\'clock': 'uh-KLOCK',
        'past': 'PAST',
        'to': 'too'
      },
      'uk': {
        'quarter': 'KWO-ter',
        'half': 'HAHF',
        'o\'clock': 'uh-KLOCK',
        'past': 'PAHST',
        'to': 'too'
      }
    };

    const accentPronunciations = pronunciationMap[accent];
    let pronunciation = '';

    Object.entries(accentPronunciations).forEach(([word, pronunciation]) => {
      if (text.toLowerCase().includes(word)) {
        pronunciation += `${word}: ${pronunciation} `;
      }
    });

    return pronunciation.trim();
  }
}