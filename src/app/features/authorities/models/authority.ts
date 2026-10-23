export interface Authority {
  id: string;
  name: string;
  jurisdiction: string;
  createdAt: string;
  enabled: boolean;
  createdBy: string;
}

export interface CreateAuthorityRequest {
  name: string;
  jurisdiction: string;
}
