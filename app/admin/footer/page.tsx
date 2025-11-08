"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface SiteSettings {
  id?: number
  copyright?: string
  linkedin?: string
  github?: string
  twitter?: string
  threads?: string
  email?: string
}

export default function FooterPage() {
  const [data, setData] = useState<SiteSettings>({})

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await fetch("/api/footer")
      const json = await res.json()
      if (json) setData(json)
    }
    fetchSettings()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setData({ ...data, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await fetch("/api/footer", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Footer Management</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          name="copyright"
          value={data.copyright || ""}
          onChange={handleChange}
          placeholder="Copyright"
          className="border p-2 w-full"
        />
        <input
          name="linkedin"
          value={data.linkedin || ""}
          onChange={handleChange}
          placeholder="LinkedIn URL"
          className="border p-2 w-full"
        />
        <input
          name="github"
          value={data.github || ""}
          onChange={handleChange}
          placeholder="GitHub URL"
          className="border p-2 w-full"
        />
        <input
          name="twitter"
          value={data.twitter || ""}
          onChange={handleChange}
          placeholder="Twitter URL"
          className="border p-2 w-full"
        />
        <input
          name="threads"
          value={data.threads || ""}
          onChange={handleChange}
          placeholder="Threads URL"
          className="border p-2 w-full"
        />
        <input
          type="email"
          name="email"
          value={data.email || ""}
          onChange={handleChange}
          placeholder="Email"
          className="border p-2 w-full"
        />
        <Button type="submit">Save</Button>
      </form>
    </div>
  )
}
