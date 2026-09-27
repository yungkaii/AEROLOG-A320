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
  'A320-200 (CFM56)',
  'A320-200 (IAE V2500)',
  'A320neo (CFM LEAP-1A)',
]

export const DEFAULT_AIRCRAFT_REGISTRATIONS = [
  'PK-GLA',
  'PK-AZA',
  'PK-SGF',
  'PK-WIZ',
  'PK-LUR',
  'PK-XMA',
  'PK-VNA',
  'PK-KLA',
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
