export interface Dashboard {
  authorities: DashboardAuthority[];
  controlGroups: DashboardControlGroup[];
  ungroupedControls: DashboardControl[];
}

export interface DashboardAuthority {
  id: string;
  name: string;
  jurisdiction: string;
  enabled: boolean;
  createdAt: string;
  createdBy: string;
  frameworks: DashboardFramework[];
}

export interface DashboardFramework {
  id: string;
  name: string;
  shortName: string | null;
  citation: string | null;
  enabled: boolean;
  createdAt: string;
  createdBy: string;
  coverage: DashboardCoverage;
  files: DashboardFile[];
}

export interface DashboardFile {
  id: string;
  title: string;
  sourceUrl: string | null;
  versionLabel: string | null;
  publicationDate: string | null;
  createdAt: string;
  createdBy: string;
  coverage: DashboardCoverage;
  requirements: DashboardRequirement[];
}

export interface DashboardRequirement {
  id: string;
  provisionRef: string;
  heading: string | null;
  text: string | null;
  createdAt: string;
  createdBy: string;
  mappedControls: DashboardMappedControl[];
  children: DashboardRequirement[];
}

export interface DashboardCoverage {
  mapped: number;
  total: number;
}

export interface DashboardMappedControl {
  mappingId: string;
  controlId: string;
  controlRef: string;
  title: string;
  rationale: string | null;
}

export interface DashboardControlGroup {
  id: string;
  groupRef: string;
  title: string;
  createdAt: string;
  createdBy: string;
  controls: DashboardControl[];
  children: DashboardControlGroup[];
}

export interface DashboardControl {
  id: string;
  controlRef: string;
  title: string;
  statement: string | null;
  createdAt: string;
  createdBy: string;
  mappedRequirements: DashboardMappedRequirement[];
  enhancements: DashboardControl[];
}

export interface DashboardMappedRequirement {
  mappingId: string;
  requirementId: string;
  provisionRef: string;
  heading: string | null;
  fileId: string;
  fileTitle: string;
  frameworkId: string;
  frameworkName: string;
  authorityId: string;
  authorityName: string;
  rationale: string | null;
}
