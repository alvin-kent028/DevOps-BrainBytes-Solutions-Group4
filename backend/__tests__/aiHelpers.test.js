const { detectQuestionType, detectSubject } = require('../utils/aiHelpers');

describe('aiHelpers', () => {
  describe('detectQuestionType', () => {
    test('should detect definition questions', () => {
      expect(detectQuestionType('What is evaporation?')).toBe('definition');
    });

    test('should detect explanation questions', () => {
      expect(detectQuestionType('How does photosynthesis work?')).toBe('explanation');
    });

    test('should detect example questions', () => {
      expect(detectQuestionType('Give me an example of a metaphor')).toBe('example');
    });
  });

  describe('detectSubject', () => {
    test('should detect Math subject', () => {
      expect(detectSubject('What is 2+2?')).toBe('Math');
    });

    test('should detect Science subject', () => {
      expect(detectSubject('What is evaporation?')).toBe('Science');
    });

    test('should detect Programming subject', () => {
      expect(detectSubject('How do I write a loop in Python?')).toBe('Programming');
    });
  });
});
