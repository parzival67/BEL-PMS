import React, { createContext, useContext, useState, useEffect } from 'react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type Role = 'Admin' | 'IGQA' | 'Assembly' | 'Testing' | 'Final QA';

export type Screen = 
  | 'welcome' 
  | 'product-selection' 
  | 'dashboard' 
  | 'workspace' 
  | 'stage-detail' 
  | 'qa-review' 
  | 'admin-master' 
  | 'reports';

export interface OcrMeasurement {
  parameter: string;
  observed: string;
  minLimit: string;
  maxLimit: string;
  unit: string;
  status: 'PASS' | 'FAIL';
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface DocumentRecord {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadedRole: Role;
  timestamp: string;
  fileSize: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks?: string;
  // ATE & OCR details
  isAte: boolean;
  ocrResult?: 'PASS' | 'FAIL';
  ocrMeasurements?: OcrMeasurement[];
  checklist?: ChecklistItem[];
  // Production stats
  totalItems: number;
  approvedCount: number;
  rejectedCount: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface SubStage {
  id: string;
  name: string;
  status: 'inactive' | 'running' | 'pending_review' | 'completed' | 'rejected';
  isAte: boolean;
  documentHistory: DocumentRecord[];
}

export interface Stage {
  id: string; // 'igqa' | 'assembly' | 'testing' | 'qa'
  name: string;
  subStages: SubStage[];
}

export interface Module {
  id: string;
  name: string;
  progress: number; // percentage
  stages: Stage[];
}

export interface ServiceUnit {
  serialNumber: string;
  progress: number;
  modules: Module[];
}

export interface Product {
  id: string; // 'tlr-akash' | 'alns' | 't90'
  name: string;
  progress: number;
  modulesCount: number;
  services: ServiceUnit[];
}

export interface AppNotification {
  id: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  resolved: boolean;
}

interface AppContextType {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  products: Product[];
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  selectedSerial: string;
  setSelectedSerial: (serial: string) => void;
  selectedModuleId: string;
  setSelectedModuleId: (id: string) => void;
  selectedStageId: string;
  setSelectedStageId: (id: string) => void;
  selectedSubStageId: string;
  setSelectedSubStageId: (id: string) => void;
  notifications: AppNotification[];
  addNotification: (message: string, type: AppNotification['type']) => void;
  resolveNotification: (id: string) => void;
  uploadSubStageDocument: (
    moduleId: string, 
    stageId: string, 
    subStageId: string, 
    doc: Omit<DocumentRecord, 'id' | 'timestamp' | 'uploadedBy' | 'uploadedRole' | 'status'>,
    simulateOcrFailure?: boolean
  ) => void;
  reviewDocument: (
    moduleId: string, 
    stageId: string, 
    subStageId: string, 
    documentId: string, 
    status: 'APPROVED' | 'REJECTED', 
    remarks: string
  ) => void;
  // Admin functions
  addProduct: (name: string) => void;
  addServiceToProduct: (productId: string, serial: string) => void;
  addModuleToProduct: (productId: string, name: string) => void;
  addSubStageToStage: (productId: string, moduleId: string, stageId: string, name: string, isAte: boolean) => void;
  toggleSubStageAte: (productId: string, moduleId: string, stageId: string, subStageId: string) => void;
  renameSubStage: (productId: string, moduleId: string, stageId: string, subStageId: string, newName: string) => void;
}

// ==========================================
// INITIAL MOCK DATA CONFIGURATION
// ==========================================

const createInitialStages = (): Stage[] => [
  {
    id: 'igqa',
    name: 'IGQA',
    subStages: [
      { id: 'bare-pcb', name: 'Bare PCB Inspection', status: 'completed', isAte: false, documentHistory: [] },
      { id: 'housing', name: 'Housing & Mechanical Parts', status: 'completed', isAte: false, documentHistory: [] },
      { id: 'components-qa', name: 'Electrical Components QA', status: 'completed', isAte: false, documentHistory: [] }
    ]
  },
  {
    id: 'assembly',
    name: 'Assembly',
    subStages: [
      { id: 'pcb-assy', name: 'PCB Solder Assembly', status: 'completed', isAte: false, documentHistory: [] },
      { id: 'harnessing', name: 'Wiring & Harnessing', status: 'completed', isAte: false, documentHistory: [] },
      { id: 'mech-assy', name: 'Final Mechanical Assembly', status: 'completed', isAte: false, documentHistory: [] }
    ]
  },
  {
    id: 'testing',
    name: 'Testing',
    subStages: [
      { id: 'ate-test', name: 'DSP ATE Testing', status: 'running', isAte: true, documentHistory: [] },
      { id: 'env-test', name: 'Environmental Chamber Test', status: 'inactive', isAte: false, documentHistory: [] },
      { id: 'full-sys', name: 'Full System Calibration', status: 'inactive', isAte: false, documentHistory: [] }
    ]
  },
  {
    id: 'qa-review',
    name: 'Final QA',
    subStages: [
      { id: 'doc-audit', name: 'Quality Documentation Audit', status: 'inactive', isAte: false, documentHistory: [] },
      { id: 'signoff', name: 'Final Release Sign-off', status: 'inactive', isAte: false, documentHistory: [] }
    ]
  }
];

const inspectionProfiles = {
  'bare-pcb': {
    fileName: 'IGQA_BarePCB_Lot-AK-204_SN.pdf',
    uploadedBy: 'Anita Rao',
    uploadedRole: 'IGQA' as Role,
    timestamp: '2026-07-01 09:42 AM',
    fileSize: '684 KB',
    totalItems: 24,
    approvedCount: 24,
    rejectedCount: 0,
    startTime: '09:05',
    endTime: '09:42',
    durationMinutes: 37,
    remarks: 'Bare PCB visual, solder-mask, track continuity, and ESD handling records verified.'
  },
  housing: {
    fileName: 'IGQA_Housing_MechanicalFit_SN.pdf',
    uploadedBy: 'Karthik Menon',
    uploadedRole: 'IGQA' as Role,
    timestamp: '2026-07-01 11:18 AM',
    fileSize: '912 KB',
    totalItems: 16,
    approvedCount: 15,
    rejectedCount: 1,
    startTime: '10:30',
    endTime: '11:18',
    durationMinutes: 48,
    remarks: 'One cosmetic burr logged and accepted under concession note CN-1187.'
  },
  'components-qa': {
    fileName: 'IGQA_ElectricalComponents_BinCheck_SN.xlsx',
    uploadedBy: 'Meera Nair',
    uploadedRole: 'IGQA' as Role,
    timestamp: '2026-07-01 02:05 PM',
    fileSize: '428 KB',
    totalItems: 64,
    approvedCount: 64,
    rejectedCount: 0,
    startTime: '01:10',
    endTime: '02:05',
    durationMinutes: 55,
    remarks: 'Component values, date codes, and MSL bake labels cross-checked against BOM.'
  },
  'pcb-assy': {
    fileName: 'Assembly_PCB_Solder_AOI_SN.pdf',
    uploadedBy: 'Ramesh Iyer',
    uploadedRole: 'Assembly' as Role,
    timestamp: '2026-07-02 10:10 AM',
    fileSize: '1.1 MB',
    totalItems: 36,
    approvedCount: 35,
    rejectedCount: 1,
    startTime: '08:55',
    endTime: '10:10',
    durationMinutes: 75,
    remarks: 'AOI record accepted after rework confirmation for connector J4 wetting.'
  },
  harnessing: {
    fileName: 'Assembly_Harness_Continuity_SN.pdf',
    uploadedBy: 'Divya Shah',
    uploadedRole: 'Assembly' as Role,
    timestamp: '2026-07-02 12:35 PM',
    fileSize: '756 KB',
    totalItems: 18,
    approvedCount: 18,
    rejectedCount: 0,
    startTime: '11:50',
    endTime: '12:35',
    durationMinutes: 45,
    remarks: 'Harness continuity, crimp pull tags, and sleeve markers verified.'
  },
  'mech-assy': {
    fileName: 'Assembly_FinalMechanical_TorqueLog_SN.pdf',
    uploadedBy: 'Vikram Singh',
    uploadedRole: 'Assembly' as Role,
    timestamp: '2026-07-02 03:28 PM',
    fileSize: '802 KB',
    totalItems: 22,
    approvedCount: 22,
    rejectedCount: 0,
    startTime: '02:40',
    endTime: '03:28',
    durationMinutes: 48,
    remarks: 'Torque witness marks, lockwire routing, and enclosure seal compression accepted.'
  },
  'env-test': {
    fileName: 'Testing_EnvironmentalChamber_Profile_SN.pdf',
    uploadedBy: 'Naveen Thomas',
    uploadedRole: 'Testing' as Role,
    timestamp: '2026-07-02 05:20 PM',
    fileSize: '1.6 MB',
    totalItems: 8,
    approvedCount: 8,
    rejectedCount: 0,
    startTime: '01:20',
    endTime: '05:20',
    durationMinutes: 240,
    remarks: 'Thermal soak, vibration hold, and post-run functional check completed.'
  },
  'full-sys': {
    fileName: 'Testing_SystemCalibration_Final_SN.pdf',
    uploadedBy: 'Farhan Ali',
    uploadedRole: 'Testing' as Role,
    timestamp: '2026-07-03 09:15 AM',
    fileSize: '1.4 MB',
    totalItems: 12,
    approvedCount: 12,
    rejectedCount: 0,
    startTime: '08:10',
    endTime: '09:15',
    durationMinutes: 65,
    remarks: 'Full system calibration drift is within the release threshold.'
  },
  'doc-audit': {
    fileName: 'FQA_Documentation_Audit_SN.pdf',
    uploadedBy: 'Priya Menon',
    uploadedRole: 'Final QA' as Role,
    timestamp: '2026-07-03 10:05 AM',
    fileSize: '508 KB',
    totalItems: 14,
    approvedCount: 14,
    rejectedCount: 0,
    startTime: '09:35',
    endTime: '10:05',
    durationMinutes: 30,
    remarks: 'Traveler, inspection reports, calibration references, and NCR closure evidence match.'
  },
  signoff: {
    fileName: 'FQA_FinalRelease_Signoff_SN.pdf',
    uploadedBy: 'QA Lead',
    uploadedRole: 'Final QA' as Role,
    timestamp: '2026-07-03 11:00 AM',
    fileSize: '376 KB',
    totalItems: 6,
    approvedCount: 6,
    rejectedCount: 0,
    startTime: '10:40',
    endTime: '11:00',
    durationMinutes: 20,
    remarks: 'Release sign-off packet cleared for dispatch hold point.'
  }
};

const buildInspectionDocument = (subStage: SubStage, serialNumber: string, moduleName: string): DocumentRecord => {
  const profile = inspectionProfiles[subStage.id as keyof typeof inspectionProfiles] ?? inspectionProfiles['bare-pcb'];
  const rejectedCount = profile.totalItems - profile.approvedCount;

  return {
    id: `DOC-${serialNumber}-${subStage.id}`.replace(/[^A-Z0-9-]/gi, '').toUpperCase(),
    fileName: profile.fileName.replace('_SN', `_${serialNumber}_${moduleName.replace(/[^A-Z0-9]+/gi, '')}`),
    uploadedBy: profile.uploadedBy,
    uploadedRole: profile.uploadedRole,
    timestamp: profile.timestamp,
    fileSize: profile.fileSize,
    status: 'APPROVED',
    remarks: profile.remarks,
    isAte: subStage.isAte,
    totalItems: profile.totalItems,
    approvedCount: profile.approvedCount,
    rejectedCount,
    startTime: profile.startTime,
    endTime: profile.endTime,
    durationMinutes: profile.durationMinutes
  };
};

const seedCompletedInspectionDocuments = (products: Product[]) => {
  products.forEach(product => {
    product.services.forEach(service => {
      service.modules.forEach(module => {
        module.stages.forEach(stage => {
          stage.subStages.forEach(subStage => {
            if (subStage.status === 'completed' && subStage.documentHistory.length === 0) {
              subStage.documentHistory = [buildInspectionDocument(subStage, service.serialNumber, module.name)];
            }
          });
        });
      });
    });
  });
};

const mockProducts: Product[] = [
  {
    id: 'tlr-akash',
    name: 'TLR Prime Akash (Radar)',
    progress: 72,
    modulesCount: 4,
    services: [
      {
        serialNumber: 'SN001',
        progress: 72,
        modules: [
          {
            id: 'sys-controller',
            name: 'System Controller',
            progress: 72,
            stages: createInitialStages()
          },
          {
            id: 'power-supply',
            name: 'Power Supply Module',
            progress: 55,
            stages: createInitialStages().map(s => {
              if (s.id === 'testing') {
                return { ...s, subStages: s.subStages.map(ss => ss.id === 'ate-test' ? { ...ss, status: 'inactive' } : ss) };
              }
              if (s.id === 'assembly') {
                return { ...s, subStages: s.subStages.map(ss => ss.id === 'mech-assy' ? { ...ss, status: 'running' } : ss) };
              }
              return s;
            })
          },
          {
            id: 'cable-assembly',
            name: 'Cable & Harness Assembly',
            progress: 91,
            stages: createInitialStages().map(s => {
              if (s.id === 'qa-review') {
                return { ...s, subStages: s.subStages.map(ss => ss.id === 'doc-audit' ? { ...ss, status: 'running' } : ss) };
              }
              if (s.id === 'testing') {
                return { ...s, subStages: s.subStages.map(ss => ({ ...ss, status: 'completed' })) };
              }
              return s;
            })
          },
          {
            id: 'servo-drive',
            name: 'Servo Drive Assembly',
            progress: 30,
            stages: createInitialStages().map(s => {
              if (s.id === 'assembly') {
                return { ...s, subStages: s.subStages.map(ss => ({ ...ss, status: 'inactive' })) };
              }
              if (s.id === 'igqa') {
                return { ...s, subStages: s.subStages.map(ss => ss.id === 'components-qa' ? { ...ss, status: 'running' } : ss) };
              }
              return s;
            })
          }
        ]
      },
      {
        serialNumber: 'SN002',
        progress: 45,
        modules: [
          {
            id: 'sys-controller',
            name: 'System Controller',
            progress: 45,
            stages: createInitialStages().map(s => {
              if (s.id === 'assembly') {
                return { ...s, subStages: s.subStages.map(ss => ss.id === 'pcb-assy' ? { ...ss, status: 'running' } : { ...ss, status: 'inactive' }) };
              }
              if (s.id === 'testing' || s.id === 'qa-review') {
                return { ...s, subStages: s.subStages.map(ss => ({ ...ss, status: 'inactive' })) };
              }
              return s;
            })
          },
          {
            id: 'power-supply',
            name: 'Power Supply Module',
            progress: 20,
            stages: createInitialStages().map(s => {
              if (s.id === 'igqa') {
                return { ...s, subStages: s.subStages.map(ss => ss.id === 'components-qa' ? { ...ss, status: 'running' } : ss) };
              }
              if (s.id === 'assembly' || s.id === 'testing' || s.id === 'qa-review') {
                return { ...s, subStages: s.subStages.map(ss => ({ ...ss, status: 'inactive' })) };
              }
              return s;
            })
          },
          {
            id: 'cable-assembly',
            name: 'Cable & Harness Assembly',
            progress: 60,
            stages: createInitialStages().map(s => {
              if (s.id === 'testing') {
                return { ...s, subStages: s.subStages.map(ss => ss.id === 'ate-test' ? { ...ss, status: 'running' } : { ...ss, status: 'inactive' }) };
              }
              if (s.id === 'qa-review') {
                return { ...s, subStages: s.subStages.map(ss => ({ ...ss, status: 'inactive' })) };
              }
              return s;
            })
          },
          {
            id: 'servo-drive',
            name: 'Servo Drive Assembly',
            progress: 10,
            stages: createInitialStages().map(s => {
              if (s.id === 'igqa') {
                return { ...s, subStages: s.subStages.map(ss => ss.id === 'bare-pcb' ? { ...ss, status: 'running' } : { ...ss, status: 'inactive' }) };
              }
              if (s.id === 'assembly' || s.id === 'testing' || s.id === 'qa-review') {
                return { ...s, subStages: s.subStages.map(ss => ({ ...ss, status: 'inactive' })) };
              }
              return s;
            })
          }
        ]
      }
    ]
  },
  {
    id: 'alns',
    name: 'ALNS Navigation System',
    progress: 92,
    modulesCount: 2,
    services: [
      {
        serialNumber: 'SN101',
        progress: 92,
        modules: [
          {
            id: 'antenna-unit',
            name: 'Antenna Control Unit',
            progress: 95,
            stages: createInitialStages().map(s => {
              if (s.id === 'qa-review') {
                return { ...s, subStages: s.subStages.map(ss => ss.id === 'signoff' ? { ...ss, status: 'running' } : { ...ss, status: 'completed' }) };
              }
              return { ...s, subStages: s.subStages.map(ss => ({ ...ss, status: 'completed' })) };
            })
          },
          {
            id: 'receiver-mod',
            name: 'RF Receiver Module',
            progress: 88,
            stages: createInitialStages().map(s => {
              if (s.id === 'testing') {
                return { ...s, subStages: s.subStages.map(ss => ss.id === 'full-sys' ? { ...ss, status: 'running' } : { ...ss, status: 'completed' }) };
              }
              if (s.id === 'qa-review') {
                return { ...s, subStages: s.subStages.map(ss => ({ ...ss, status: 'inactive' })) };
              }
              return { ...s, subStages: s.subStages.map(ss => ({ ...ss, status: 'completed' })) };
            })
          }
        ]
      }
    ]
  },
  {
    id: 't90-fcs',
    name: 'T90 Fire Control System',
    progress: 40,
    modulesCount: 3,
    services: [
      {
        serialNumber: 'SN401',
        progress: 40,
        modules: [
          {
            id: 'thermal-sight',
            name: 'Thermal Imaging Sight',
            progress: 35,
            stages: createInitialStages().map(s => {
              if (s.id === 'igqa') {
                return { ...s, subStages: s.subStages.map(ss => ({ ...ss, status: 'completed' })) };
              }
              if (s.id === 'assembly') {
                return { ...s, subStages: s.subStages.map(ss => ss.id === 'pcb-assy' ? { ...ss, status: 'completed' } : ss.id === 'harnessing' ? { ...ss, status: 'running' } : { ...ss, status: 'inactive' }) };
              }
              return { ...s, subStages: s.subStages.map(ss => ({ ...ss, status: 'inactive' })) };
            })
          },
          {
            id: 'ballistic-computer',
            name: 'Ballistic Computer Unit',
            progress: 50,
            stages: createInitialStages().map(s => {
              if (s.id === 'assembly') {
                return { ...s, subStages: s.subStages.map(ss => ss.id === 'mech-assy' ? { ...ss, status: 'running' } : { ...ss, status: 'completed' }) };
              }
              if (s.id === 'testing' || s.id === 'qa-review') {
                return { ...s, subStages: s.subStages.map(ss => ({ ...ss, status: 'inactive' })) };
              }
              return { ...s, subStages: s.subStages.map(ss => ({ ...ss, status: 'completed' })) };
            })
          },
          {
            id: 'gun-stabilizer',
            name: 'Gun Stabilizer Interface',
            progress: 35,
            stages: createInitialStages().map(s => {
              if (s.id === 'igqa') {
                return { ...s, subStages: s.subStages.map(ss => ({ ...ss, status: 'completed' })) };
              }
              if (s.id === 'assembly') {
                return { ...s, subStages: s.subStages.map(ss => ss.id === 'pcb-assy' ? { ...ss, status: 'running' } : { ...ss, status: 'inactive' }) };
              }
              return { ...s, subStages: s.subStages.map(ss => ({ ...ss, status: 'inactive' })) };
            })
          }
        ]
      }
    ]
  }
];

seedCompletedInspectionDocuments(mockProducts);

const initialNotifications: AppNotification[] = [
  { id: '1', message: 'System Controller SN001: DSP ATE Testing is ready for upload.', timestamp: '10:45 AM', type: 'info', resolved: false },
  { id: '2', message: 'T90 Stabilizer SN401: Harnessing Assembly completed by Operator John.', timestamp: '11:15 AM', type: 'success', resolved: false },
  { id: '3', message: 'Power Supply SN002: Mechanical parts rejected in Incoming Quality Assurance.', timestamp: '09:30 AM', type: 'error', resolved: false }
];

// Add pre-populated document to TLR Prime Akash SN001 System Controller DSP ATE
const populateInitialAteDocument = () => {
  const akash = mockProducts[0];
  const sn001 = akash.services[0];
  const controller = sn001.modules[0];
  const testingStage = controller.stages.find(s => s.id === 'testing');
  const ateSubStage = testingStage?.subStages.find(ss => ss.id === 'ate-test');
  
  if (ateSubStage) {
    ateSubStage.status = 'pending_review';
    ateSubStage.documentHistory = [
      {
        id: 'DOC-ATE-789',
        fileName: 'ATE_Report_SN001_SystemController.pdf',
        uploadedBy: 'Suresh Kumar',
        uploadedRole: 'Testing',
        timestamp: '2026-07-02 11:20 AM',
        fileSize: '1.2 MB',
        status: 'PENDING',
        isAte: true,
        ocrResult: 'PASS',
        ocrMeasurements: [
          { parameter: 'ADC Voltage Ref', observed: '5.02', minLimit: '4.80', maxLimit: '5.20', unit: 'V', status: 'PASS' },
          { parameter: 'DAC Output Linearity', observed: '0.015', minLimit: '0.000', maxLimit: '0.025', unit: '%', status: 'PASS' },
          { parameter: 'DDR4 RAM Read Speed', observed: '2133', minLimit: '1600', maxLimit: '2400', unit: 'MHz', status: 'PASS' },
          { parameter: 'BIT (Built-In Test)', observed: '100', minLimit: '100', maxLimit: '100', unit: '%', status: 'PASS' }
        ],
        checklist: [
          { id: 'ch-adc', label: 'ADC reference voltage is within spec', checked: true },
          { id: 'ch-dac', label: 'DAC output linearity matches design constraints', checked: true },
          { id: 'ch-ram', label: 'DDR4 RAM full write/read cycle validation', checked: true },
          { id: 'ch-bit', label: 'Power-on self-test (POST) / Built-In Test passed', checked: true }
        ],
        totalItems: 50,
        approvedCount: 50,
        rejectedCount: 0,
        startTime: '10:15',
        endTime: '11:20',
        durationMinutes: 65
      }
    ];
  }

  // ── TLR-Akash SN001 · Cable & Harness Assembly · doc-audit (non-ATE) ──
  const cableModule = sn001.modules[2]; // cable-assembly
  const qaStage = cableModule?.stages.find(s => s.id === 'qa-review');
  const docAuditSub = qaStage?.subStages.find(ss => ss.id === 'doc-audit');
  if (docAuditSub) {
    docAuditSub.status = 'pending_review';
    docAuditSub.documentHistory = [
      {
        id: 'DOC-QA-301',
        fileName: 'QA_DocAudit_SN001_CableHarness.pdf',
        uploadedBy: 'Priya Menon',
        uploadedRole: 'Final QA',
        timestamp: '2026-07-03 09:45 AM',
        fileSize: '508 KB',
        status: 'PENDING',
        isAte: false,
        totalItems: 14,
        approvedCount: 14,
        rejectedCount: 0,
        startTime: '09:10',
        endTime: '09:45',
        durationMinutes: 35,
        remarks: 'Traveller, inspection reports, calibration references and NCR closures verified.'
      }
    ];
  }

  // ── TLR-Akash SN001 · Cable & Harness Assembly · ATE (full-sys) ──
  const testingStage2 = cableModule?.stages.find(s => s.id === 'testing');
  const fullSysSub = testingStage2?.subStages.find(ss => ss.id === 'full-sys');
  if (fullSysSub) {
    fullSysSub.status = 'pending_review';
    fullSysSub.documentHistory = [
      {
        id: 'DOC-ATE-812',
        fileName: 'ATE_SystemCalibration_SN001_CableHarness.pdf',
        uploadedBy: 'Naveen Thomas',
        uploadedRole: 'Testing',
        timestamp: '2026-07-03 08:50 AM',
        fileSize: '1.6 MB',
        status: 'PENDING',
        isAte: true,
        ocrResult: 'FAIL',
        ocrMeasurements: [
          { parameter: 'RF Output Power', observed: '18.4', minLimit: '20.0', maxLimit: '26.0', unit: 'dBm', status: 'FAIL' },
          { parameter: 'Signal Bandwidth', observed: '40', minLimit: '35', maxLimit: '55', unit: 'MHz', status: 'PASS' },
          { parameter: 'Noise Floor', observed: '-92', minLimit: '-110', maxLimit: '-85', unit: 'dBm', status: 'PASS' },
          { parameter: 'Impedance Match', observed: '52.8', minLimit: '48.0', maxLimit: '52.0', unit: 'Ω', status: 'FAIL' }
        ],
        checklist: [
          { id: 'ch-rf', label: 'RF output power within transmit spec', checked: false },
          { id: 'ch-bw', label: 'Signal bandwidth within channel allocation', checked: true },
          { id: 'ch-nf', label: 'Noise floor cleared sensitivity threshold', checked: true },
          { id: 'ch-imp', label: 'Impedance matching at antenna port', checked: false }
        ],
        totalItems: 12,
        approvedCount: 10,
        rejectedCount: 2,
        startTime: '07:45',
        endTime: '08:50',
        durationMinutes: 65
      }
    ];
  }

  // ── ALNS SN101 · Antenna Control Unit · signoff (non-ATE) ──
  const alns = mockProducts[1];
  const alns101 = alns.services[0];
  const antennaModule = alns101.modules[0]; // antenna-unit
  const antennaQa = antennaModule?.stages.find(s => s.id === 'qa-review');
  const signoffSub = antennaQa?.subStages.find(ss => ss.id === 'signoff');
  if (signoffSub) {
    signoffSub.status = 'pending_review';
    signoffSub.documentHistory = [
      {
        id: 'DOC-FQA-055',
        fileName: 'FQA_FinalRelease_SN101_AntennaUnit.pdf',
        uploadedBy: 'QA Lead',
        uploadedRole: 'Final QA',
        timestamp: '2026-07-03 11:00 AM',
        fileSize: '376 KB',
        status: 'PENDING',
        isAte: false,
        totalItems: 6,
        approvedCount: 6,
        rejectedCount: 0,
        startTime: '10:40',
        endTime: '11:00',
        durationMinutes: 20,
        remarks: 'Release sign-off packet cleared for dispatch hold point.'
      }
    ];
  }

  // ── ALNS SN101 · RF Receiver Module · ATE full-sys pending ──
  const receiverModule = alns101.modules[1]; // receiver-mod
  const receiverTesting = receiverModule?.stages.find(s => s.id === 'testing');
  const receiverFullSys = receiverTesting?.subStages.find(ss => ss.id === 'full-sys');
  if (receiverFullSys) {
    receiverFullSys.status = 'pending_review';
    receiverFullSys.documentHistory = [
      {
        id: 'DOC-ATE-901',
        fileName: 'ATE_SystemCalibration_SN101_RFReceiver.pdf',
        uploadedBy: 'Farhan Ali',
        uploadedRole: 'Testing',
        timestamp: '2026-07-03 10:30 AM',
        fileSize: '1.4 MB',
        status: 'PENDING',
        isAte: true,
        ocrResult: 'PASS',
        ocrMeasurements: [
          { parameter: 'Receiver Sensitivity', observed: '-108', minLimit: '-115', maxLimit: '-90', unit: 'dBm', status: 'PASS' },
          { parameter: 'IF Gain', observed: '24.5', minLimit: '20.0', maxLimit: '28.0', unit: 'dB', status: 'PASS' },
          { parameter: 'Image Rejection', observed: '62', minLimit: '55', maxLimit: '80', unit: 'dB', status: 'PASS' },
          { parameter: 'LO Leakage', observed: '-48', minLimit: '-60', maxLimit: '-40', unit: 'dBm', status: 'PASS' }
        ],
        checklist: [
          { id: 'ch-sens', label: 'Receiver sensitivity within threshold', checked: true },
          { id: 'ch-gain', label: 'IF chain gain within tolerance', checked: true },
          { id: 'ch-imr', label: 'Image rejection meets spec', checked: true },
          { id: 'ch-lo', label: 'LO leakage within permissible limit', checked: true }
        ],
        totalItems: 12,
        approvedCount: 12,
        rejectedCount: 0,
        startTime: '09:30',
        endTime: '10:30',
        durationMinutes: 60
      }
    ];
  }

  // ── T90 SN401 · Ballistic Computer · PCB Solder (non-ATE) ──
  const t90 = mockProducts[2];
  const t90sn401 = t90.services[0];
  const ballisticModule = t90sn401.modules[1]; // ballistic-computer
  const ballisticAssembly = ballisticModule?.stages.find(s => s.id === 'assembly');
  const mechAssySub = ballisticAssembly?.subStages.find(ss => ss.id === 'mech-assy');
  if (mechAssySub) {
    mechAssySub.status = 'pending_review';
    mechAssySub.documentHistory = [
      {
        id: 'DOC-ASSY-540',
        fileName: 'Assembly_MechAssy_SN401_BallisticComputer.pdf',
        uploadedBy: 'Vikram Singh',
        uploadedRole: 'Assembly',
        timestamp: '2026-07-03 07:55 AM',
        fileSize: '802 KB',
        status: 'PENDING',
        isAte: false,
        totalItems: 22,
        approvedCount: 21,
        rejectedCount: 1,
        startTime: '07:05',
        endTime: '07:55',
        durationMinutes: 50,
        remarks: 'Torque records verified. One fastener concession raised under NCR-2291.'
      }
    ];
  }
};
populateInitialAteDocument();

// ==========================================
// CONTEXT PROVIDER IMPLEMENTATION
// ==========================================

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [currentRole, setCurrentRole] = useState<Role>('Admin');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Default theme dark for that high-tech radar PMS look
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedProductId, setSelectedProductId] = useState<string>('tlr-akash');
  const [selectedSerial, setSelectedSerial] = useState<string>('SN001');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('sys-controller');
  const [selectedStageId, setSelectedStageId] = useState<string>('testing');
  const [selectedSubStageId, setSelectedSubStageId] = useState<string>('ate-test');
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  // Helper to trigger recalculation of product/service progress
  const recalculateProgress = (updatedProducts: Product[]) => {
    return updatedProducts.map(product => {
      const updatedServices = product.services.map(service => {
        const updatedModules = service.modules.map(module => {
          // Calculate module progress
          // Total substages = sum of substages in all stages
          let totalSubStages = 0;
          let completedSubStages = 0;

          module.stages.forEach(stage => {
            stage.subStages.forEach(subStage => {
              totalSubStages++;
              if (subStage.status === 'completed') {
                completedSubStages++;
              }
            });
          });

          const progress = totalSubStages > 0 ? Math.round((completedSubStages / totalSubStages) * 100) : 0;
          return { ...module, progress };
        });

        // Service progress = average of module progress
        const avgModuleProgress = updatedModules.reduce((acc, curr) => acc + curr.progress, 0) / updatedModules.length;
        const progress = Math.round(avgModuleProgress);

        return { ...service, modules: updatedModules, progress };
      });

      // Product progress = average of service progress
      const avgServiceProgress = updatedServices.reduce((acc, curr) => acc + curr.progress, 0) / updatedServices.length;
      const progress = Math.round(avgServiceProgress);

      return { ...product, services: updatedServices, progress };
    });
  };

  const addNotification = (message: string, type: AppNotification['type']) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newNotif: AppNotification = {
      id: Date.now().toString(),
      message,
      timestamp: timeString,
      type,
      resolved: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const resolveNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, resolved: true } : n));
  };

  // Upload Document Simulation (includes mock OCR computation)
  const uploadSubStageDocument = (
    moduleId: string, 
    stageId: string, 
    subStageId: string, 
    doc: Omit<DocumentRecord, 'id' | 'timestamp' | 'uploadedBy' | 'uploadedRole' | 'status'>,
    simulateOcrFailure = false
  ) => {
    const timestamp = new Date().toLocaleString();
    const documentId = 'DOC-' + Math.floor(Math.random() * 9000 + 1000);
    const uploadedBy = currentRole === 'Admin' ? 'Administrator' : `Operator (${currentRole})`;
    
    // Simulate OCR readings
    let ocrResult: 'PASS' | 'FAIL' = 'PASS';
    let ocrMeasurements: OcrMeasurement[] = [];
    let checklist: ChecklistItem[] = [];

    if (doc.isAte) {
      if (simulateOcrFailure) {
        ocrResult = 'FAIL';
        ocrMeasurements = [
          { parameter: 'ADC Voltage Ref', observed: '5.62', minLimit: '4.80', maxLimit: '5.20', unit: 'V', status: 'FAIL' },
          { parameter: 'DAC Output Linearity', observed: '0.012', minLimit: '0.000', maxLimit: '0.025', unit: '%', status: 'PASS' },
          { parameter: 'DDR4 RAM Read Speed', observed: '2133', minLimit: '1600', maxLimit: '2400', unit: 'MHz', status: 'PASS' },
          { parameter: 'BIT (Built-In Test)', observed: '80', minLimit: '100', maxLimit: '100', unit: '%', status: 'FAIL' }
        ];
        checklist = [
          { id: 'ch-adc', label: 'ADC reference voltage is within spec', checked: false },
          { id: 'ch-dac', label: 'DAC output linearity matches design constraints', checked: true },
          { id: 'ch-ram', label: 'DDR4 RAM full write/read cycle validation', checked: true },
          { id: 'ch-bit', label: 'Power-on self-test (POST) / Built-In Test passed', checked: false }
        ];
      } else {
        ocrResult = 'PASS';
        ocrMeasurements = [
          { parameter: 'ADC Voltage Ref', observed: (4.9 + Math.random() * 0.2).toFixed(2), minLimit: '4.80', maxLimit: '5.20', unit: 'V', status: 'PASS' },
          { parameter: 'DAC Output Linearity', observed: (0.01 + Math.random() * 0.01).toFixed(3), minLimit: '0.000', maxLimit: '0.025', unit: '%', status: 'PASS' },
          { parameter: 'DDR4 RAM Read Speed', observed: '2133', minLimit: '1600', maxLimit: '2400', unit: 'MHz', status: 'PASS' },
          { parameter: 'BIT (Built-In Test)', observed: '100', minLimit: '100', maxLimit: '100', unit: '%', status: 'PASS' }
        ];
        checklist = [
          { id: 'ch-adc', label: 'ADC reference voltage is within spec', checked: true },
          { id: 'ch-dac', label: 'DAC output linearity matches design constraints', checked: true },
          { id: 'ch-ram', label: 'DDR4 RAM full write/read cycle validation', checked: true },
          { id: 'ch-bit', label: 'Power-on self-test (POST) / Built-In Test passed', checked: true }
        ];
      }
    }

    const newRecord: DocumentRecord = {
      ...doc,
      id: documentId,
      timestamp,
      uploadedBy,
      uploadedRole: currentRole,
      status: 'PENDING',
      ocrResult: doc.isAte ? ocrResult : undefined,
      ocrMeasurements: doc.isAte ? ocrMeasurements : undefined,
      checklist: doc.isAte ? checklist : undefined
    };

    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id !== selectedProductId) return p;
        return {
          ...p,
          services: p.services.map(s => {
            if (s.serialNumber !== selectedSerial) return s;
            return {
              ...s,
              modules: s.modules.map(m => {
                if (m.id !== moduleId) return m;
                return {
                  ...m,
                  stages: m.stages.map(st => {
                    if (st.id !== stageId) return st;
                    return {
                      ...st,
                      subStages: st.subStages.map(sst => {
                        if (sst.id !== subStageId) return sst;
                        return {
                          ...sst,
                          status: 'pending_review',
                          documentHistory: [newRecord, ...sst.documentHistory]
                        } as SubStage;
                      })
                    } as Stage;
                  })
                } as Module;
              })
            } as ServiceUnit;
          })
        } as Product;
      });

      return recalculateProgress(updated);
    });

    addNotification(
      `${doc.isAte ? 'ATE Report' : 'Document'} uploaded for ${subStageId.replace('-', ' ').toUpperCase()} on ${selectedSerial}. Status: Pending QA.`,
      doc.isAte && ocrResult === 'FAIL' ? 'error' : 'info'
    );

    if (doc.isAte && ocrResult === 'FAIL') {
      addNotification(`OCR Alarm: Observed values out of spec on ${selectedSerial}. QC team alerted.`, 'warning');
    }
  };

  // QA Review Approval Workflow
  const reviewDocument = (
    moduleId: string, 
    stageId: string, 
    subStageId: string, 
    documentId: string, 
    status: 'APPROVED' | 'REJECTED', 
    remarks: string
  ) => {
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id !== selectedProductId) return p;
        return {
          ...p,
          services: p.services.map(s => {
            if (s.serialNumber !== selectedSerial) return s;
            return {
              ...s,
              modules: s.modules.map(m => {
                if (m.id !== moduleId) return m;
                return {
                  ...m,
                  stages: m.stages.map(st => {
                    if (st.id !== stageId) return st;
                    return {
                      ...st,
                      subStages: st.subStages.map(sst => {
                        if (sst.id !== subStageId) return sst;
                        
                        // Check if document belongs here
                        const hasDoc = sst.documentHistory.some(doc => doc.id === documentId);
                        if (!hasDoc) return sst;

                        const nextStatus: SubStage['status'] = status === 'APPROVED' ? 'completed' : 'rejected';
                        
                        // Update current sub-stage document history status
                        const updatedHist = sst.documentHistory.map(doc => {
                          if (doc.id === documentId) {
                            return { ...doc, status, remarks };
                          }
                          return doc;
                        });

                        return {
                          ...sst,
                          status: nextStatus,
                          documentHistory: updatedHist
                        } as SubStage;
                      })
                    } as Stage;
                  })
                } as Module;
              })
            } as ServiceUnit;
          })
        } as Product;
      });

      // Post-process to advance 'running' status to adjacent sub-stages
      const postProcessed = updated.map(p => {
        if (p.id !== selectedProductId) return p;
        return {
          ...p,
          services: p.services.map(s => {
            if (s.serialNumber !== selectedSerial) return s;
            return {
              ...s,
              modules: s.modules.map(m => {
                if (m.id !== moduleId) return m;
                return {
                  ...m,
                  stages: m.stages.map(st => {
                    if (st.id !== stageId) return st;
                    
                    const subStages = [...st.subStages];
                    const currentIndex = subStages.findIndex(x => x.id === subStageId);
                    
                    if (status === 'APPROVED' && currentIndex !== -1 && currentIndex < subStages.length - 1) {
                      // If the current is approved (completed), and the next is inactive, set next to running
                      const nextSub = subStages[currentIndex + 1];
                      if (nextSub.status === 'inactive') {
                        subStages[currentIndex + 1] = { ...nextSub, status: 'running' as const };
                      }
                    }

                    // If all sub-stages in a stage are completed, mark the next stage's first sub-stage as running
                    return { ...st, subStages } as Stage;
                  })
                } as Module;
              })
            } as ServiceUnit;
          })
        } as Product;
      });

      // Advance stage logic (e.g., if IGQA is completely done, start Assembly)
      const stageAdvanced = postProcessed.map(p => {
        if (p.id !== selectedProductId) return p;
        return {
          ...p,
          services: p.services.map(s => {
            if (s.serialNumber !== selectedSerial) return s;
            return {
              ...s,
              modules: s.modules.map(m => {
                const stages = [...m.stages];
                for (let i = 0; i < stages.length - 1; i++) {
                  const currentStageAllDone = stages[i].subStages.every(ss => ss.status === 'completed');
                  const nextStageAllInactive = stages[i+1].subStages.every(ss => ss.status === 'inactive');
                  
                  if (currentStageAllDone && nextStageAllInactive) {
                    // Activate first sub-stage of next stage
                    stages[i+1] = {
                      ...stages[i+1],
                      subStages: stages[i+1].subStages.map((ss, idx) => idx === 0 ? { ...ss, status: 'running' as const } : ss)
                    } as Stage;
                  }
                }
                return { ...m, stages } as Module;
              })
            } as ServiceUnit;
          })
        } as Product;
      });

      return recalculateProgress(stageAdvanced);
    });

    // Notify user
    const badgeText = status === 'APPROVED' ? 'Approved' : 'Rejected';
    const notifType = status === 'APPROVED' ? 'success' : 'error';
    addNotification(
      `QA review: ${subStageId.replace('-', ' ').toUpperCase()} has been ${badgeText} for ${selectedSerial}.`,
      notifType
    );

    if (status === 'REJECTED') {
      addNotification(`Rejection Notification sent to ${stageId.toUpperCase()} Team. Remarks: "${remarks}"`, 'warning');
    }
  };

  // Admin config
  const addProduct = (name: string) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newProduct: Product = {
      id,
      name,
      progress: 0,
      modulesCount: 2,
      services: [
        {
          serialNumber: 'SN001',
          progress: 0,
          modules: [
            { id: 'mod-1', name: 'Standard Controller', progress: 0, stages: createInitialStages() },
            { id: 'mod-2', name: 'Power Unit', progress: 0, stages: createInitialStages() }
          ]
        }
      ]
    };
    setProducts(prev => [...prev, newProduct]);
    addNotification(`Config: New product ${name} added to Master.`, 'info');
  };

  const addServiceToProduct = (productId: string, serial: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      // Copy modules from the first service unit as a template
      const baseModules = p.services[0]?.modules || [
        { id: 'mod-1', name: 'Standard Controller', progress: 0, stages: createInitialStages() }
      ];
      // Reset stages to initial
      const freshModules = baseModules.map(m => ({
        ...m,
        progress: 0,
        stages: createInitialStages()
      }));

      return {
        ...p,
        services: [...p.services, { serialNumber: serial, progress: 0, modules: freshModules }]
      };
    }));
    addNotification(`Config: Added service ${serial} to ${productId.toUpperCase()}.`, 'info');
  };

  const addModuleToProduct = (productId: string, name: string) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        modulesCount: p.modulesCount + 1,
        services: p.services.map(s => {
          const newModule: Module = {
            id,
            name,
            progress: 0,
            stages: createInitialStages()
          };
          return {
            ...s,
            modules: [...s.modules, newModule]
          };
        })
      };
    }));
    addNotification(`Config: Added module ${name} to product ${productId.toUpperCase()}.`, 'info');
  };

  const addSubStageToStage = (productId: string, moduleId: string, stageId: string, name: string, isAte: boolean) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        services: p.services.map(s => ({
          ...s,
          modules: s.modules.map(m => {
            if (m.id !== moduleId) return m;
            return {
              ...m,
              stages: m.stages.map(st => {
                if (st.id !== stageId) return st;
                return {
                  ...st,
                  subStages: [...st.subStages, { id, name, status: 'inactive' as const, isAte, documentHistory: [] }]
                } as Stage;
              })
            } as Module;
          })
        }))
      } as Product;
    }));
    addNotification(`Config: Sub-stage "${name}" added to ${stageId.toUpperCase()}${isAte ? ' [ATE]' : ''}.`, 'info');
  };

  const toggleSubStageAte = (productId: string, moduleId: string, stageId: string, subStageId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        services: p.services.map(s => ({
          ...s,
          modules: s.modules.map(m => {
            if (m.id !== moduleId) return m;
            return {
              ...m,
              stages: m.stages.map(st => {
                if (st.id !== stageId) return st;
                return {
                  ...st,
                  subStages: st.subStages.map(ss =>
                    ss.id === subStageId ? { ...ss, isAte: !ss.isAte } : ss
                  )
                } as Stage;
              })
            } as Module;
          })
        }))
      } as Product;
    }));
  };

  const renameSubStage = (productId: string, moduleId: string, stageId: string, subStageId: string, newName: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        services: p.services.map(s => ({
          ...s,
          modules: s.modules.map(m => {
            if (m.id !== moduleId) return m;
            return {
              ...m,
              stages: m.stages.map(st => {
                if (st.id !== stageId) return st;
                return {
                  ...st,
                  subStages: st.subStages.map(ss =>
                    ss.id === subStageId ? { ...ss, name: newName } : ss
                  )
                } as Stage;
              })
            } as Module;
          })
        }))
      } as Product;
    }));
  };

  // Sync state between selected service and module lists
  useEffect(() => {
    const product = products.find(p => p.id === selectedProductId);
    if (product) {
      const service = product.services.find(s => s.serialNumber === selectedSerial) || product.services[0];
      if (service) {
        setSelectedSerial(service.serialNumber);
        const mod = service.modules.find(m => m.id === selectedModuleId) || service.modules[0];
        if (mod) {
          setSelectedModuleId(mod.id);
        }
      }
    }
  }, [selectedProductId, products]);

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        currentRole,
        setCurrentRole,
        theme,
        setTheme,
        products,
        selectedProductId,
        setSelectedProductId,
        selectedSerial,
        setSelectedSerial,
        selectedModuleId,
        setSelectedModuleId,
        selectedStageId,
        setSelectedStageId,
        selectedSubStageId,
        setSelectedSubStageId,
        notifications,
        addNotification,
        resolveNotification,
        uploadSubStageDocument,
        reviewDocument,
        addProduct,
        addServiceToProduct,
        addModuleToProduct,
        addSubStageToStage,
        toggleSubStageAte,
        renameSubStage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
