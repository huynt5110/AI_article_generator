import { articleExtractionSchema } from './article-extraction.schema';

describe('articleExtractionSchema', () => {
  const validPayload = {
    title: 'A trip to Paris',
    hook: 'You will love it.',
    sections: [
      { heading: 'Day 1', body: 'We went to the Eiffel Tower.' }
    ],
    bestFor: ['Couples', 'Families'],
    notFor: ['Solo travelers'],
    keyFacts: {
      duration: '3 days',
      cost: 1000,
      isKidFriendly: true
    },
    ethicsNotes: ['Be respectful'],
    provenance: [
      { fieldPath: 'title', sourceParagraphKey: 'P1' }
    ]
  };

  it('should parse a valid payload with flat keyFacts', () => {
    const result = articleExtractionSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should reject nested objects in keyFacts', () => {
    const invalidPayload = {
      ...validPayload,
      keyFacts: {
        location: {
          city: 'Paris',
          country: 'France'
        }
      }
    };
    
    const result = articleExtractionSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('keyFacts');
    }
  });

  it('should reject arrays in keyFacts', () => {
    const invalidPayload = {
      ...validPayload,
      keyFacts: {
        tags: ['sunny', 'warm']
      }
    };
    
    const result = articleExtractionSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('should transform single string to array for bestFor/notFor/ethicsNotes', () => {
    const payloadWithString = {
      ...validPayload,
      bestFor: 'Couples',
      notFor: 'Solo',
      ethicsNotes: 'Respect'
    };
    
    const result = articleExtractionSchema.safeParse(payloadWithString);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bestFor).toEqual(['Couples']);
      expect(result.data.notFor).toEqual(['Solo']);
      expect(result.data.ethicsNotes).toEqual(['Respect']);
    }
  });

  it('should require minimum fields', () => {
    const result = articleExtractionSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
