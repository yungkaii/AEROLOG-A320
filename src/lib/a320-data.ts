export interface ATAChapterInfo {
  chapter: string
  title: string
  category: string
  commonSystems: string[]
}

export const A320_ATA_CHAPTERS: ATAChapterInfo[] = [
  {
    chapter: '21',
    title: 'Air Conditioning & Pressurization',
    category: 'Airframe Systems',
    commonSystems: ['Air Conditioning Packs', 'Pack Flow Control Valve', 'Zone Controller', 'Cabin Pressure Controller (CPC)', 'Outflow Valve', 'Ram Air Inlet'],
  },
  {
    chapter: '22',
    title: 'Auto Flight',
    category: 'Avionics',
    commonSystems: ['Flight Control Unit (FCU)', 'Flight Management & Guidance Computer (FMGC)', 'Flight Augmentation Computer (FAC)', 'Multifunction Control Display Unit (MCDU)'],
  },
  {
    chapter: '23',
    title: 'Communications',
    category: 'Avionics',
    commonSystems: ['VHF Transceiver', 'Audio Management Unit (AMU)', 'Cockpit Voice Recorder (CVR)', 'Passenger Address (PA)', 'Static Inverter / Radio'],
  },
  {
    chapter: '24',
    title: 'Electrical Power',
    category: 'Airframe Systems',
    commonSystems: ['Integrated Drive Generator (IDG)', 'Generator Control Unit (GCU)', 'Transformer Rectifier Unit (TRU)', 'APU Generator', 'Battery Charge Limiter (BCL)', 'Static Inverter'],
  },
  {
    chapter: '25',
    title: 'Equipment & Furnishings',
    category: 'Cabin & Interior',
    commonSystems: ['Flight Deck Seats', 'Escape Slides', 'Emergency Equipment', 'Cargo Netting & Restraints', 'Galley Equipment', 'Lavatory Hardware'],
  },
  {
    chapter: '26',
    title: 'Fire Protection',
    category: 'Safety Systems',
    commonSystems: ['Engine Fire Loops (A & B)', 'APU Fire Loop', 'Avionics Smoke Detector', 'Cargo Smoke Detection Unit (SDU)', 'Extinguisher Bottles & Squibs'],
  },
  {
    chapter: '27',
    title: 'Flight Controls',
    category: 'Flight Controls',
    commonSystems: ['Electronic Flight Control System (EFCS)', 'ELAC 1 & 2', 'SEC 1, 2, 3', 'FAC 1 & 2', 'Trimmable Horizontal Stabilizer Actuator (THSA)', 'Flap/Slat Control Computer (SFCC)', 'Aileron/Elevator Actuators'],
  },
  {
    chapter: '28',
    title: 'Fuel System',
    category: 'Airframe Systems',
    commonSystems: ['Main Fuel Boost Pumps', 'Crossfeed Valve', 'Fuel Quantity Indicating Computer (FQIC)', 'Low Level Sensors', 'Defuel/Refuel Panel', 'Suction Valves'],
  },
  {
    chapter: '29',
    title: 'Hydraulic Power',
    category: 'Airframe Systems',
    commonSystems: ['Green Hydraulic System', 'Blue Hydraulic System', 'Yellow Hydraulic System', 'Power Transfer Unit (PTU)', 'Engine Driven Pump (EDP)', 'Electric Pump', 'Ram Air Turbine (RAT) Hydraulic'],
  },
  {
    chapter: '30',
    title: 'Ice & Rain Protection',
    category: 'Safety Systems',
    commonSystems: ['Wing Anti-Ice (WAI) Valves', 'Engine Anti-Ice (EAI) Valves', 'Probe Heat Computers (PHC 1/2/3)', 'Window Heat Computers (WHC 1/2)', 'Windshield Wiper Motors'],
  },
  {
    chapter: '31',
    title: 'Indicating & Recording Systems',
    category: 'Avionics',
    commonSystems: ['Electronic Instrument System (EIS)', 'Display Management Computers (DMC 1/2/3)', 'Engine/Warning Display (E/WD)', 'System Display (SD)', 'Flight Data Recorder (FDR)', 'Flight Data Interface Management Unit (FDIMU)'],
  },
  {
    chapter: '32',
    title: 'Landing Gear & Brakes',
    category: 'Airframe Systems',
    commonSystems: ['Landing Gear Control & Interface Unit (LGCIU 1/2)', 'Brake & Steering Control Unit (BSCU)', 'Nose Wheel Steering (NWS) Actuator', 'Normal & Alternate Brake Servovalves', 'Carbon Brake Units & Tachometers', 'Brake Fan Assembly', 'Landing Gear Doors & Prox Sensors'],
  },
  {
    chapter: '33',
    title: 'Lights',
    category: 'Electrical',
    commonSystems: ['High Intensity Strobe Lights', 'Navigation Lights', 'Takeoff & Taxi Lights', 'Logo Lights', 'Cockpit Integral Lighting', 'Emergency Floor Path Lighting'],
  },
  {
    chapter: '34',
    title: 'Navigation',
    category: 'Avionics',
    commonSystems: ['Air Data & Inertial Reference Unit (ADIRU 1/2/3)', 'Multi-Mode Receiver (MMR / ILS / GPS)', 'VHF Omnidirectional Range (VOR)', 'Distance Measuring Equipment (DME)', 'Traffic Collision Avoidance System (TCAS)', 'Weather Radar (WXR)', 'Radio Altimeter (RA 1/2)'],
  },
  {
    chapter: '35',
    title: 'Oxygen',
    category: 'Safety Systems',
    commonSystems: ['Crew Oxygen Cylinder', 'Oxygen Mask Regulator Box', 'Passenger Chemical Oxygen Generators', 'Overpressure Discharge Indicator'],
  },
  {
    chapter: '36',
    title: 'Pneumatics',
    category: 'Airframe Systems',
    commonSystems: ['Bleed Monitoring Computers (BMC 1 & 2)', 'Engine Bleed Air Valve (PRV)', 'Overpressure Valve (OPV)', 'Pre-cooler Exchanger', 'Crossbleed Valve', 'High Pressure (HP) Valve'],
  },
  {
    chapter: '38',
    title: 'Water & Waste',
    category: 'Cabin Systems',
    commonSystems: ['Potable Water Tank', 'Water Pressurization Air Compressor', 'Vacuum Toilet Generator', 'Drain Masts & Heaters', 'Waste Holding Tank & Sensors'],
  },
  {
    chapter: '49',
    title: 'Airborne Auxiliary Power (APU)',
    category: 'Power Plant',
    commonSystems: ['Electronic Control Box (ECB)', 'APU Fuel Pump & Solenoid', 'Inlet Guide Vanes (IGV) Actuator', 'Starter Motor', 'APU Bleed Valve', 'APU Generator'],
  },
  {
    chapter: '52',
    title: 'Doors',
    category: 'Structures',
    commonSystems: ['Forward & Aft Cargo Doors', 'Cargo Door Hydraulic Hand Pump & Locking Mechanism', 'Passenger Entry Doors & Pressure Regulating Diaphragm', 'Emergency Exit Hatches', 'Door Warning Proximity Sensors'],
  },
  {
    chapter: '71',
    title: 'Power Plant General',
    category: 'Power Plant',
    commonSystems: ['Engine Cowlings & Latches', 'Engine Mounts', 'Thrust Reverser Cowl Hinges', 'Drain Lines & Harnesses'],
  },
  {
    chapter: '73',
    title: 'Engine Fuel & Control',
    category: 'Power Plant',
    commonSystems: ['Full Authority Digital Engine Control (FADEC / EEC)', 'Hydro-Mechanical Unit (HMU)', 'Fuel Metering Valve (FMV)', 'Fuel Flow Transmitter', 'Fuel Return to Tank Valve'],
  },
  {
    chapter: '77',
    title: 'Engine Indicating',
    category: 'Power Plant',
    commonSystems: ['N1 & N2 Speed Sensors', 'Exhaust Gas Temperature (EGT) Thermocouples', 'Engine Vibration Transducers (Accelerometers)', 'Engine Interface Unit (EIU 1/2)'],
  },
  {
    chapter: '78',
    title: 'Exhaust & Thrust Reverser',
    category: 'Power Plant',
    commonSystems: ['Thrust Reverser Actuation System', 'Directional Control Valve (DCV)', 'Hydraulic Latch Actuator', 'Translating Sleeves & Cascades', 'Feedback Switches'],
  },
  {
    chapter: '79',
    title: 'Engine Oil',
    category: 'Power Plant',
    commonSystems: ['Oil Tank & Sight Glass', 'Oil Pressure Transmitter', 'Oil Temperature Sensor', 'Main & Scavenge Oil Filters', 'Debris / Chip Detector'],
  },
  {
    chapter: '80',
    title: 'Engine Starting',
    category: 'Power Plant',
    commonSystems: ['Air Turbine Starter (ATS)', 'Starter Air Valve (SAV)', 'Manual Starter Drive', 'FADEC Crank Control'],
  },
]

export const A320_AIRCRAFT_TYPES = [
  'A320-200 (IAE V2500)',
  'A320-200 (CFM56)',
  'A320neo (CFM LEAP-1A)',
]

export interface FleetAircraftInfo {
  registration: string
  airline: 'Super Air Jet' | 'Batik Air'
  aircraftType: string
  engineDetail: string
  effectivity?: string
}

export const SUPER_AIR_JET_REGISTRATIONS = [
  'PK-SAA', 'PK-SAC', 'PK-SAE', 'PK-SAF', 'PK-SAG', 'PK-SAH', 'PK-SAI', 'PK-SAJ', 'PK-SAK', 'PK-SAL',
  'PK-SAM', 'PK-SAO', 'PK-SAP', 'PK-SAQ', 'PK-SAS', 'PK-SAT', 'PK-SAU', 'PK-SAV', 'PK-SAW', 'PK-SAY', 'PK-SAZ',
  'PK-SGA', 'PK-SGB', 'PK-SGC', 'PK-SGD',
  'PK-SJA', 'PK-SJC', 'PK-SJD', 'PK-SJE', 'PK-SJF', 'PK-SJG', 'PK-SJH', 'PK-SJI', 'PK-SJJ', 'PK-SJK', 'PK-SJL',
  'PK-SJM', 'PK-SJO', 'PK-SJP', 'PK-SJQ', 'PK-SJR', 'PK-SJS', 'PK-SJT', 'PK-SJU', 'PK-SJV', 'PK-SJW', 'PK-SJZ',
  'PK-STA', 'PK-STC', 'PK-STD', 'PK-STF', 'PK-STG', 'PK-STH', 'PK-STI', 'PK-STP', 'PK-STQ', 'PK-STR', 'PK-STT',
  'PK-STU', 'PK-STS', 'PK-STZ'
]

export const BATIK_AIR_REGISTRATIONS = [
  // CFM LEAP-1A (neo)
  'PK-BDF',
  // IAE V2500 series
  'PK-BKF', 'PK-BKG', 'PK-BKJ', 'PK-BKK', 'PK-BKL', 'PK-BKM', 'PK-BKO', 'PK-BLA', 'PK-BLB',
  // CFM56-5B series (BK*, BL*, LZ*, LA*, LU*)
  'PK-BKP', 'PK-BKQ', 'PK-BKR', 'PK-BKT', 'PK-BKU', 'PK-BKV', 'PK-BKY', 'PK-BLC', 'PK-BLD', 'PK-LZH',
  'PK-LAF', 'PK-LAI', 'PK-LAJ', 'PK-LAL', 'PK-LAM', 'PK-LAO', 'PK-LAQ', 'PK-LAT', 'PK-LAW', 'PK-LAY', 'PK-LAZ',
  'PK-LUF', 'PK-LUG', 'PK-LUH', 'PK-LUI', 'PK-LUJ', 'PK-LUK', 'PK-LUO', 'PK-LUP', 'PK-LUQ', 'PK-LUR', 'PK-LUS',
  'PK-LUT', 'PK-LUU', 'PK-LUV', 'PK-LUW', 'PK-LUY', 'PK-LUZ'
]

export const SUPER_AIR_JET_EFFECTIVITY: Record<string, string> = {
  'PK-SAJ': '001',
  'PK-SAA': '008',
  'PK-SJU': '014',
  'PK-SAI': '016',
  'PK-SJS': '017',
  'PK-SGD': '019',
  'PK-SAF': '024',
  'PK-SAS': '025',
  'PK-SJR': '026',
  'PK-SJC': '027',
  'PK-SJV': '033',
  'PK-SAY': '035',
  'PK-SJO': '046',
  'PK-SJT': '049',
  'PK-SJQ': '054',
  'PK-STI': '057',
}

export const A320_FLEET_DATA: Record<string, FleetAircraftInfo> = {
  // SUPER AIR JET (All IAE V2527-A5 with verified Effectivities)
  ...Object.fromEntries(
    SUPER_AIR_JET_REGISTRATIONS.map((reg) => {
      const eff = SUPER_AIR_JET_EFFECTIVITY[reg]
      return [
        reg,
        {
          registration: reg,
          airline: 'Super Air Jet' as const,
          aircraftType: 'A320-200 (IAE V2500)',
          engineDetail: eff ? `#${eff} • V2527-A5` : 'V2527-A5',
          effectivity: eff || undefined,
        },
      ]
    })
  ),

  // BATIK AIR - A320neo (CFM LEAP-1A)
  'PK-BDF': {
    registration: 'PK-BDF',
    airline: 'Batik Air',
    aircraftType: 'A320neo (CFM LEAP-1A)',
    engineDetail: 'CFM LEAP-1A (neo)',
  },

  // BATIK AIR - IAE V2500 Series
  'PK-BKF': { registration: 'PK-BKF', airline: 'Batik Air', aircraftType: 'A320-200 (IAE V2500)', engineDetail: '#051 • V2527-A5', effectivity: '051' },
  'PK-BKJ': { registration: 'PK-BKJ', airline: 'Batik Air', aircraftType: 'A320-200 (IAE V2500)', engineDetail: '#052 • V2527-A5', effectivity: '052' },
  'PK-BKK': { registration: 'PK-BKK', airline: 'Batik Air', aircraftType: 'A320-200 (IAE V2500)', engineDetail: '#054 • V2527-A5', effectivity: '054' },
  'PK-BKL': { registration: 'PK-BKL', airline: 'Batik Air', aircraftType: 'A320-200 (IAE V2500)', engineDetail: '#055 • V2527-A5', effectivity: '055' },
  'PK-BKM': { registration: 'PK-BKM', airline: 'Batik Air', aircraftType: 'A320-200 (IAE V2500)', engineDetail: '#056 • V2527-A5', effectivity: '056' },
  'PK-BKG': { registration: 'PK-BKG', airline: 'Batik Air', aircraftType: 'A320-200 (IAE V2500)', engineDetail: '#151 • V2527E-A5', effectivity: '151' },
  'PK-BKO': { registration: 'PK-BKO', airline: 'Batik Air', aircraftType: 'A320-200 (IAE V2500)', engineDetail: 'V2527-A5' },
  'PK-BLA': { registration: 'PK-BLA', airline: 'Batik Air', aircraftType: 'A320-200 (IAE V2500)', engineDetail: 'V2527-A5' },
  'PK-BLB': { registration: 'PK-BLB', airline: 'Batik Air', aircraftType: 'A320-200 (IAE V2500)', engineDetail: 'V2527-A5' },

  // BATIK AIR - CFM56-5B Series
  'PK-BKQ': { registration: 'PK-BKQ', airline: 'Batik Air', aircraftType: 'A320-200 (CFM56)', engineDetail: '#041 • CFM56-5B4/3', effectivity: '041' },
  'PK-BKP': { registration: 'PK-BKP', airline: 'Batik Air', aircraftType: 'A320-200 (CFM56)', engineDetail: '#042 • CFM56-5B4/3', effectivity: '042' },
  'PK-BKR': { registration: 'PK-BKR', airline: 'Batik Air', aircraftType: 'A320-200 (CFM56)', engineDetail: '#043 • CFM56-5B4/3', effectivity: '043' },
  'PK-BKY': { registration: 'PK-BKY', airline: 'Batik Air', aircraftType: 'A320-200 (CFM56)', engineDetail: '#044 • CFM56-5B4/3', effectivity: '044' },
  'PK-BKT': { registration: 'PK-BKT', airline: 'Batik Air', aircraftType: 'A320-200 (CFM56)', engineDetail: '#045 • CFM56-5B4/3', effectivity: '045' },
  'PK-BKU': { registration: 'PK-BKU', airline: 'Batik Air', aircraftType: 'A320-200 (CFM56)', engineDetail: '#046 • CFM56-5B4/3', effectivity: '046' },
  'PK-BKV': { registration: 'PK-BKV', airline: 'Batik Air', aircraftType: 'A320-200 (CFM56)', engineDetail: '#047 • CFM56-5B4/3', effectivity: '047' },
  'PK-BLC': { registration: 'PK-BLC', airline: 'Batik Air', aircraftType: 'A320-200 (CFM56)', engineDetail: '#048 • CFM56-5B4/3', effectivity: '048' },
  'PK-BLD': { registration: 'PK-BLD', airline: 'Batik Air', aircraftType: 'A320-200 (CFM56)', engineDetail: '#049 • CFM56-5B4/3', effectivity: '049' },
  'PK-LZH': { registration: 'PK-LZH', airline: 'Batik Air', aircraftType: 'A320-200 (CFM56)', engineDetail: 'CFM56-5B4/3' },

  // BATIK AIR - LA* & LU* Series (All CFM56-5B4)
  ...Object.fromEntries(
    [
      'PK-LAF', 'PK-LAI', 'PK-LAJ', 'PK-LAL', 'PK-LAM', 'PK-LAO', 'PK-LAQ', 'PK-LAT', 'PK-LAW', 'PK-LAY', 'PK-LAZ',
      'PK-LUF', 'PK-LUG', 'PK-LUH', 'PK-LUI', 'PK-LUJ', 'PK-LUK', 'PK-LUO', 'PK-LUP', 'PK-LUQ', 'PK-LUR', 'PK-LUS',
      'PK-LUT', 'PK-LUU', 'PK-LUV', 'PK-LUW', 'PK-LUY', 'PK-LUZ'
    ].map((reg) => [
      reg,
      {
        registration: reg,
        airline: 'Batik Air',
        aircraftType: 'A320-200 (CFM56)',
        engineDetail: 'CFM56-5B4/3',
      },
    ])
  ),
}

export function getAircraftEngineInfo(registration: string): FleetAircraftInfo | null {
  const clean = registration.trim().toUpperCase()
  if (A320_FLEET_DATA[clean]) {
    return A320_FLEET_DATA[clean]
  }
  // Pattern fallback heuristics
  if (clean.startsWith('PK-S')) {
    return {
      registration: clean,
      airline: 'Super Air Jet',
      aircraftType: 'A320-200 (IAE V2500)',
      engineDetail: 'IAE V2527-A5',
    }
  }
  if (clean.startsWith('PK-LA') || clean.startsWith('PK-LU') || clean.startsWith('PK-LZ')) {
    return {
      registration: clean,
      airline: 'Batik Air',
      aircraftType: 'A320-200 (CFM56)',
      engineDetail: 'CFM56-5B4/3',
    }
  }
  return null
}

export const DEFAULT_AIRCRAFT_REGISTRATIONS = [
  ...SUPER_AIR_JET_REGISTRATIONS,
  ...BATIK_AIR_REGISTRATIONS.filter((r) => !SUPER_AIR_JET_REGISTRATIONS.includes(r)),
]

export const RESULT_STATUS_OPTIONS = [
  'Rectified - Test Satisfactory',
  'Rectified - BITE Test OK',
  'Component Replaced & Ground Tested',
  'Wiring Repaired & Continuity Checked',
  'Deferred under MEL',
  'Monitored Next Sector',
  'Cleaned & Inspected - Within Limits',
  'Temporary Fix - Follow-up Required',
]

export const COMMON_TAGS = [
  '#repeated',
  '#electrical',
  '#hydraulic',
  '#pneumatic',
  '#avionics',
  '#inspection',
  '#leak',
  '#sensor',
  '#bite-test',
  '#mel',
  '#component-change',
  '#transit-defect',
  '#wiring',
]

export const IMAGE_CAPTIONS = [
  'Before Rectification',
  'During Inspection',
  'Finding / Defect Evidence',
  'Component Label / Part Number Plate',
  'After Rectification / Clean Installation',
  'MCDU / ECAM BITE Test Result',
  'Reference Diagram (AMM/TSM sketch)',
  'Other Evidence',
]
