import type { Skill as PrismaSkill } from "@prisma/client"

export type Skill = PrismaSkill
export type SkillInput = Omit<PrismaSkill, "id" | "createdAt" | "updatedAt">
