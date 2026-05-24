import { Injectable } from '@nestjs/common';

@Injectable()
export class DraftMapper {
  toResponseDto(entity: any) {
    if (!entity) return null;

    return {
      id: entity.id,
      title: entity.title,
      hook: entity.hook,
      status: entity.status,
      structuredContent: entity.structuredContent,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      // Omit heavy/sensitive nested relation objects from Upload / User
      uploadId: entity.uploadId,
      ownerId: entity.upload?.userId,
      provenances: entity.provenances?.map((p: any) => ({
        id: p.id,
        fieldPath: p.fieldPath,
        sourceText: p.sourceText,
        userModified: p.userModified,
      })),
    };
  }

  toListResponseDto(entities: any[]) {
    return entities.map(entity => this.toResponseDto(entity));
  }
}
