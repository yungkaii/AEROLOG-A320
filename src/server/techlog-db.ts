import { db, ensureDatabaseInitialized, client } from '../db/index'
import * as schema from '../db/schema'
import { eq, desc, and, or, like, sql } from 'drizzle-orm'
import type {
  TroubleshootingFormData,
  SearchFilterParams,
  TroubleshootingRecordWithImages,
  DashboardStats,
  TroubleshootingImageItem,
} from '../types/techlog'

function parseTags(tagsStr: string | null | undefined): string[] {
  if (!tagsStr) return []
  try {
    const parsed = JSON.parse(tagsStr)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// 1. Dashboard Stats
export async function getDashboardStats(): Promise<DashboardStats> {
  await ensureDatabaseInitialized()

  const totalRes = await client.execute('SELECT COUNT(*) as count FROM troubleshooting_records;')
  const totalRecords = Number(totalRes.rows[0]?.count ?? 0)

  const aircraftRes = await client.execute('SELECT COUNT(DISTINCT aircraft_registration) as count FROM troubleshooting_records;')
  const totalAircraft = Number(aircraftRes.rows[0]?.count ?? 0)

  const now = new Date()
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthRes = await client.execute({
    sql: 'SELECT COUNT(*) as count FROM troubleshooting_records WHERE date LIKE ?;',
    args: [`${currentYearMonth}%`],
  })
  const recordsThisMonth = Number(monthRes.rows[0]?.count ?? 0)

  const pinnedRes = await client.execute('SELECT COUNT(*) as count FROM troubleshooting_records WHERE is_pinned = 1;')
  const pinnedRecords = Number(pinnedRes.rows[0]?.count ?? 0)

  // Top ATA Chapters
  const topAtaRes = await client.execute(`
    SELECT ata_chapter, COUNT(*) as count 
    FROM troubleshooting_records 
    GROUP BY ata_chapter 
    ORDER BY count DESC 
    LIMIT 6;
  `)
  const topATAChapters = topAtaRes.rows.map((row) => ({
    chapter: String(row.ata_chapter),
    count: Number(row.count),
  }))

  // Recent Records
  const recentRows = await db
    .select()
    .from(schema.troubleshootingRecords)
    .orderBy(desc(schema.troubleshootingRecords.date), desc(schema.troubleshootingRecords.createdAt))
    .limit(5)

  const recentRecords = await attachImagesToRecords(recentRows)

  // Recently Updated
  const updatedRows = await db
    .select()
    .from(schema.troubleshootingRecords)
    .orderBy(desc(schema.troubleshootingRecords.updatedAt))
    .limit(5)

  const recentlyUpdated = await attachImagesToRecords(updatedRows)

  return {
    totalRecords,
    totalAircraft,
    recordsThisMonth,
    pinnedRecords,
    topATAChapters,
    recentRecords,
    recentlyUpdated,
  }
}

// Helper to attach images
async function attachImagesToRecords(records: schema.TroubleshootingRecord[]): Promise<TroubleshootingRecordWithImages[]> {
  if (records.length === 0) return []

  const recordIds = records.map((r) => r.id)
  const allImages = await db
    .select()
    .from(schema.troubleshootingImages)
    .where(
      sql`${schema.troubleshootingImages.recordId} IN (${sql.join(
        recordIds.map((id) => sql`${id}`),
        sql`, `
      )})`
    )

  const imageMap = new Map<string, TroubleshootingImageItem[]>()
  for (const img of allImages) {
    const list = imageMap.get(img.recordId) || []
    list.push({
      id: img.id,
      recordId: img.recordId,
      caption: img.caption,
      url: img.url,
      fileName: img.fileName ?? undefined,
      fileSize: img.fileSize ?? undefined,
      mimeType: img.mimeType ?? undefined,
      createdAt: img.createdAt,
    })
    imageMap.set(img.recordId, list)
  }

  return records.map((r) => ({
    id: r.id,
    aircraftType: r.aircraftType,
    aircraftRegistration: r.aircraftRegistration,
    aircraftMSN: r.aircraftMSN,
    effectivity: r.effectivity,
    faultMessage: r.faultMessage,
    troubleshootingManual: r.troubleshootingManual,
    date: r.date,
    ATAChapter: r.ATAChapter,
    ATASection: r.ATASection,
    defect: r.defect,
    troubleshootingAction: r.troubleshootingAction,
    finding: r.finding,
    rectification: r.rectification,
    result: r.result,
    partNumber: r.partNumber,
    serialNumber: r.serialNumber,
    jobCardNumber: r.jobCardNumber,
    workOrderNumber: r.workOrderNumber,
    referenceDocument: r.referenceDocument,
    technicianName: r.technicianName,
    notes: r.notes,
    isPinned: Boolean(r.isPinned),
    tags: parseTags(r.tags),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    images: imageMap.get(r.id) || [],
  }))
}

// 2. Search & Filter
export async function searchTroubleshootingRecords(params: SearchFilterParams): Promise<{
  records: TroubleshootingRecordWithImages[]
  total: number
}> {
  await ensureDatabaseInitialized()

  const conditions = []

  if (params.query && params.query.trim()) {
    const rawQuery = params.query.trim()
    const words = rawQuery.toLowerCase().split(/\s+/).filter((w) => w.length > 0)

    for (const word of words) {
      const w = `%${word}%`
      conditions.push(
        or(
          like(sql`lower(${schema.troubleshootingRecords.defect})`, w),
          like(sql`lower(${schema.troubleshootingRecords.finding})`, w),
          like(sql`lower(${schema.troubleshootingRecords.troubleshootingAction})`, w),
          like(sql`lower(${schema.troubleshootingRecords.rectification})`, w),
          like(sql`lower(${schema.troubleshootingRecords.aircraftRegistration})`, w),
          like(sql`lower(coalesce(${schema.troubleshootingRecords.effectivity}, ''))`, w),
          like(sql`lower(coalesce(${schema.troubleshootingRecords.faultMessage}, ''))`, w),
          like(sql`lower(coalesce(${schema.troubleshootingRecords.troubleshootingManual}, ''))`, w),
          like(sql`lower(${schema.troubleshootingRecords.ATAChapter})`, w),
          like(sql`lower(${schema.troubleshootingRecords.partNumber})`, w),
          like(sql`lower(${schema.troubleshootingRecords.jobCardNumber})`, w),
          like(sql`lower(${schema.troubleshootingRecords.workOrderNumber})`, w),
          like(sql`lower(${schema.troubleshootingRecords.technicianName})`, w),
          like(sql`lower(${schema.troubleshootingRecords.notes})`, w),
          like(sql`lower(${schema.troubleshootingRecords.tags})`, w)
        )
      )
    }

    // Save to recent searches
    await addRecentSearch(rawQuery)
  }

  if (params.aircraftRegistration && params.aircraftRegistration !== 'ALL') {
    conditions.push(eq(schema.troubleshootingRecords.aircraftRegistration, params.aircraftRegistration))
  }

  if (params.ATAChapter && params.ATAChapter !== 'ALL') {
    conditions.push(eq(schema.troubleshootingRecords.ATAChapter, params.ATAChapter))
  }

  if (params.result && params.result !== 'ALL') {
    conditions.push(eq(schema.troubleshootingRecords.result, params.result))
  }

  if (params.startDate) {
    conditions.push(sql`${schema.troubleshootingRecords.date} >= ${params.startDate}`)
  }

  if (params.endDate) {
    conditions.push(sql`${schema.troubleshootingRecords.date} <= ${params.endDate}`)
  }

  if (params.monthYear) {
    conditions.push(like(schema.troubleshootingRecords.date, `${params.monthYear}%`))
  }

  if (params.pinnedOnly) {
    conditions.push(eq(schema.troubleshootingRecords.isPinned, true))
  }

  if (params.tag && params.tag !== 'ALL') {
    conditions.push(like(schema.troubleshootingRecords.tags, `%${params.tag}%`))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(schema.troubleshootingRecords)

  if (whereClause) {
    countQuery.where(whereClause)
  }
  const countRes = await countQuery
  const total = Number(countRes[0]?.count ?? 0)

  const limit = params.limit || 50
  const offset = params.offset || 0

  const recordsQuery = db
    .select()
    .from(schema.troubleshootingRecords)
    .orderBy(desc(schema.troubleshootingRecords.date), desc(schema.troubleshootingRecords.createdAt))
    .limit(limit)
    .offset(offset)

  if (whereClause) {
    recordsQuery.where(whereClause)
  }

  const rows = await recordsQuery
  const records = await attachImagesToRecords(rows)

  return { records, total }
}

// 3. Get By ID
export async function getTroubleshootingRecordById(id: string): Promise<{
  record: TroubleshootingRecordWithImages | null
  relatedRecords: TroubleshootingRecordWithImages[]
}> {
  await ensureDatabaseInitialized()

  const rows = await db
    .select()
    .from(schema.troubleshootingRecords)
    .where(eq(schema.troubleshootingRecords.id, id))
    .limit(1)

  if (rows.length === 0) {
    return { record: null, relatedRecords: [] }
  }

  const [fullRecord] = await attachImagesToRecords(rows)

  // Find related records: same ATA Chapter or same Registration, excluding current ID
  const relatedRows = await db
    .select()
    .from(schema.troubleshootingRecords)
    .where(
      and(
        sql`${schema.troubleshootingRecords.id} != ${id}`,
        or(
          eq(schema.troubleshootingRecords.ATAChapter, fullRecord.ATAChapter),
          eq(schema.troubleshootingRecords.aircraftRegistration, fullRecord.aircraftRegistration)
        )
      )
    )
    .orderBy(desc(schema.troubleshootingRecords.date))
    .limit(4)

  const relatedRecords = await attachImagesToRecords(relatedRows)

  return { record: fullRecord, relatedRecords }
}

// 4. Create Record
export async function createTroubleshootingRecord(data: TroubleshootingFormData): Promise<TroubleshootingRecordWithImages> {
  await ensureDatabaseInitialized()

  const id = `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const now = new Date().toISOString()

  const newRecord = {
    id,
    aircraftType: data.aircraftType,
    aircraftRegistration: data.aircraftRegistration.toUpperCase(),
    aircraftMSN: data.aircraftMSN || null,
    effectivity: data.effectivity || null,
    faultMessage: data.faultMessage || null,
    troubleshootingManual: data.troubleshootingManual || null,
    date: data.date,
    ATAChapter: data.ATAChapter,
    ATASection: data.ATASection || null,
    defect: data.defect,
    troubleshootingAction: data.troubleshootingAction || null,
    finding: data.finding || null,
    rectification: data.rectification || null,
    result: data.result,
    partNumber: data.partNumber || null,
    serialNumber: data.serialNumber || null,
    jobCardNumber: data.jobCardNumber || null,
    workOrderNumber: data.workOrderNumber || null,
    referenceDocument: data.referenceDocument || null,
    technicianName: data.technicianName,
    notes: data.notes || null,
    isPinned: Boolean(data.isPinned),
    tags: JSON.stringify(data.tags || []),
    createdAt: now,
    updatedAt: now,
  }

  await db.insert(schema.troubleshootingRecords).values(newRecord)

  // Insert Images
  if (data.images && data.images.length > 0) {
    for (const img of data.images) {
      await db.insert(schema.troubleshootingImages).values({
        id: img.id || `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        recordId: id,
        caption: img.caption || 'Evidence Photo',
        url: img.url,
        fileName: img.fileName || null,
        fileSize: img.fileSize || null,
        mimeType: img.mimeType || 'image/jpeg',
        createdAt: now,
      })
    }
  }

  const created = await getTroubleshootingRecordById(id)
  return created.record!
}

// 5. Update Record
export async function updateTroubleshootingRecord(
  id: string,
  data: TroubleshootingFormData
): Promise<TroubleshootingRecordWithImages> {
  await ensureDatabaseInitialized()

  const now = new Date().toISOString()

  await db
    .update(schema.troubleshootingRecords)
    .set({
      aircraftType: data.aircraftType,
      aircraftRegistration: data.aircraftRegistration.toUpperCase(),
      aircraftMSN: data.aircraftMSN || null,
      effectivity: data.effectivity || null,
      faultMessage: data.faultMessage || null,
      troubleshootingManual: data.troubleshootingManual || null,
      date: data.date,
      ATAChapter: data.ATAChapter,
      ATASection: data.ATASection || null,
      defect: data.defect,
      troubleshootingAction: data.troubleshootingAction || null,
      finding: data.finding || null,
      rectification: data.rectification || null,
      result: data.result,
      partNumber: data.partNumber || null,
      serialNumber: data.serialNumber || null,
      jobCardNumber: data.jobCardNumber || null,
      workOrderNumber: data.workOrderNumber || null,
      referenceDocument: data.referenceDocument || null,
      technicianName: data.technicianName,
      notes: data.notes || null,
      isPinned: Boolean(data.isPinned),
      tags: JSON.stringify(data.tags || []),
      updatedAt: now,
    })
    .where(eq(schema.troubleshootingRecords.id, id))

  // Sync images: delete existing and reinsert updated image list
  await db.delete(schema.troubleshootingImages).where(eq(schema.troubleshootingImages.recordId, id))

  if (data.images && data.images.length > 0) {
    for (const img of data.images) {
      await db.insert(schema.troubleshootingImages).values({
        id: img.id || `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        recordId: id,
        caption: img.caption || 'Evidence Photo',
        url: img.url,
        fileName: img.fileName || null,
        fileSize: img.fileSize || null,
        mimeType: img.mimeType || 'image/jpeg',
        createdAt: ('createdAt' in img && typeof (img as { createdAt?: string }).createdAt === 'string' ? (img as { createdAt?: string }).createdAt : now) || now,
      })
    }
  }

  const updated = await getTroubleshootingRecordById(id)
  return updated.record!
}

// 6. Delete Record
export async function deleteTroubleshootingRecord(id: string): Promise<boolean> {
  await ensureDatabaseInitialized()
  await db.delete(schema.troubleshootingImages).where(eq(schema.troubleshootingImages.recordId, id))
  await db.delete(schema.troubleshootingRecords).where(eq(schema.troubleshootingRecords.id, id))
  return true
}

// 7. Toggle Pin
export async function togglePinTroubleshootingRecord(id: string): Promise<boolean> {
  await ensureDatabaseInitialized()
  const rows = await db
    .select({ isPinned: schema.troubleshootingRecords.isPinned })
    .from(schema.troubleshootingRecords)
    .where(eq(schema.troubleshootingRecords.id, id))
    .limit(1)

  if (rows.length === 0) return false

  const newPinned = !rows[0].isPinned
  await db
    .update(schema.troubleshootingRecords)
    .set({ isPinned: newPinned, updatedAt: new Date().toISOString() })
    .where(eq(schema.troubleshootingRecords.id, id))

  return newPinned
}

// 8. Recent Searches
export async function getRecentSearches(): Promise<string[]> {
  await ensureDatabaseInitialized()
  const rows = await db
    .select()
    .from(schema.recentSearches)
    .orderBy(desc(schema.recentSearches.createdAt))
    .limit(8)
  return rows.map((r) => r.query)
}

export async function addRecentSearch(query: string): Promise<void> {
  if (!query || query.trim().length < 2) return
  const q = query.trim()
  const id = `rs_${Date.now()}`
  
  // Remove duplicate if exists
  await client.execute({
    sql: 'DELETE FROM recent_searches WHERE lower(query) = ?;',
    args: [q.toLowerCase()],
  })

  await db.insert(schema.recentSearches).values({
    id,
    query: q,
    createdAt: new Date().toISOString(),
  })

  // Keep max 15 recent searches
  await client.execute(`
    DELETE FROM recent_searches WHERE id NOT IN (
      SELECT id FROM recent_searches ORDER BY created_at DESC LIMIT 15
    );
  `)
}

export async function clearRecentSearches(): Promise<void> {
  await client.execute('DELETE FROM recent_searches;')
}

// 9. Distinct Filters
export async function getFilterOptions(): Promise<{
  registrations: string[]
  ataChapters: string[]
  tags: string[]
}> {
  await ensureDatabaseInitialized()

  const regRows = await client.execute('SELECT DISTINCT aircraft_registration FROM troubleshooting_records ORDER BY aircraft_registration ASC;')
  const registrations = regRows.rows.map((r) => String(r.aircraft_registration))

  const ataRows = await client.execute('SELECT DISTINCT ata_chapter FROM troubleshooting_records ORDER BY CAST(ata_chapter AS INTEGER) ASC, ata_chapter ASC;')
  const ataChapters = ataRows.rows.map((r) => String(r.ata_chapter))

  const tagRows = await client.execute('SELECT tags FROM troubleshooting_records;')
  const tagSet = new Set<string>()
  for (const row of tagRows.rows) {
    const list = parseTags(String(row.tags))
    for (const t of list) {
      if (t) tagSet.add(t)
    }
  }

  return {
    registrations,
    ataChapters,
    tags: Array.from(tagSet),
  }
}
