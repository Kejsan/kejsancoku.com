"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { updatePost } from "../../actions"
import { postFormSchema, type PostFormValues } from "../../schema"
import { type SerializedPost } from "../../serializers"

interface EditPostPageProps {
  params: {
    id: string
  }
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      metaDescription: "",
      featuredBanner: "",
      status: "draft",
    },
  })

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${params.id}`)
        if (!res.ok) throw new Error("Failed to fetch post")
        const post: SerializedPost = await res.json()
        
        form.reset({
          title: post.title,
          slug: post.slug,
          content: post.content || "",
          metaDescription: post.metaDescription || "",
          featuredBanner: post.featuredBanner || "",
          status: post.status,
          scheduledAt: post.scheduledAt || undefined,
          publishedAt: post.publishedAt || undefined,
        })
      } catch (error) {
        toast.error("Failed to load post")
        router.push("/admin/posts")
      } finally {
        setIsLoading(false)
      }
    }
    fetchPost()
  }, [params.id, form, router])

  async function onSubmit(values: PostFormValues) {
    setIsPending(true)
    try {
      const result = await updatePost(parseInt(params.id), values)
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      toast.success("Post updated successfully")
      router.push("/admin/posts")
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsPending(false)
    }
  }

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Post</h1>
          <p className="text-sm text-muted-foreground">
            Make changes to your blog post.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
            <div className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Post title" {...field} />
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
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Write your post content here..."
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
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief summary for SEO"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Used for search engines and social media previews.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-8">
              <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                <h3 className="mb-4 font-semibold">Publishing</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                          </SelectContent>
                        </Select>
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
                          <Input placeholder="url-friendly-slug" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave empty to auto-generate from title.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("status") === "scheduled" && (
                    <FormField
                      control={form.control}
                      name="scheduledAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schedule Date</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              value={
                                field.value
                                  ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm")
                                  : ""
                              }
                              onChange={(e) => {
                                const date = new Date(e.target.value)
                                field.onChange(date.toISOString())
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                <h3 className="mb-4 font-semibold">Media</h3>
                <FormField
                  control={form.control}
                  name="featuredBanner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Save Changes" : "Update Post"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
