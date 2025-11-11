"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
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
import { workSampleFormSchema, type WorkSampleFormValues } from "../schema"

export type WorkSampleFormDrawerMode = "create" | "edit" | "duplicate"

const copyByMode: Record<WorkSampleFormDrawerMode, { title: string; description: string; submit: string }> = {
  create: {
    title: "Add work sample",
    description: "Highlight a project or case study in your portfolio.",
    submit: "Create work sample",
  },
  edit: {
    title: "Edit work sample",
    description: "Update the details for this portfolio item.",
    submit: "Save changes",
  },
  duplicate: {
    title: "Duplicate work sample",
    description: "Copy an entry and tweak it before saving.",
    submit: "Duplicate work sample",
  },
}

type WorkSampleFormDrawerProps = {
  mode: WorkSampleFormDrawerMode
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: WorkSampleFormValues
  onSubmit: (values: WorkSampleFormValues) => Promise<void> | void
  isPending?: boolean
}

export function WorkSampleFormDrawer({
  mode,
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  isPending = false,
}: WorkSampleFormDrawerProps) {
  const form = useForm<WorkSampleFormValues>({
    resolver: zodResolver(workSampleFormSchema),
    defaultValues,
    mode: "onChange",
  })

  React.useEffect(() => {
    if (open) {
      form.reset(defaultValues)
    }
  }, [open, defaultValues, form])

  function handleSubmit(values: WorkSampleFormValues) {
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Design system overhaul" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Summarise what you accomplished." className="min-h-[120px]" {...field} />
                  </FormControl>
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
