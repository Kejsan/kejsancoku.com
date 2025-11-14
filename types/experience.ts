export interface PreviousRole {
  title: string;
  period: string;
  note?: string;
}

export interface CareerProgression {
  title: string;
  period: string;
  type: string;
  description: string;
  responsibilities: string[];
  skills: string[];
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  period?: string | null;
  location?: string | null;
  description?: string | null;
  achievements?: string[];
  fullDescription?: string | null;
  responsibilities?: string[];
  skills?: string[];
  careerProgression?: CareerProgression[] | null;
  previousRole?: PreviousRole | null;
}
