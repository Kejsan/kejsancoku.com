"use client"

import { forwardRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"
import type { Experience } from "@/types/experience"

const allExperiences: Experience[] = [
    {
      id: "division5",
      title: "Digital Marketing Specialist",
      company: "Division5",
      period: "Feb 2025 - Present",
      location: "Tirana, Albania · Hybrid",
      description:
        "Leading end-to-end digital presence management, SEO strategy across multiple brands, and podcast production for 'Scaling the Unscalable'",
      achievements: [
        "Managing SEO across Division5, EngjellRraklli.com, and sub-brands",
        "Leading podcast post-production and multi-platform distribution",
        "Creating design assets and managing social media strategy",
      ],
      fullDescription: `I manage Division5's digital presence end to end. I run the website, plan and publish content for LinkedIn and Instagram, and create most design assets for social, blog articles, and infographics. I lead SEO across Division5, EngjellRraklli.com, and our sub-brands, covering strategy, audits, on-page improvements, technical fixes, and reporting. I also own post-production for the "Scaling the Unscalable" podcast, turning recordings into full episodes, shorts, and publishing across YouTube, Instagram, TikTok, Spotify, and other podcast platforms.`,
      responsibilities: [
        "SEO leadership: define the SEO roadmap, run site audits, manage keyword research and mapping, drive on-page optimisation, internal linking, and technical SEO, track KPIs, and report results across Division5, EngjellRraklli.com, and related brands.",
        "Website ownership: plan content, update pages, improve information architecture, fix issues affecting crawlability, indexation, and Core Web Vitals, and ensure accurate metadata and structured content.",
        "Content and social strategy: build editorial calendars, write and publish posts for LinkedIn and Instagram, and adapt long-form insights into carousels, polls, and commentary that serve founders and product teams.",
        "Design and publishing: create visuals for social, blog articles, and infographics, align copy and design, and ensure brand consistency across assets and channels.",
        "Podcast and video: manage post-production for 'Scaling the Unscalable,' edit main episodes and shorts, create thumbnails and captions, and distribute across YouTube, Instagram, TikTok, Spotify, and major podcast directories.",
        "Communications support: prepare marketing documents and presentations, maintain clear messaging, and coordinate with stakeholders for timely reviews and approvals.",
        "Analytics and reporting: monitor organic performance and engagement, use data to prioritise sprints, and iterate on topics, formats, and landing pages to improve reach and conversions.",
      ],
      skills: [
        "Search Engine Optimization (SEO)",
        "Web Design",
        "Social Media Marketing",
        "On-Page Optimization",
        "Copywriting",
        "SEO Copywriting",
        "Content Management",
        "Content Strategy",
        "Content Marketing",
      ],
    },
    {
      id: "ecommerce",
      title: "SEO & Affiliate Marketing Specialist",
      company: "E-Commerce Company (US)",
      period: "Jul 2024 - Jan 2025",
      location: "Chicago, Illinois, United States · Remote",
      description:
        "Drove organic growth for multiple e-commerce websites through integrated SEO and affiliate marketing strategies",
      achievements: [
        "Optimized content across 3000+ category pages",
        "Managed affiliate program on Impact.com",
        "Used BrightEdge, SEMrush, and GSC for performance analysis",
      ],
      fullDescription: `A multifaceted role focused on driving organic growth and expanding brand reach for multiple e-commerce websites through integrated SEO and affiliate marketing strategies.`,
      responsibilities: [
        "Optimizing content across over 3000 category pages",
        "Collaborating with development teams to ensure seamless SEO implementation",
        "Leveraging data analytics to enhance performance",
        "Using platforms like BrightEdge, SEMrush, and Google Search Console to analyze rankings, identify trends, and recommend improvements to refine keyword targeting and boost site traffic",
        "Staying attuned to the latest SEO practices and developments and adopting them when necessary",
        "Owned the affiliate marketing program on Impact.com, overseeing all aspects from partner research and strategic outreach to ongoing relationship management and performance analysis",
        "Collaborated with development teams to guide flawless technical SEO implementation and supported content marketing initiatives",
      ],
      skills: [
        "Analytical Skills",
        "E-commerce SEO",
        "SEO Copywriting",
        "Search Engine Optimization (SEO)",
        "Content Creation",
        "Content Management Systems (CMS)",
      ],
    },
    {
      id: "cardo-ai",
      title: "Digital Marketing Specialist",
      company: "Cardo AI",
      period: "Oct 2021 - Jul 2024",
      location: "Tirana, Albania · Hybrid",
      description:
        "Enhanced digital presence through comprehensive SEO, content strategy, and email marketing initiatives",
      achievements: [
        "Launched LinkedIn newsletter with 3200+ subscribers",
        "Led website redesign and migration without ranking loss",
        "Managed multi-channel email campaigns and social media",
      ],
      // Career progression within the company
      careerProgression: [
        {
          title: "Digital Marketing Specialist",
          period: "Jan 2024 - Jul 2024",
          type: "promotion",
          description: "Promoted to lead comprehensive digital marketing strategy and cross-functional initiatives",
          responsibilities: [
            "Content Creation & Strategy: Research and develop new topics and ideas for content creation. Write compelling copy for social media captions and perform hashtag & trend research to maximize reach and engagement.",
            "SEO Optimization: Involved in all aspects of SEO, including conducting keyword research, performing technical SEO audits, and implementing SEO fixes. Responsible for maintaining and updating the company website with SEO-optimized content, new pages, and articles. Provided major involvement and support during a website redesign, restructuring & migration with the purpose of keeping the website healthy and not lose rankings.",
            "Email Marketing: Managed and wrote email campaigns targeted towards existing clients and potential leads. Create engaging content that nurtures relationships and drives conversions.",
            "Newsletter Management: Launched and managed an internal weekly newsletter for our clients, providing them with valuable insights and updates. Additionally, supported the development of a monthly LinkedIn newsletter that has gained 3200+ subscribers after just two editions.",
            "Collaboration & Analysis: Collaborated closely with other marketing team members on strategy development, design initiatives, and performance analysis to ensure alignment with our goals. Provided actionable insights based on data analysis to optimize future campaigns.",
          ],
          skills: [
            "Content Management Systems (CMS)",
            "Web Design",
            "Digital Marketing",
            "Content Management",
            "Content Development",
            "Content Marketing",
            "Email Management",
            "Email Newsletter Design",
            "Email Marketing Software",
            "WordPress",
          ],
        },
        {
          title: "Social Media & SEO Specialist",
          period: "Oct 2021 - Dec 2023",
          type: "initial",
          description: "Built foundational social media strategy and SEO optimization during company's growth phase",
          responsibilities: [
            "Content Creation & Strategy: Research and develop new topics and ideas for content creation. Write compelling copy for social media captions and perform hashtag & trend research to maximize reach and engagement.",
            "SEO Optimization: Involved in all aspects of SEO, including conducting keyword research, performing technical SEO audits, and implementing SEO fixes.",
            "Social Media Management: Built and executed social media strategies across multiple platforms.",
            "Performance Analysis: Tracked and analyzed social media and SEO performance metrics to optimize campaigns.",
          ],
          skills: [
            "SEO Copywriting",
            "Social Media",
            "Online Marketing",
            "Landing Page Optimization",
            "Social Media Measurement",
            "Instagram",
            "Content Management",
            "Digital Marketing",
            "Web Content Writing",
            "SEMrush",
            "On-Page Optimization",
            "Marketing",
            "Social Media Marketing",
            "LinkedIn Marketing",
            "Content Strategy",
            "Social Media Communications",
            "Canva",
            "Copywriting",
            "Search Engine Optimization (SEO)",
            "Off-Page SEO",
            "LinkedIn",
          ],
        },
      ],
      fullDescription: `As a Digital Marketing Specialist at Cardo AI, I played a crucial role in driving our digital marketing efforts and enhancing our online presence. Starting as a Social Media & SEO Specialist, I was promoted to Digital Marketing Specialist, expanding my responsibilities to encompass comprehensive digital marketing strategy.`,
      skills: [
        "Content Management Systems (CMS)",
        "Web Design",
        "Digital Marketing",
        "Content Management",
        "Content Development",
        "Content Marketing",
        "Email Management",
        "Email Newsletter Design",
        "Email Marketing Software",
        "WordPress",
        "SEO Copywriting",
        "Social Media Marketing",
        "LinkedIn Marketing",
        "Content Strategy",
        "Search Engine Optimization (SEO)",
      ],
    },
    {
      id: "ipervox",
      title: "SEO & Content Manager / Social Media Marketing Manager",
      company: "Ipervox",
      period: "Nov 2020 - Oct 2021",
      location: "Tirana, Albania · Remote",
      description:
        "Dual role managing content strategy, SEO optimization, and social media presence for voice technology platform",
      achievements: [
        "Developed comprehensive content strategy for voice technology sector",
        "Built social media presence across multiple platforms",
        "Improved website traffic through SEO best practices",
      ],
      // Concurrent roles within the company
      careerProgression: [
        {
          title: "SEO & Content Manager",
          period: "Dec 2020 - Oct 2021",
          type: "concurrent",
          description: "Led content strategy and SEO optimization for voice technology platform",
          responsibilities: [
            "Conducting in-depth research on industry-related topics in order to develop original content",
            "Developing content for the blog, social media, product descriptions, and the company website",
            "Assisting the marketing team in developing content for advertising campaigns",
            "Editing and polishing existing content to improve readability",
            "Conducting keyword research and using SEO best practices to increase traffic to the company website",
          ],
          skills: [
            "SEO Copywriting",
            "Landing Page Optimization",
            "Digital Marketing",
            "Web Content Writing",
            "SEMrush",
            "On-Page Optimization",
            "Marketing",
            "Content Strategy",
            "Off-Page SEO",
          ],
        },
        {
          title: "Social Media Marketing Manager",
          period: "Nov 2020 - Oct 2021",
          type: "concurrent",
          description: "Managed social media presence and community engagement concurrently with content role",
          responsibilities: [
            "Research audience preferences and discover current trends",
            "Create engaging text, image, and video content",
            "Design posts to sustain readers' curiosity and engagement",
            "Stay up-to-date with changes in all social platforms ensuring maximum effectiveness",
            "Facilitate online conversations with customers and respond to queries",
            "Report on online reviews and feedback from customers and fans",
            "Develop an optimal posting schedule, considering web traffic and customer engagement metrics",
            "Oversee social media accounts' layout",
            "Suggest new ways to attract new audiences",
          ],
          skills: [
            "Online Marketing",
            "Social Media Measurement",
            "Digital Marketing",
            "Web Content Writing",
            "Marketing",
            "LinkedIn Marketing",
            "Content Strategy",
            "Social Media Communications",
            "Canva",
            "LinkedIn",
          ],
        },
      ],
      fullDescription: `Managed content creation, SEO strategy, and social media marketing for Ipervox, a voice technology platform that enables users to create voice applications for Amazon Alexa and Google Assistant. Held concurrent roles as both SEO & Content Manager and Social Media Marketing Manager.`,
      skills: [
        "SEO Copywriting",
        "Landing Page Optimization",
        "Digital Marketing",
        "Web Content Writing",
        "SEMrush",
        "On-Page Optimization",
        "Marketing",
        "Content Strategy",
        "Social Media Marketing",
        "LinkedIn Marketing",
        "Social Media Communications",
        "Canva",
        "LinkedIn",
      ],
    },
    {
      id: "linkedcopy",
      title: "Content Writer",
      company: "LinkedCopy",
      period: "Mar 2020 - Jul 2021",
      location: "Freelance",
      description: "Freelance content writer creating blog articles and website copy for multiple brands",
      achievements: [
        "Wrote blog articles and website copy for multiple brands",
        "Ghostwrote long-form pieces with supporting visuals",
        "Aligned content with SEO requirements",
      ],
      fullDescription: `Freelance content writing role creating various types of content for different brands and clients.`,
      responsibilities: [
        "Wrote blog articles and website copy for multiple brands",
        "Ghostwrote long-form pieces and prepared supporting visuals and blog assets",
        "Aligned topics and metadata with basic SEO requirements and coordinated edits with clients",
      ],
      skills: ["SEO Copywriting", "Marketing"],
    },
  ];

const ExperienceSection = forwardRef<HTMLDivElement>(function ExperienceSection(_, ref) {
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null)
  const [showAllExperiences, setShowAllExperiences] = useState(false)

  const displayedExperiences = showAllExperiences ? allExperiences : allExperiences.slice(0, 3)

  return (
    <>
      <section id="experience" ref={ref} className="experience-section py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Professional Experience</h2>
          <div className="space-y-8">
            {displayedExperiences.map((exp, index) => (
              <Card
                key={index}
                className="experience-card bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedExperience(exp)}
              >
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#fb6163] transition-colors">
                        {exp.title}
                      </h3>
                      <p className="text-[#54a09b] text-lg">{exp.company}</p>
                      {exp.careerProgression && (
                        <div className="mt-2 space-y-1">
                          {exp.careerProgression.map((role, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  role.type === "promotion"
                                    ? "bg-[#fb6163]"
                                    : role.type === "concurrent"
                                      ? "bg-[#54a09b]"
                                      : "bg-white/40"
                                }`}
                              ></div>
                              <span className="text-white/70 text-sm">
                                {role.title} ({role.period})
                                {role.type === "promotion" && <span className="text-[#fb6163] ml-1">↗ Promoted</span>}
                                {role.type === "concurrent" && (
                                  <span className="text-[#54a09b] ml-1">• Concurrent Role</span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-white/80">{exp.period}</p>
                      <p className="text-white/60">{exp.location}</p>
                    </div>
                  </div>
                  <p className="text-white/80 mb-4">{exp.description}</p>
                  <div className="space-y-2 mb-4">
                    {exp.achievements.slice(0, 2).map((achievement, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#fb6163] rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-white/70">{achievement}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#fb6163] text-sm font-medium">Click to view full details →</span>
                    <div className="flex gap-2">
                      {exp.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-xs bg-[#fb6163]/20 text-[#fb6163] px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!showAllExperiences && (
            <div className="text-center mt-8">
              <Button
                onClick={() => setShowAllExperiences(true)}
                className="bg-gradient-to-r from-[#54a09b] to-[#fb6163] hover:from-[#54a09b]/90 hover:to-[#fb6163]/90 text-white px-8 py-3"
              >
                See More Experiences ({allExperiences.length - 3} more)
              </Button>
            </div>
          )}
        </div>
      </section>

      {selectedExperience && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedExperience.title}</h2>
                  <p className="text-[#54a09b] text-xl mb-1">{selectedExperience.company}</p>
                  <p className="text-white/80">
                    {selectedExperience.period} • {selectedExperience.location}
                  </p>
                  {selectedExperience.previousRole && (
                    <div className="mt-3 p-3 bg-[#fb6163]/10 border border-[#fb6163]/20 rounded-lg">
                      <p className="text-[#fb6163] text-sm font-medium">Career Progression</p>
                      <p className="text-white/80 text-sm">
                        {selectedExperience.previousRole.title} ({selectedExperience.previousRole.period})
                      </p>
                      <p className="text-white/60 text-xs">{selectedExperience.previousRole.note}</p>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white"
                  onClick={() => setSelectedExperience(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">Overview</h3>
                <p className="text-white/80 leading-relaxed">{selectedExperience.fullDescription}</p>
              </div>

              {selectedExperience.careerProgression ? (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Career Progression & Responsibilities</h3>
                  <div className="space-y-6">
                    {selectedExperience.careerProgression.map((role, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border ${
                          role.type === "promotion"
                            ? "bg-[#fb6163]/10 border-[#fb6163]/20"
                            : role.type === "concurrent"
                              ? "bg-[#54a09b]/10 border-[#54a09b]/20"
                              : "bg-white/5 border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              role.type === "promotion"
                                ? "bg-[#fb6163]"
                                : role.type === "concurrent"
                                  ? "bg-[#54a09b]"
                                  : "bg-white/40"
                            }`}
                          ></div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">{role.title}</h4>
                            <p className="text-white/70 text-sm">{role.period}</p>
                            {role.type === "promotion" && (
                              <span className="text-[#fb6163] text-xs font-medium">↗ Promotion</span>
                            )}
                            {role.type === "concurrent" && (
                              <span className="text-[#54a09b] text-xs font-medium">• Concurrent Role</span>
                            )}
                          </div>
                        </div>
                        <p className="text-white/80 mb-3">{role.description}</p>
                        <div className="space-y-2">
                          {role.responsibilities.map((responsibility, j) => (
                            <div key={j} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-white/40 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-white/70 text-sm leading-relaxed">{responsibility}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Key Responsibilities & Impact</h3>
                  <div className="space-y-3">
                    {selectedExperience.responsibilities?.map((responsibility, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#fb6163] rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-white/70 leading-relaxed">{responsibility}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Skills & Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExperience.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-gradient-to-r from-[#54a09b]/20 to-[#fb6163]/20 border border-[#54a09b]/30 text-white px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
})

export default ExperienceSection
