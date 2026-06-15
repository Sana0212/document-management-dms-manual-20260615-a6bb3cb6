import { z } from 'zod';

export const UserSchema = z.object({
  email: z.string().email(),
  password_hash: z.string().min(1),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role_key: z.string().min(1),
  department: z.string().optional(),
  is_active: z.boolean().default(true),
  last_login_at: z.string().nullable().optional(),
  created_at: z.string().optional()
});

export const DocumentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category_id: z.string().min(1),
  folder_id: z.string().optional(),
  owner_user_id: z.string().min(1),
  status: z.string().min(1),
  tags: z.array(z.string()).optional(),
  is_confidential: z.boolean(),
  retention_policy_id: z.string().optional(),
  retention_expiry_date: z.string().nullable().optional(),
  current_version_id: z.string().optional(),
  latest_approval_id: z.string().optional(),
  can_download: z.boolean().default(true),
  created_by_user_id: z.string().optional(),
  updated_by_user_id: z.string().optional()
});

export const DocumentVersionSchema = z.object({
  document_id: z.string().min(1),
  version_number: z.number().int().positive(),
  file_path: z.string().min(1),
  file_name: z.string().min(1),
  file_size_bytes: z.number().int().nonnegative(),
  file_mime_type: z.string().min(1),
  checksum: z.string().optional(),
  uploaded_by_user_id: z.string().optional(),
  uploaded_at: z.string().optional(),
  is_current: z.boolean().default(true),
  change_notes: z.string().optional()
});

export const ApprovalSchema = z.object({
  document_id: z.string().min(1),
  requested_by_user_id: z.string().optional(),
  assigned_to_user_id: z.string().min(1),
  status: z.string().min(1),
  decision: z.string().optional(),
  decision_notes: z.string().optional(),
  decision_at: z.string().nullable().optional(),
  due_at: z.string().nullable().optional()
});

export const CategorySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  default_retention_policy_id: z.string().optional(),
  is_active: z.boolean().default(true)
});

export const FolderSchema = z.object({
  name: z.string().min(1),
  category_id: z.string().min(1),
  parent_folder_id: z.string().optional(),
  path: z.string().min(1),
  is_active: z.boolean().default(true)
});

export const RetentionPolicySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  duration_value: z.number().int().positive(),
  duration_unit: z.string().min(1),
  legal_hold_allowed: z.boolean().default(false),
  is_default: z.boolean().default(false),
  is_active: z.boolean().default(true)
});

export const DocumentPermissionSchema = z.object({
  document_id: z.string().min(1),
  user_id: z.string().optional(),
  role_key: z.string().optional(),
  can_view: z.boolean().default(true),
  can_edit: z.boolean().default(false),
  can_approve: z.boolean().default(false),
  can_download: z.boolean().default(true)
});

export const SettingSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  category: z.string().min(1),
  updated_by_user_id: z.string().optional()
});
