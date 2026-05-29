import {
  RemoveQuestionSchema,
  type RemoveQuestionInput,
} from '@/application/dtos/RemoveQuestionDTO'
import { Party } from '@/domain/entities/Party'
import type { IPartyRepository } from '@/domain/repositories/IPartyRepository'
import { withOptimisticRetry } from '@/application/support/withOptimisticRetry'

export class RemoveQuestionHandler {
  constructor(private readonly repo: IPartyRepository) {}
  async execute(input: RemoveQuestionInput): Promise<void> {
    const p = RemoveQuestionSchema.parse(input)
    await withOptimisticRetry(this.repo, p.partyId, (row) =>
      Party.restore(row.snapshot).removeQuestion(p.questionId).toSnapshot(),
    )
  }
}
