import { z } from 'zod'

export interface TroubleshootingImageItem {
  id: string
  recordId?: string
  caption: string
  url: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  createdAt?: string
}

export interface TroubleshootingRecordWithImages {
  id: string
  aircraftType: string
  aircraftRegistration: string
  aircraftMSN?: string | null
  effectivity?: string | null
  date: string
  ATAChapter: string
  ATASection?: string | null
  defect: string
  troubleshootingAction?: string | null
  finding?: string | null
  rectification?: string | null
  result: string
  partNumber?: string | null
  serialNumber?: string | null
  jobCardNumber?: string | null
  workOrderNumber?: string | null
  referenceDocument?: string | null
  technicianName: string
  notes?: string | null
  isPinned: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  images: TroubleshootingImageItem[]
}

export const troubleshootingFormSchema = z
  .object({
    aircraftType: z.string().min(1, 'Aircraft type is required'),
    aircraftRegistration: z
      .string()
      .min(2, 'Registration is required')
      .transform((val) => val.trim().toUpperCase()),
    aircraftMSN: z.string().optional().default(''),
    effectivity: z.string().optional().default(''),
    date: z.string().min(1, 'Date is required'),
    ATAChapter: z.string().min(1, 'ATA Chapter is required'),
    ATASection: z.string().optional().default(''),
    defect: z.string().min(5, 'Defect description must be at least 5 characters'),
    troubleshootingAction: z.string().optional().default(''),
    finding: z.string().optional().default(''),
    rectification: z.string().optional().default(''),
    result: z.string().min(1, 'Result is required'),
    partNumber: z.string().optional().default(''),
    serialNumber: z.string().optional().default(''),
    jobCardNumber: z.string().optional().default(''),
    workOrderNumber: z.string().optional().default(''),
    referenceDocument: z.string().optional().default(''),
    technicianName: z.string().min(2, 'Technician name is required'),
    notes: z.string().optional().default(''),
    isPinned: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    images: z
      .array(
        z.object({
          id: z.string(),
          caption: z.string(),
          url: z.string(),
          fileName: z.string().optional(),
          fileSize: z.number().optional(),
          mimeType: z.string().optional(),
        })
      )
      .default([]),
  })
  .refine(
    (data) => {
      const hasAction = data.troubleshootingAction && data.troubleshootingAction.trim().length > 0
      const hasFinding = data.finding && data.finding.trim().length > 0
      return Boolean(hasAction || hasFinding)
    },
    {
      message: 'At least one of "Troubleshooting Action" or "Finding" must be provided',
      path: ['troubleshootingAction'],
    }
  )

export type TroubleshootingFormData = z.infer<typeof troubleshootingFormSchema>

export interface SearchFilterParams {
  query?: string
  aircraftRegistration?: string
  ATAChapter?: string
  startDate?: string
  endDate?: string
  monthYear?: string
  result?: string
  tag?: string
  pinnedOnly?: boolean
  limit?: number
  offset?: number
}

export interface DashboardStats {
  totalRecords: number
  totalAircraft: number
  recordsThisMonth: number
  pinnedRecords: number
  topATAChapters: { chapter: string; count: number }[]
  recentRecords: TroubleshootingRecordWithImages[]
  recentlyUpdated: TroubleshootingRecordWithImages[]
}
