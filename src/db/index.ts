import { createClient, type Client } from '@libsql/client'
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql'
import * as schema from './schema'

// Local SQLite database file or Turso Cloud LibSQL URL
const dbUrl = process.env.DATABASE_URL || 'file:./airbus_techlog.db'
const dbAuthToken = process.env.DATABASE_AUTH_TOKEN

let _client: Client | null = null
let _db: LibSQLDatabase<typeof schema> | null = null

export function getClient(): Client {
  if (typeof window !== 'undefined') {
    throw new Error('Database client cannot be executed in the browser.')
  }
  if (!_client) {
    _client = createClient({
      url: dbUrl,
      authToken: dbAuthToken,
    })
  }
  return _client
}

export function getDb(): LibSQLDatabase<typeof schema> {
  if (!_db) {
    _db = drizzle(getClient(), { schema })
  }
  return _db
}

export const client = new Proxy({} as Client, {
  get(_, prop) {
    const target = getClient() as any
    const val = target[prop]
    return typeof val === 'function' ? val.bind(target) : val
  },
})

export const db = new Proxy({} as LibSQLDatabase<typeof schema>, {
  get(_, prop) {
    const target = getDb() as any
    const val = target[prop]
    return typeof val === 'function' ? val.bind(target) : val
  },
})

let isInitialized = false

export async function ensureDatabaseInitialized() {
  if (isInitialized) return
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS troubleshooting_records (
      id TEXT PRIMARY KEY,
      aircraft_type TEXT NOT NULL,
      aircraft_registration TEXT NOT NULL,
      aircraft_msn TEXT,
      date TEXT NOT NULL,
      ata_chapter TEXT NOT NULL,
      ata_section TEXT,
      defect TEXT NOT NULL,
      troubleshooting_action TEXT,
      finding TEXT,
      rectification TEXT,
      result TEXT NOT NULL,
      part_number TEXT,
      serial_number TEXT,
      job_card_number TEXT,
      work_order_number TEXT,
      reference_document TEXT,
      technician_name TEXT NOT NULL,
      notes TEXT,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      tags TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS troubleshooting_images (
      id TEXT PRIMARY KEY,
      record_id TEXT NOT NULL,
      caption TEXT NOT NULL,
      url TEXT NOT NULL,
      file_name TEXT,
      file_size INTEGER,
      mime_type TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (record_id) REFERENCES troubleshooting_records(id) ON DELETE CASCADE
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS recent_searches (
      id TEXT PRIMARY KEY,
      query TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `)

  // Indexes for high performance searches
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_tr_reg ON troubleshooting_records(aircraft_registration);`)
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_tr_ata ON troubleshooting_records(ata_chapter);`)
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_tr_date ON troubleshooting_records(date DESC);`)
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_tr_pinned ON troubleshooting_records(is_pinned);`)

  // Check if we need to seed demo data
  const countRes = await client.execute('SELECT COUNT(*) as count FROM troubleshooting_records;')
  const count = Number(countRes.rows[0]?.count ?? 0)

  if (count === 0) {
    await seedDemoData()
  }

  isInitialized = true
}

// Generate realistic SVG image Data URIs for evidence
function createEvidenceSvg(type: 'steering' | 'hydraulic' | 'bleed' | 'brake' | 'sensor', title: string, subtitle: string): string {
  const colors: Record<string, { bg: string; accent: string; stroke: string }> = {
    steering: { bg: '#0f172a', accent: '#0284c7', stroke: '#38bdf8' },
    hydraulic: { bg: '#1c1917', accent: '#ea580c', stroke: '#f97316' },
    bleed: { bg: '#1e1b4b', accent: '#6366f1', stroke: '#818cf8' },
    brake: { bg: '#172554', accent: '#2563eb', stroke: '#60a5fa' },
    sensor: { bg: '#064e3b', accent: '#059669', stroke: '#34d399' },
  }
  const theme = colors[type] || colors.steering

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <rect width="800" height="500" fill="${theme.bg}"/>
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="800" height="500" fill="url(#grid)" />
    
    <!-- Header banner -->
    <rect x="30" y="30" width="740" height="70" rx="8" fill="rgba(255,255,255,0.04)" stroke="${theme.stroke}" stroke-opacity="0.3"/>
    <text x="50" y="62" fill="#f8fafc" font-family="monospace, sans-serif" font-size="20" font-weight="bold">A320 MAINTENANCE EVIDENCE [DEMO DATA]</text>
    <text x="50" y="86" fill="${theme.stroke}" font-family="monospace, sans-serif" font-size="14">${title} • ${subtitle}</text>
    
    <!-- Technical schematic canvas box -->
    <rect x="30" y="120" width="740" height="310" rx="8" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.1)"/>
    
    <!-- Schematic lines & icons -->
    <circle cx="200" cy="270" r="80" fill="none" stroke="${theme.stroke}" stroke-width="3" stroke-dasharray="6 4"/>
    <circle cx="200" cy="270" r="40" fill="${theme.accent}" fill-opacity="0.2" stroke="${theme.stroke}" stroke-width="2"/>
    <line x1="200" y1="150" x2="200" y2="390" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="3 3"/>
    <line x1="80" y1="270" x2="320" y2="270" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="3 3"/>
    
    <text x="200" y="275" fill="#ffffff" font-family="monospace" font-size="13" text-anchor="middle" font-weight="bold">INSPECTED</text>
    <text x="200" y="295" fill="${theme.stroke}" font-family="monospace" font-size="11" text-anchor="middle">LIMIT CHECK OK</text>
    
    <!-- Flow arrows -->
    <line x1="280" y1="270" x2="440" y2="270" stroke="${theme.stroke}" stroke-width="2" marker-end="url(#arrow)"/>
    <polyline points="430,265 440,270 430,275" fill="none" stroke="${theme.stroke}" stroke-width="2"/>
    
    <!-- Data readout panel -->
    <rect x="460" y="150" width="280" height="240" rx="6" fill="rgba(255,255,255,0.03)" stroke="${theme.stroke}" stroke-opacity="0.4"/>
    <text x="480" y="185" fill="#94a3b8" font-family="monospace" font-size="12">STATUS: RECTIFIED</text>
    <text x="480" y="215" fill="#f8fafc" font-family="monospace" font-size="13" font-weight="bold">SPECIFICATION CHECK:</text>
    <text x="480" y="240" fill="${theme.stroke}" font-family="monospace" font-size="12">✓ Resistance: 4.8 Ω (Normal)</text>
    <text x="480" y="265" fill="${theme.stroke}" font-family="monospace" font-size="12">✓ Clearance: 0.045 in</text>
    <text x="480" y="290" fill="${theme.stroke}" font-family="monospace" font-size="12">✓ Torqued to AMM Spec</text>
    <text x="480" y="315" fill="${theme.stroke}" font-family="monospace" font-size="12">✓ BITE Test: Satisfactory</text>
    <text x="480" y="355" fill="#64748b" font-family="monospace" font-size="11">Tech ID: AME-A320 #41029</text>
    
    <!-- Footer status -->
    <text x="50" y="465" fill="#64748b" font-family="monospace, sans-serif" font-size="12">LOGGED EVIDENCE • AIRBUS A320 MAINTENANCE LOGBOOK</text>
  </svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

async function seedDemoData() {
  const now = new Date().toISOString()
  
  const demoRecords = [
    {
      id: 'demo_tr_001',
      aircraftType: 'A320-200 (CFM56)',
      aircraftRegistration: 'PK-AZA',
      aircraftMSN: 'MSN 5410',
      date: '2026-09-20',
      ATAChapter: '32',
      ATASection: '32-42',
      defect: '[DEMO DATA] ECAM Warning: WHEEL N/W STRG FAULT on taxi-out after pushback. Rudder pedal steering inoperative.',
      troubleshootingAction: 'Carried out CFDS BITE test on BSCU system 1 and 2 per TSM 32-42-00-810-801. Confirmed fault code 32-42-13 (Steering Feedback Sensor 2 signal discrepancy). Inspected wiring harness at nose landing gear strut and sensor connector 14GG.',
      finding: 'Found pin corrosion and moisture ingress at cannon plug connector 14GG-A pin 3 of the steering angle feedback sensor. Resistance measurement showed open circuit intermittently.',
      rectification: 'Cleaned connector pins using approved contact cleaner and dielectric grease per AMM 20-45-11. Re-seated cannon plug, verified lock wire, and performed BSCU Steering BITE test. Full lock-to-lock steering test completed with yellow hydraulic pressure applied.',
      result: 'Rectified - BITE Test OK',
      partNumber: 'C24248002',
      serialNumber: 'SN-04921B',
      jobCardNumber: 'JC-CGK-2609-082',
      workOrderNumber: 'WO-884210',
      referenceDocument: 'TSM 32-42-00-810-801, AMM 32-42-21-400-001',
      technicianName: 'Yuka (AME A320)',
      notes: 'Repeated defect reported 2 weeks ago during heavy rain in Denpasar. Weather sealant around 14GG connector was replaced to prevent future moisture intrusion.',
      isPinned: true,
      tags: JSON.stringify(['#repeated', '#sensor', '#hydraulic', '#electrical', '#bite-test']),
      createdAt: now,
      updatedAt: now,
      images: [
        {
          id: 'demo_img_001a',
          caption: 'Finding / Defect Evidence',
          url: createEvidenceSvg('steering', 'NWS Connector 14GG Pin 3', 'Corrosion & Moisture Found'),
          fileName: 'connector_14gg_corrosion.svg',
          fileSize: 18450,
          mimeType: 'image/svg+xml',
        },
        {
          id: 'demo_img_001b',
          caption: 'After Rectification / Clean Installation',
          url: createEvidenceSvg('steering', 'NWS Reassembled & Sealed', 'Dielectric Greased & Torqued'),
          fileName: 'nws_sensor_clean.svg',
          fileSize: 18400,
          mimeType: 'image/svg+xml',
        },
        {
          id: 'demo_img_001c',
          caption: 'MCDU / ECAM BITE Test Result',
          url: createEvidenceSvg('steering', 'MCDU BITE Test', 'BSCU 1 & 2 NO FAULT FOUND'),
          fileName: 'bscu_bite_test_ok.svg',
          fileSize: 17920,
          mimeType: 'image/svg+xml',
        },
      ],
    },
    {
      id: 'demo_tr_002',
      aircraftType: 'A320neo (CFM LEAP-1A)',
      aircraftRegistration: 'PK-GLA',
      aircraftMSN: 'MSN 9122',
      date: '2026-09-24',
      ATAChapter: '52',
      ATASection: '52-31',
      defect: '[DEMO DATA] Yellow hydraulic fluid dripping from Aft Cargo Door manual selector valve area during transit inspection.',
      troubleshootingAction: 'Pressurized Yellow hydraulic system using Yellow electric pump. Operated aft cargo door manual handpump lever to check for external leakage per AMM 52-31-00-200-001.',
      finding: 'Identified steady hydraulic seepage around selector valve shaft seal O-ring (exceeding AMM limits of 5 drops/min; measured 18 drops/min).',
      rectification: 'Depressurized Yellow system. Replaced backup ring and dynamic O-ring P/N NAS1611-010 on selector valve assembly. Torqued retaining collar to 45 in-lb per AMM 52-31-15-400-001. Performed 3 cycle open/close operational check under 3000 PSI.',
      result: 'Component Replaced & Ground Tested',
      partNumber: 'NAS1611-010',
      serialNumber: 'LOT-2025-Q4',
      jobCardNumber: 'JC-SUB-2609-119',
      workOrderNumber: 'WO-885402',
      referenceDocument: 'AMM 52-31-00-200-001, AMM 52-31-15-400-001',
      technicianName: 'Yuka (AME A320)',
      notes: 'Cargo door operates smoothly. No residual leaks detected after 20 minutes standing under 3000 PSI Yellow system pressure.',
      isPinned: true,
      tags: JSON.stringify(['#hydraulic', '#leak', '#component-change', '#inspection']),
      createdAt: now,
      updatedAt: now,
      images: [
        {
          id: 'demo_img_002a',
          caption: 'Finding / Defect Evidence',
          url: createEvidenceSvg('hydraulic', 'Aft Cargo Door Selector Valve', 'Hydraulic Seepage Past Limits'),
          fileName: 'cargo_door_valve_leak.svg',
          fileSize: 18100,
          mimeType: 'image/svg+xml',
        },
        {
          id: 'demo_img_002b',
          caption: 'Component Label / Part Number Plate',
          url: createEvidenceSvg('hydraulic', 'New O-Ring NAS1611-010', 'Batch Traceability Verified'),
          fileName: 'oring_replacement.svg',
          fileSize: 17800,
          mimeType: 'image/svg+xml',
        },
      ],
    },
    {
      id: 'demo_tr_003',
      aircraftType: 'A320-200 (IAE V2500)',
      aircraftRegistration: 'PK-SGF',
      aircraftMSN: 'MSN 4890',
      date: '2026-09-15',
      ATAChapter: '36',
      ATASection: '36-11',
      defect: '[DEMO DATA] Flight Crew Log: AIR ENG 1 BLEED FAULT triggered passing FL220 on climb. Bleed 1 switch OFF then ON did not recover.',
      troubleshootingAction: 'Accessed MCDU CFDS BITE test menu for BMC 1 (Bleed Monitoring Computer). Extracted PFR: FAULT 36-11-01 BLEED PRV 1 NOT FULLY OPEN. Carried out visual inspection of Engine 1 core compartment for pneumatic duct leakage and sense line integrity.',
      finding: 'Found sense line B-nut loose at the pressure regulating valve (PRV) command solenoid, resulting in control pressure venting to atmosphere.',
      rectification: 'Torqued sense line B-nut to 110 in-lb per AMM 36-11-21-400-001. Performed Engine 1 ground run idle and high power bleed check per AMM 71-00-00-710-001. BMC 1 BITE test passed with zero faults logged.',
      result: 'Rectified - Test Satisfactory',
      partNumber: 'D36110020',
      serialNumber: 'PRV-1184-B',
      jobCardNumber: 'JC-DPS-2609-044',
      workOrderNumber: 'WO-883190',
      referenceDocument: 'TSM 36-11-00-810-802, AMM 36-11-21-400-001',
      technicianName: 'Yuka (AME A320)',
      notes: 'No damage to threads or cone flare. Crew confirmed normal bleed operation on subsequent post-maintenance flight to Jakarta.',
      isPinned: false,
      tags: JSON.stringify(['#pneumatic', '#bite-test', '#engine']),
      createdAt: now,
      updatedAt: now,
      images: [
        {
          id: 'demo_img_003a',
          caption: 'Before Rectification',
          url: createEvidenceSvg('bleed', 'Eng 1 Bleed PRV Solenoid', 'Loose Sense Line B-Nut Found'),
          fileName: 'bleed_prv_bnut.svg',
          fileSize: 18350,
          mimeType: 'image/svg+xml',
        },
      ],
    },
    {
      id: 'demo_tr_004',
      aircraftType: 'A320-200 (CFM56)',
      aircraftRegistration: 'PK-WIZ',
      aircraftMSN: 'MSN 6205',
      date: '2026-09-08',
      ATAChapter: '32',
      ATASection: '32-48',
      defect: '[DEMO DATA] Post-landing ECAM alert: BRAKES HOT on Wheel #2 (LH Main Gear). Temperature indicated 380°C while Wheel #1 was 160°C.',
      troubleshootingAction: 'Checked brake cooling fan operation. Inspected brake assembly 2 for binding, dragging, and wheel bearing overheating per AMM 32-48-00-200-001. Checked brake temperature thermocouple probe 2.',
      finding: 'Brake cooling fan connector 12GD was partially dislodged, preventing fan motor from running on LH main gear. Excessive carbon dust accumulation on thermocouple probe tip causing 30°C over-reading.',
      rectification: 'Secured fan connector 12GD with new safety cable. Cleaned thermocouple probe with isopropyl alcohol. Ran brake cooling fan operational test via cockpit pushbutton switch. Confirmed normal airflow and temperatures normalized.',
      result: 'Rectified - Test Satisfactory',
      partNumber: '2-1620-1',
      serialNumber: 'BF-9921',
      jobCardNumber: 'JC-KNO-2609-011',
      workOrderNumber: 'WO-881920',
      referenceDocument: 'TSM 32-48-00-810-801, AMM 32-48-11-400-001',
      technicianName: 'Yuka (AME A320)',
      notes: 'Brake pads wear pin checked: 8.5 mm remaining (well within 2.0 mm minimum limit).',
      isPinned: false,
      tags: JSON.stringify(['#electrical', '#inspection', '#landing-gear']),
      createdAt: now,
      updatedAt: now,
      images: [
        {
          id: 'demo_img_004a',
          caption: 'During Inspection',
          url: createEvidenceSvg('brake', 'Wheel #2 Brake Cooling Fan', 'Dislodged Connector 12GD'),
          fileName: 'brake_fan_connector.svg',
          fileSize: 18200,
          mimeType: 'image/svg+xml',
        },
      ],
    },
    {
      id: 'demo_tr_005',
      aircraftType: 'A320neo (PW1100G)',
      aircraftRegistration: 'PK-XMA',
      aircraftMSN: 'MSN 10450',
      date: '2026-08-29',
      ATAChapter: '34',
      ATASection: '34-12',
      defect: '[DEMO DATA] ADIRU 1 intermittent drift warning on MCDU POS MONITOR during long sector. Residual drift reached 2.4 NM/hr.',
      troubleshootingAction: 'Downlinked MCDU ADIRS real-time fault data. Checked pitot/static probe 1 pneumatic lines for moisture or blockage using pitot-static test set per AMM 34-11-00-720-001. Performed full ADIRU 1 alignment and accuracy test.',
      finding: 'Pitot 1 drain hole partially restricted by dried insect debris, causing slight lag in total pressure stabilization.',
      rectification: 'Purged Pitot 1 drain hole with low pressure dry filtered nitrogen per AMM 34-11-15-100-001. Completed leak check (zero leak observed for 5 minutes at 250 kts equivalent). Performed 10-minute Nav Alignment test.',
      result: 'Cleaned & Inspected - Within Limits',
      partNumber: 'C16198AA',
      serialNumber: 'PT-4109',
      jobCardNumber: 'JC-CGK-2608-204',
      workOrderNumber: 'WO-879830',
      referenceDocument: 'AMM 34-11-00-720-001, AMM 34-11-15-100-001',
      technicianName: 'Yuka (AME A320)',
      notes: 'Probe heat operational check satisfactory. Sent alert to line stations to ensure probe covers installed promptly during transit stops.',
      isPinned: true,
      tags: JSON.stringify(['#avionics', '#inspection', '#sensor']),
      createdAt: now,
      updatedAt: now,
      images: [
        {
          id: 'demo_img_005a',
          caption: 'Finding / Defect Evidence',
          url: createEvidenceSvg('sensor', 'Pitot 1 Drain Hole Inspection', 'Partial Insect Debris Restriction'),
          fileName: 'pitot_drain_debris.svg',
          fileSize: 18150,
          mimeType: 'image/svg+xml',
        },
      ],
    },
  ]

  for (const record of demoRecords) {
    const { images, ...data } = record
    await db.insert(schema.troubleshootingRecords).values(data)
    for (const img of images) {
      await db.insert(schema.troubleshootingImages).values({
        ...img,
        recordId: record.id,
        createdAt: now,
      })
    }
  }

  // Pre-seed some recent searches
  const searches = ['nose wheel steering', 'Yellow hydraulic', 'bleed prv', 'brake hot', 'ADIRU drift']
  for (let i = 0; i < searches.length; i++) {
    await db.insert(schema.recentSearches).values({
      id: `rs_${i + 1}`,
      query: searches[i],
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    })
  }
}
