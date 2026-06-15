export interface User {
  id?: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role_key: string;
  department?: string;
  is_active: boolean;
  last_login_at?: string | null;
  created_at: string;
}

export interface Document {
  id?: string;
  title: string;
  description?: string;
  category_id: string;
  folder_id?: string;
  owner_user_id: string;
  status: string;
  tags?: string[];
  is_confidential: boolean;
  retention_policy_id?: string;
  retention_expiry_date?: string | null;
  current_version_id?: string;
  latest_approval_id?: string;
  can_download: boolean;
  created_by_user_id: string;
  updated_by_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id?: string;
  document_id: string;
  version_number: number;
  file_path: string;
  file_name: string;
  file_size_bytes: number;
  file_mime_type: string;
  checksum?: string;
  uploaded_by_user_id: string;
  uploaded_at: string;
  is_current: boolean;
  change_notes?: string;
}

export interface Approval {
  id?: string;
  document_id: string;
  requested_by_user_id: string;
  assigned_to_user_id: string;
  status: string;
  decision?: string;
  decision_notes?: string;
  decision_at?: string | null;
  due_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id?: string;
  name: string;
  code: string;
  description?: string;
  default_retention_policy_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id?: string;
  name: string;
  category_id: string;
  parent_folder_id?: string;
  path: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RetentionPolicy {
  id?: string;
  name: string;
  code: string;
  description?: string;
  duration_value: number;
  duration_unit: string;
  legal_hold_allowed: boolean;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentPermission {
  id?: string;
  document_id: string;
  user_id?: string;
  role_key?: string;
  can_view: boolean;
  can_edit: boolean;
  can_approve: boolean;
  can_download: boolean;
  created_at: string;
}

export interface Setting {
  id?: string;
  key: string;
  value: string;
  category: string;
  updated_at: string;
  updated_by_user_id: string;
}

// Aliases as requested
export type UserRecord = User;
export type DocumentRecord = Document;
export type DocumentVersionRecord = DocumentVersion;
export type ApprovalRecord = Approval;
export type CategoryRecord = Category;
export type FolderRecord = Folder;
export type RetentionPolicyRecord = RetentionPolicy;
export type DocumentPermissionRecord = DocumentPermission;
export type SettingRecord = Setting;
