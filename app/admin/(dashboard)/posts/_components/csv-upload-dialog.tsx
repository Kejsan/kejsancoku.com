"use client"

import * as React from "react"
import { Upload, FileText, X, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

type CSVRow = {
  title: string
  slug: string
  content?: string
  metaDescription?: string
  featuredBanner?: string
  status?: "draft" | "scheduled" | "published"
  scheduledAt?: string
  publishedAt?: string
}

type CSVUploadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (rows: CSVRow[]) => Promise<void>
}

export function CSVUploadDialog({ open, onOpenChange, onUpload }: CSVUploadDialogProps) {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<CSVRow[]>([])
  const [totalRows, setTotalRows] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = React.useCallback(async (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Please select a CSV file")
      return
    }

    setFile(selectedFile)
    setPreview([])
    setTotalRows(0)

    try {
      const text = await selectedFile.text()
      const lines = text.split("\n").filter((line) => line.trim())
      if (lines.length < 2) {
        toast.error("CSV file must have at least a header row and one data row")
        setFile(null)
        return
      }

      // Parse CSV (simple parser - handles quoted fields)
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = []
        let current = ""
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"'
              i++
            } else {
              inQuotes = !inQuotes
            }
          } else if (char === "," && !inQuotes) {
            result.push(current.trim())
            current = ""
          } else {
            current += char
          }
        }
        result.push(current.trim())
        return result
      }

      const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim())
      const requiredHeaders = ["title", "slug"]
      const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))

      if (missingHeaders.length > 0) {
        toast.error(`Missing required columns: ${missingHeaders.join(", ")}`)
        setFile(null)
        return
      }

      const rows: CSVRow[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i])
        if (values.length !== headers.length) {
          toast.error(`Row ${i + 1} has incorrect number of columns`)
          continue
        }

        const row: CSVRow = {} as CSVRow
        headers.forEach((header, index) => {
          const value = values[index]?.trim() || ""
          if (header === "title" || header === "slug") {
            row[header as keyof CSVRow] = value
          } else if (header === "content" || header === "metadescription" || header === "featuredbanner") {
            row[header === "metadescription" ? "metaDescription" : header === "featuredbanner" ? "featuredBanner" : header as keyof CSVRow] = value || undefined
          } else if (header === "status") {
            const status = value.toLowerCase()
            if (["draft", "scheduled", "published"].includes(status)) {
              row.status = status as "draft" | "scheduled" | "published"
            }
          } else if (header === "scheduledat" || header === "publishedat") {
            row[header === "scheduledat" ? "scheduledAt" : "publishedAt" as keyof CSVRow] = value || undefined
          }
        })

        if (row.title && row.slug) {
          rows.push(row)
        }
      }

      if (rows.length === 0) {
        toast.error("No valid rows found in CSV file")
        setFile(null)
        return
      }

      setPreview(rows.slice(0, 5)) // Show first 5 rows as preview
      setTotalRows(rows.length)
      toast.success(`Parsed ${rows.length} post${rows.length !== 1 ? "s" : ""} from CSV`)
    } catch (error) {
      console.error("Failed to parse CSV", error)
      toast.error("Failed to parse CSV file. Please check the format.")
      setFile(null)
      setPreview([])
      setTotalRows(0)
    }
  }, [])

  const handleUpload = React.useCallback(async () => {
    if (!file || preview.length === 0) return

    setIsProcessing(true)
    try {
      // Re-parse the full file
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = []
        let current = ""
        let inQuotes = false
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"'
              i++
            } else {
              inQuotes = !inQuotes
            }
          } else if (char === "," && !inQuotes) {
            result.push(current.trim())
            current = ""
          } else {
            current += char
          }
        }
        result.push(current.trim())
        return result
      }

      const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim())
      const rows: CSVRow[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i])
        if (values.length !== headers.length) continue

        const row: CSVRow = {} as CSVRow
        headers.forEach((header, index) => {
          const value = values[index]?.trim() || ""
          if (header === "title" || header === "slug") {
            row[header as keyof CSVRow] = value
          } else if (header === "content" || header === "metadescription" || header === "featuredbanner") {
            row[header === "metadescription" ? "metaDescription" : header === "featuredbanner" ? "featuredBanner" : header as keyof CSVRow] = value || undefined
          } else if (header === "status") {
            const status = value.toLowerCase()
            if (["draft", "scheduled", "published"].includes(status)) {
              row.status = status as "draft" | "scheduled" | "published"
            }
          } else if (header === "scheduledat" || header === "publishedat") {
            row[header === "scheduledat" ? "scheduledAt" : "publishedAt" as keyof CSVRow] = value || undefined
          }
        })

        if (row.title && row.slug) {
          rows.push(row)
        }
      }

      await onUpload(rows)
      setFile(null)
      setPreview([])
      setTotalRows(0)
      onOpenChange(false)
    } catch (error) {
      console.error("Upload failed", error)
      toast.error("Failed to upload posts")
    } finally {
      setIsProcessing(false)
    }
  }, [file, preview, onUpload, onOpenChange])

  const handleReset = React.useCallback(() => {
    setFile(null)
    setPreview([])
    setTotalRows(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const displayRowCount = totalRows > 0 ? totalRows : preview.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Posts from CSV</DialogTitle>
          <DialogDescription>
            Upload multiple posts at once using a CSV file. Required columns: title, slug. Optional: content, metaDescription, featuredBanner, status, scheduledAt, publishedAt
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0]
                  if (selectedFile) {
                    handleFileSelect(selectedFile)
                  }
                }}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {file ? file.name : "Select CSV file"}
              </Button>
              {file && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>Preview (first {preview.length} of {displayRowCount} rows)</Label>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Title</th>
                        <th className="px-3 py-2 text-left font-medium">Slug</th>
                        <th className="px-3 py-2 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-3 py-2">{row.title}</td>
                          <td className="px-3 py-2 font-mono text-xs">{row.slug}</td>
                          <td className="px-3 py-2">{row.status || "draft"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>CSV Format:</strong> First row must contain headers: title, slug (required), and optionally: content, metaDescription, featuredBanner, status, scheduledAt, publishedAt. Use quotes for fields containing commas.
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || preview.length === 0 || isProcessing}>
            {isProcessing ? "Uploading..." : `Upload ${displayRowCount > 0 ? displayRowCount : ""} Post${displayRowCount !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
