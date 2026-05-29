import {
  UpsertQuestionSchema,
  type UpsertQuestionInput,
} from '@/application/dtos/UpsertQuestionDTO'
import { Party } from '@/domain/entities/Party'
import type { IPartyRepository } from '@/domain/repositories/IPartyRepository'
import { withOptimisticRetry } from '@/application/support/withOptimisticRetry'

export class UpsertQuestionHandler {
  constructor(private readonly repo: IPartyRepository) {}
  async execute(input: UpsertQuestionInput): Promise<void> {
    const p = UpsertQuestionSchema.parse(input)
    const fields = {
      kind: p.kind,
      type: p.type,
      scope: p.scope,
      label: p.label,
      options: p.options,
      required: p.required,
    }
    await withOptimisticRetry(this.repo, p.partyId, (row) => {
      const party = Party.restore(row.snapshot)
      return (
        p.questionId ? party.updateQuestion(p.questionId, fields) : party.addQuestion(fields)
      ).toSnapshot()
    })
  }
}
