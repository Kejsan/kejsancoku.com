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
import { Checkbox } from "@/components/ui/checkbox"
import { postFormSchema, type PostFormValues } from "../schema"

export type PostFormDrawerMode = "create" | "edit" | "duplicate"

const modeCopy: Record<PostFormDrawerMode, { title: string; description: string; submit: string }> = {
  create: {
    title: "Create post",
    description: "Write the details for your new post.",
    submit: "Create post",
  },
  edit: {
    title: "Edit post",
    description: "Update the content and metadata for this post.",
    submit: "Save changes",
  },
  duplicate: {
    title: "Duplicate post",
    description: "Start from an existing post and save it as a new draft.",
    submit: "Duplicate post",
  },
}

type PostFormDrawerProps = {
  mode: PostFormDrawerMode
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: PostFormValues
  onSubmit: (values: PostFormValues) => Promise<void> | void
  isPending?: boolean
}

export function PostFormDrawer({
  mode,
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  isPending = false,
}: PostFormDrawerProps) {
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues,
    mode: "onChange",
  })

  React.useEffect(() => {
    if (open) {
      form.reset(defaultValues)
    }
  }, [open, defaultValues, form])

  function handleSubmit(values: PostFormValues) {
    onSubmit(values)
  }

  const copy = modeCopy[mode]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{copy.title}</SheetTitle>
          <SheetDescription>{copy.description}</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-1 flex-col gap-4 overflow-y-auto"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Amazing announcement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="amazing-announcement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write the post content"
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
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A short description for SEO" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="featuredBanner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured banner URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Published</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Toggle to control whether this post is live.
                    </p>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                      aria-label="Toggle published"
                    />
                  </FormControl>
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
