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
import { webAppFormSchema, type WebAppFormValues } from "../schema"

export type AppFormDrawerMode = "create" | "edit" | "duplicate"

const copyByMode: Record<AppFormDrawerMode, { title: string; description: string; submit: string }> = {
  create: {
    title: "Add app",
    description: "List a new app or project in the directory.",
    submit: "Create app",
  },
  edit: {
    title: "Edit app",
    description: "Update the app details and description.",
    submit: "Save changes",
  },
  duplicate: {
    title: "Duplicate app",
    description: "Copy an existing entry to reuse its details.",
    submit: "Duplicate app",
  },
}

type AppFormDrawerProps = {
  mode: AppFormDrawerMode
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: WebAppFormValues
  onSubmit: (values: WebAppFormValues) => Promise<void> | void
  isPending?: boolean
}

export function AppFormDrawer({
  mode,
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  isPending = false,
}: AppFormDrawerProps) {
  const form = useForm<WebAppFormValues>({
    resolver: zodResolver(webAppFormSchema),
    defaultValues,
    mode: "onChange",
  })

  React.useEffect(() => {
    if (open) {
      form.reset(defaultValues)
    }
  }, [open, defaultValues, form])

  function handleSubmit(values: WebAppFormValues) {
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Super productivity" {...field} />
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
                  <FormLabel>Website</FormLabel>
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
                    <Textarea placeholder="Describe what this app offers." className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" type="url" {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Optional: Add an image to showcase this app
                  </p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="blogPostSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blog Post Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="blog-post-about-this-app" {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Optional: Link to a blog post about this app
                  </p>
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
