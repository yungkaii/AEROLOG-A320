import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const troubleshootingRecords = sqliteTable('troubleshooting_records', {
  id: text('id').primaryKey(),
  aircraftType: text('aircraft_type').notNull(),
  aircraftRegistration: text('aircraft_registration').notNull(),
  aircraftMSN: text('aircraft_msn'),
  effectivity: text('effectivity'),
  date: text('date').notNull(),
  ATAChapter: text('ata_chapter').notNull(),
  ATASection: text('ata_section'),
  defect: text('defect').notNull(),
  troubleshootingAction: text('troubleshooting_action'),
  finding: text('finding'),
  rectification: text('rectification'),
  result: text('result').notNull(),
  partNumber: text('part_number'),
  serialNumber: text('serial_number'),
  jobCardNumber: text('job_card_number'),
  workOrderNumber: text('work_order_number'),
  referenceDocument: text('reference_document'),
  technicianName: text('technician_name').notNull(),
  notes: text('notes'),
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  tags: text('tags').notNull().default('[]'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const troubleshootingImages = sqliteTable('troubleshooting_images', {
  id: text('id').primaryKey(),
  recordId: text('record_id').notNull(),
  caption: text('caption').notNull(),
  url: text('url').notNull(),
  fileName: text('file_name'),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  createdAt: text('created_at').notNull(),
})

export const recentSearches = sqliteTable('recent_searches', {
  id: text('id').primaryKey(),
  query: text('query').notNull(),
  createdAt: text('created_at').notNull(),
})

export type TroubleshootingRecord = typeof troubleshootingRecords.$inferSelect
export type NewTroubleshootingRecord = typeof troubleshootingRecords.$inferInsert
export type TroubleshootingImage = typeof troubleshootingImages.$inferSelect
export type NewTroubleshootingImage = typeof troubleshootingImages.$inferInsert
export type RecentSearch = typeof recentSearches.$inferSelect
