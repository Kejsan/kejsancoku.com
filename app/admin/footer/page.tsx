"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Loader2, RotateCcw, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { SiteSettings } from "@prisma/client"

import {
  emptyFooterFormValues,
  footerFormSchema,
  saveFooterSettings,
  type FooterFormValues,
} from "./actions"
import type { SiteSettingsResponse } from "@/types/site-settings"

const TABS = [
  { value: "general", label: "General" },
  { value: "social", label: "Social" },
  { value: "contact", label: "Contact" },
  { value: "footer", label: "Footer" },
] as const

const formatSiteSettingsForForm = (settings: SiteSettings | null): FooterFormValues => ({
  brandName: settings?.brandName ?? emptyFooterFormValues.brandName,
  brandRole: settings?.brandRole ?? "",
  brandDescription: settings?.brandDescription ?? "",
  linkedin: settings?.linkedin ?? "",
  github: settings?.github ?? "",
  x: settings?.x ?? "",
  threads: settings?.threads ?? "",
  email: settings?.email ?? "",
  contactHeadline: settings?.contactHeadline ?? "",
  contactDescription: settings?.contactDescription ?? "",
  contactLocation: settings?.contactLocation ?? "",
  contactAvailability: settings?.contactAvailability ?? "",
  contactCtaLabel: settings?.contactCtaLabel ?? "",
  contactCtaHref: settings?.contactCtaHref ?? "",
  footerTagline: settings?.footerTagline ?? "",
  footerCtaLabel: settings?.footerCtaLabel ?? "",
  footerCtaHref: settings?.footerCtaHref ?? "",
  footerNote: settings?.footerNote ?? "",
  copyright: settings?.copyright ?? "",
})

export default function FooterPage() {
  const form = useForm<FooterFormValues>({
    resolver: zodResolver(footerFormSchema),
    defaultValues: emptyFooterFormValues,
    mode: "onChange",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  type TabValue = (typeof TABS)[number]["value"]
  const [activeTab, setActiveTab] = useState<TabValue>("general")
  const [lastSavedValues, setLastSavedValues] = useState<FooterFormValues>(emptyFooterFormValues)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadSettings = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/footer")
        if (!response.ok) {
          throw new Error(`Failed to load settings (${response.status})`)
        }

        const payload: SiteSettingsResponse = await response.json()
        if (!isMounted) {
          return
        }

        const values = formatSiteSettingsForForm(payload?.settings ?? null)
        setLastSavedValues(values)
        setLastUpdated(payload?.lastUpdated ?? null)
        form.reset(values, { keepDirty: false })
        setError(null)
      } catch (err) {
        console.error("Failed to load footer settings", err)
        if (!isMounted) {
          return
        }
        setError("We couldn’t load the footer settings. Please try again.")
        setLastSavedValues(emptyFooterFormValues)
        form.reset(emptyFooterFormValues, { keepDirty: false })
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadSettings()

    return () => {
      isMounted = false
    }
  }, [form])

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) {
      return "Not saved yet"
    }
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(lastUpdated))
    } catch {
      return lastUpdated
    }
  }, [lastUpdated])

  const onSubmit = (values: FooterFormValues) => {
    startTransition(() => {
      void (async () => {
        try {
          const result = await saveFooterSettings(values)
          const updatedValues = formatSiteSettingsForForm(result.settings)
          form.reset(updatedValues, { keepDirty: false })
          setLastSavedValues(updatedValues)
          setLastUpdated(result.lastUpdated)
          toast.success("Footer settings saved")
        } catch (err) {
          console.error("Failed to save footer settings", err)
          const message = err instanceof Error ? err.message : "Unable to save footer settings"
          toast.error(message)
        }
      })()
    })
  }

  const handleUndo = () => {
    form.reset(lastSavedValues, { keepDirty: false })
    toast.info("Changes reverted")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Footer Management</h1>
          <p className="text-sm text-muted-foreground">Manage the global footer content for the public site.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Last updated: {lastUpdatedLabel}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={!form.formState.isDirty || isPending || isLoading}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Undo
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={form.handleSubmit(onSubmit)}
            disabled={
              isPending ||
              isLoading ||
              !form.formState.isDirty ||
              !form.formState.isValid
            }
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save
          </Button>
        </div>
      </div>

      {error && <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
            <TabsList>
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="general">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="brandName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand name</FormLabel>
                      <FormControl>
                        <Input placeholder="Kejsan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brandRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input placeholder="Digital Marketing Specialist" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="brandDescription"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Short bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Short description for the footer." rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="social">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.linkedin.com/in/username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="github"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="x"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>X profile</FormLabel>
                      <FormControl>
                        <Input placeholder="https://x.com/username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="threads"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Threads</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.threads.net/@username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent value="contact">
              <div className="grid gap-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contactHeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Headline</FormLabel>
                        <FormControl>
                          <Input placeholder="Let's grow your digital presence" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactCtaLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CTA label</FormLabel>
                        <FormControl>
                          <Input placeholder="Email me" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="contactDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="A short description for the contact section." rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contactLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Pristina, Kosovo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactAvailability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability</FormLabel>
                        <FormControl>
                          <Input placeholder="Available for new projects" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactCtaHref"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CTA link</FormLabel>
                        <FormControl>
                          <Input placeholder="https://cal.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="footer">
              <div className="grid gap-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="footerTagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Footer tagline</FormLabel>
                        <FormControl>
                          <Input placeholder="Interested in working together?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="footerCtaLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Footer CTA label</FormLabel>
                        <FormControl>
                          <Input placeholder="Get in touch" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="footerCtaHref"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Footer CTA link</FormLabel>
                        <FormControl>
                          <Input placeholder="https://cal.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="copyright"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Copyright</FormLabel>
                        <FormControl>
                          <Input placeholder="© 2024 Kejsan. All rights reserved." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="footerNote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Footer note</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Optional note displayed below the copyright." rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </Form>

      {isLoading && (
        <div className="rounded-md border border-dashed border-muted p-6 text-sm text-muted-foreground">
          Loading footer settings...
        </div>
      )}
    </div>
  )
}
