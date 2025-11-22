"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MultiValueInput } from "@/components/ui/multi-value-input"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { experienceFormSchema, type ExperienceFormValues } from "../schema"

export type ExperienceFormDrawerMode = "create" | "edit" | "duplicate"

const copyByMode: Record<ExperienceFormDrawerMode, { title: string; description: string; submit: string }> = {
  create: {
    title: "Add experience",
    description: "Capture a new role or contract to display on your timeline.",
    submit: "Create experience",
  },
  edit: {
    title: "Edit experience",
    description: "Update the details for this role.",
    submit: "Save changes",
  },
  duplicate: {
    title: "Duplicate experience",
    description: "Clone an existing entry and tweak the details before saving.",
    submit: "Duplicate experience",
  },
}

type ExperienceFormDrawerProps = {
  mode: ExperienceFormDrawerMode
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: ExperienceFormValues
  onSubmit: (values: ExperienceFormValues) => Promise<void> | void
  isPending?: boolean
}

export function ExperienceFormDrawer({
  mode,
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  isPending = false,
}: ExperienceFormDrawerProps) {
  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues,
    mode: "onChange",
  })

  React.useEffect(() => {
    if (open) {
      form.reset(defaultValues)
    }
  }, [open, defaultValues, form])

  function handleSubmit(values: ExperienceFormValues) {
    onSubmit(values)
  }

  const copy = copyByMode[mode]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{copy.title}</SheetTitle>
          <SheetDescription>{copy.description}</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Senior Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period</FormLabel>
                    <FormControl>
                      <Input placeholder="Jan 2022 – Present" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Remote / City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share highlights, responsibilities, and notable achievements."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed overview</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a narrative summary for the modal view."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="achievements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key achievements</FormLabel>
                  <FormControl>
                    <MultiValueInput
                      name={field.name}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Press enter after each achievement"
                      disabled={isPending}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormDescription>
                    Press Enter after each achievement. Displayed prominently in the experience cards.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="responsibilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsibilities</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={"One responsibility per line"}
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Shown when no detailed progression entries are provided.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills &amp; technologies</FormLabel>
                  <FormControl>
                    <MultiValueInput
                      name={field.name}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Add a skill and press enter"
                      disabled={isPending}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormDescription>Press Enter after each skill or paste a list to add multiple at once.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="careerProgression"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Career progression (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='[
  {
    "title": "Lead Engineer",
    "period": "2023",
    "type": "promotion",
    "description": "Role description",
    "responsibilities": ["..."],
    "skills": ["..."]
  }
]'
                      className="font-mono text-sm min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional structured roles for the detailed modal. Leave blank to use responsibilities instead.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="previousRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Previous role highlight (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{
  "title": "Associate Engineer",
  "period": "2021",
  "note": "Promoted after leading a critical launch"
}'
                      className="font-mono text-sm min-h-[160px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Multiple Roles (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='[
  {
    "title": "Senior Developer",
    "startDate": "2022-01-01",
    "endDate": "2023-06-30",
    "description": "Led team of 5 developers"
  },
  {
    "title": "Lead Developer",
    "startDate": "2023-07-01",
    "endDate": null,
    "description": "Managing architecture decisions"
  }
]'
                      className="font-mono text-sm min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Add multiple roles within the same company. Each role should have title, startDate, endDate (or null for current), and description.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="mt-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : copy.submit}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
