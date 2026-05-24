import { ExtractionPipelineBuilder } from './extraction-pipeline.builder';
import { ExtractionPipelineRunner } from './extraction-pipeline.runner';
import type { PipelineStep } from './pipeline-step.interface';

describe('ExtractionPipelineBuilder', () => {
  let builder: ExtractionPipelineBuilder;
  let loadUploadStepMock: PipelineStep;
  let parseDocumentStepMock: PipelineStep;
  let aiExtractStepMock: PipelineStep;
  let persistDraftStepMock: PipelineStep;
  let completeJobStepMock: PipelineStep;

  beforeEach(() => {
    loadUploadStepMock = { name: 'load-upload', execute: jest.fn() };
    parseDocumentStepMock = { name: 'parse-document', execute: jest.fn() };
    aiExtractStepMock = { name: 'ai-extract', execute: jest.fn() };
    persistDraftStepMock = { name: 'persist-draft', execute: jest.fn() };
    completeJobStepMock = { name: 'complete-job', execute: jest.fn() };

    builder = new ExtractionPipelineBuilder(
      loadUploadStepMock as any,
      parseDocumentStepMock as any,
      aiExtractStepMock as any,
      persistDraftStepMock as any,
      completeJobStepMock as any,
    );
  });

  describe('buildDefault', () => {
    it('should return a runner with all 5 default steps', () => {
      const runner = builder.buildDefault();

      expect(runner).toBeInstanceOf(ExtractionPipelineRunner);
      // Access internal steps via the runner (it accepts steps via constructor)
      expect((runner as any).steps).toHaveLength(5);
      expect((runner as any).steps[0].name).toBe('load-upload');
      expect((runner as any).steps[4].name).toBe('complete-job');
    });
  });

  describe('addStep / build / reset', () => {
    it('should build a custom pipeline with manually added steps', () => {
      const customStep: PipelineStep = { name: 'custom', execute: jest.fn() };

      const runner = builder.addStep(customStep).build();

      expect((runner as any).steps).toHaveLength(1);
      expect((runner as any).steps[0].name).toBe('custom');
    });

    it('should fall back to default pipeline when no custom steps are added', () => {
      const runner = builder.build();

      expect((runner as any).steps).toHaveLength(5);
    });

    it('should reset custom steps', () => {
      const customStep: PipelineStep = { name: 'custom', execute: jest.fn() };
      builder.addStep(customStep);
      builder.reset();

      const runner = builder.build();

      // After reset, no custom steps → falls back to default
      expect((runner as any).steps).toHaveLength(5);
    });

    it('should support fluent API chaining', () => {
      const step1: PipelineStep = { name: 's1', execute: jest.fn() };
      const step2: PipelineStep = { name: 's2', execute: jest.fn() };

      const runner = builder.reset().addStep(step1).addStep(step2).build();

      expect((runner as any).steps).toHaveLength(2);
      expect((runner as any).steps[0].name).toBe('s1');
      expect((runner as any).steps[1].name).toBe('s2');
    });
  });
});
