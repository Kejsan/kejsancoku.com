import { Award, Building2, CalendarRange, CheckCircle2, MapPin } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Experience {
  id: string
  title: string
  company: string
  period: string | null
  location: string | null
  description: string | null
  achievements?: string[]
  skills?: string[]
}

interface ExperienceDetailProps {
  experience: Experience
}

export default function ExperienceDetail({ experience }: ExperienceDetailProps) {
  return (
    <Card
      id={`experience-${experience.id}`}
      className="border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-white/10 text-white"
    >
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">{experience.company}</p>
            <h3 className="text-2xl font-semibold leading-tight">{experience.title || experience.company}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
            {experience.period ? (
              <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                <CalendarRange className="h-4 w-4" />
                {experience.period}
              </span>
            ) : null}
            {experience.location ? (
              <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                <MapPin className="h-4 w-4" />
                {experience.location}
              </span>
            ) : null}
          </div>
        </div>

        {experience.description ? <p className="text-white/75">{experience.description}</p> : null}

        {experience.achievements?.length ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/60">
              <Award className="h-4 w-4" />
              Highlights
            </div>
            <ul className="space-y-2 text-sm text-white/85">
              {experience.achievements.map((achievement, index) => (
                <li key={index} className="flex items-start gap-2 rounded-xl bg-white/5 px-3 py-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#54a09b]" />
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {experience.skills?.length ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/60">
              <Building2 className="h-4 w-4" />
              Skills reinforced
            </div>
            <div className="flex flex-wrap gap-2">
              {experience.skills.map((skill, index) => (
                <Badge key={`${experience.id}-${skill}-${index}`} variant="outline" className="border-white/15 bg-white/5 text-white/90">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
