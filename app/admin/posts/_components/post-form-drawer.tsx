"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

function formatDateTimeLocal(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return ""
  const offsetMs = date.getTimezoneOffset() * 60_000
  const local = new Date(date.getTime() - offsetMs)
  return local.toISOString().slice(0, 16)
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

  const [editorTab, setEditorTab] = React.useState<"write" | "preview">("write")

  React.useEffect(() => {
    if (open) {
      form.reset({
        ...defaultValues,
        scheduledAt: formatDateTimeLocal(defaultValues.scheduledAt ?? undefined),
        publishedAt: formatDateTimeLocal(defaultValues.publishedAt ?? undefined),
      })
      setEditorTab("write")
    }
  }, [open, defaultValues, form])

  function normalizeDateTime(value?: string | null) {
    if (!value) return undefined
    const parsed = new Date(value)
    if (Number.isNaN(parsed.valueOf())) return undefined
    return parsed.toISOString()
  }

  function handleSubmit(values: PostFormValues) {
    onSubmit({
      ...values,
      scheduledAt: normalizeDateTime(values.scheduledAt),
      publishedAt: normalizeDateTime(values.publishedAt),
    })
  }

  const copy = modeCopy[mode]
  const status = form.watch("status")
  const contentValue = form.watch("content") ?? ""

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
                    <Input placeholder="Amazing announcement" {...field} disabled={isPending} />
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
                    <Input placeholder="amazing-announcement" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isPending}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {status === "scheduled" ? (
              <FormField
                key="scheduledAt"
                control={form.control}
                name="scheduledAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule for</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            {status === "published" ? (
              <FormField
                key="publishedAt"
                control={form.control}
                name="publishedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publish date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <Tabs value={editorTab} onValueChange={(value) => setEditorTab(value as "write" | "preview")}> 
                    <TabsList className="w-full justify-start">
                      <TabsTrigger value="write" className="flex-1">
                        Write
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="flex-1">
                        Preview
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="write" className="mt-4">
                      <FormControl>
                        <Textarea
                          placeholder="Write the post content"
                          className="min-h-[200px]"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                    </TabsContent>
                    <TabsContent value="preview" className="mt-4">
                      <div className="min-h-[200px] rounded-md border bg-muted/40 p-4 text-sm">
                        {contentValue.trim().length > 0 ? (
                          <ReactMarkdown>{contentValue}</ReactMarkdown>
                        ) : (
                          <p className="text-muted-foreground">Nothing to preview yet.</p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
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
                    <Textarea placeholder="A short description for SEO" {...field} disabled={isPending} />
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
                    <Input placeholder="https://" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="mt-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
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
