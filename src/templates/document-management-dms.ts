export type TemplateFieldType = 'string' | 'number' | 'boolean' | 'timestamp' | 'reference' | 'array';

export type TemplateField = {
  key: string;
  label: string;
  type: TemplateFieldType;
  required?: boolean;
  refTable?: string;
};

export type TemplateTable = {
  key: string;
  label: string;
  order: number;
  fields: TemplateField[];
};

export const appTemplate = {
  key: 'document-management-dms',
  label: 'DocuFlow DMS',
  tables: [
    {
      key: 'users',
      label: 'Users',
      order: 10,
      fields: [
        { key: 'email', label: 'Email', type: 'string', required: true },
        { key: 'password_hash', label: 'Password Hash', type: 'string', required: true },
        { key: 'first_name', label: 'First Name', type: 'string', required: true },
        { key: 'last_name', label: 'Last Name', type: 'string', required: true },
        { key: 'role_key', label: 'Role Key', type: 'string', required: true },
        { key: 'department', label: 'Department', type: 'string', required: false },
        { key: 'is_active', label: 'Is Active', type: 'boolean', required: true },
        { key: 'last_login_at', label: 'Last Login At', type: 'timestamp', required: false },
        { key: 'created_at', label: 'Created At', type: 'timestamp', required: true }
      ]
    },
    {
      key: 'documents',
      label: 'Documents',
      order: 20,
      fields: [
        { key: 'title', label: 'Title', type: 'string', required: true },
        { key: 'description', label: 'Description', type: 'string', required: false },
        { key: 'category_id', label: 'Category', type: 'reference', required: true, refTable: 'categories' },
        { key: 'folder_id', label: 'Folder', type: 'reference', required: false, refTable: 'folders' },
        { key: 'owner_user_id', label: 'Owner User', type: 'reference', required: true, refTable: 'users' },
        { key: 'status', label: 'Status', type: 'string', required: true },
        { key: 'tags', label: 'Tags', type: 'array', required: false },
        { key: 'is_confidential', label: 'Is Confidential', type: 'boolean', required: true },
        { key: 'retention_policy_id', label: 'Retention Policy', type: 'reference', required: false, refTable: 'retention_policies' },
        { key: 'retention_expiry_date', label: 'Retention Expiry Date', type: 'timestamp', required: false },
        { key: 'current_version_id', label: 'Current Version', type: 'reference', required: false, refTable: 'document_versions' },
        { key: 'latest_approval_id', label: 'Latest Approval', type: 'reference', required: false, refTable: 'approvals' },
        { key: 'can_download', label: 'Can Download', type: 'boolean', required: true },
        { key: 'created_by_user_id', label: 'Created By User', type: 'reference', required: true, refTable: 'users' },
        { key: 'updated_by_user_id', label: 'Updated By User', type: 'reference', required: false, refTable: 'users' },
        { key: 'created_at', label: 'Created At', type: 'timestamp', required: true },
        { key: 'updated_at', label: 'Updated At', type: 'timestamp', required: true }
      ]
    },
    {
      key: 'document_versions',
      label: 'Document Versions',
      order: 30,
      fields: [
        { key: 'document_id', label: 'Document', type: 'reference', required: true, refTable: 'documents' },
        { key: 'version_number', label: 'Version Number', type: 'number', required: true },
        { key: 'file_path', label: 'File Path', type: 'string', required: true },
        { key: 'file_name', label: 'File Name', type: 'string', required: true },
        { key: 'file_size_bytes', label: 'File Size (Bytes)', type: 'number', required: true },
        { key: 'file_mime_type', label: 'File MIME Type', type: 'string', required: true },
        { key: 'checksum', label: 'Checksum', type: 'string', required: false },
        { key: 'uploaded_by_user_id', label: 'Uploaded By User', type: 'reference', required: true, refTable: 'users' },
        { key: 'uploaded_at', label: 'Uploaded At', type: 'timestamp', required: true },
        { key: 'is_current', label: 'Is Current', type: 'boolean', required: true },
        { key: 'change_notes', label: 'Change Notes', type: 'string', required: false }
      ]
    },
    {
      key: 'approvals',
      label: 'Approvals',
      order: 40,
      fields: [
        { key: 'document_id', label: 'Document', type: 'reference', required: true, refTable: 'documents' },
        { key: 'requested_by_user_id', label: 'Requested By User', type: 'reference', required: true, refTable: 'users' },
        { key: 'assigned_to_user_id', label: 'Assigned To User', type: 'reference', required: true, refTable: 'users' },
        { key: 'status', label: 'Status', type: 'string', required: true },
        { key: 'decision', label: 'Decision', type: 'string', required: false },
        { key: 'decision_notes', label: 'Decision Notes', type: 'string', required: false },
        { key: 'decision_at', label: 'Decision At', type: 'timestamp', required: false },
        { key: 'due_at', label: 'Due At', type: 'timestamp', required: false },
        { key: 'created_at', label: 'Created At', type: 'timestamp', required: true },
        { key: 'updated_at', label: 'Updated At', type: 'timestamp', required: true }
      ]
    },
    {
      key: 'categories',
      label: 'Categories',
      order: 50,
      fields: [
        { key: 'name', label: 'Name', type: 'string', required: true },
        { key: 'code', label: 'Code', type: 'string', required: true },
        { key: 'description', label: 'Description', type: 'string', required: false },
        { key: 'default_retention_policy_id', label: 'Default Retention Policy', type: 'reference', required: false, refTable: 'retention_policies' },
        { key: 'is_active', label: 'Is Active', type: 'boolean', required: true },
        { key: 'created_at', label: 'Created At', type: 'timestamp', required: true },
        { key: 'updated_at', label: 'Updated At', type: 'timestamp', required: true }
      ]
    },
    {
      key: 'folders',
      label: 'Folders',
      order: 60,
      fields: [
        { key: 'name', label: 'Name', type: 'string', required: true },
        { key: 'category_id', label: 'Category', type: 'reference', required: true, refTable: 'categories' },
        { key: 'parent_folder_id', label: 'Parent Folder', type: 'reference', required: false, refTable: 'folders' },
        { key: 'path', label: 'Path', type: 'string', required: true },
        { key: 'is_active', label: 'Is Active', type: 'boolean', required: true },
        { key: 'created_at', label: 'Created At', type: 'timestamp', required: true },
        { key: 'updated_at', label: 'Updated At', type: 'timestamp', required: true }
      ]
    },
    {
      key: 'retention_policies',
      label: 'Retention Policies',
      order: 70,
      fields: [
        { key: 'name', label: 'Name', type: 'string', required: true },
        { key: 'code', label: 'Code', type: 'string', required: true },
        { key: 'description', label: 'Description', type: 'string', required: false },
        { key: 'duration_value', label: 'Duration Value', type: 'number', required: true },
        { key: 'duration_unit', label: 'Duration Unit', type: 'string', required: true },
        { key: 'legal_hold_allowed', label: 'Legal Hold Allowed', type: 'boolean', required: true },
        { key: 'is_default', label: 'Is Default', type: 'boolean', required: true },
        { key: 'is_active', label: 'Is Active', type: 'boolean', required: true },
        { key: 'created_at', label: 'Created At', type: 'timestamp', required: true },
        { key: 'updated_at', label: 'Updated At', type: 'timestamp', required: true }
      ]
    },
    {
      key: 'document_permissions',
      label: 'Document Permissions',
      order: 80,
      fields: [
        { key: 'document_id', label: 'Document', type: 'reference', required: true, refTable: 'documents' },
        { key: 'user_id', label: 'User', type: 'reference', required: false, refTable: 'users' },
        { key: 'role_key', label: 'Role Key', type: 'string', required: false },
        { key: 'can_view', label: 'Can View', type: 'boolean', required: true },
        { key: 'can_edit', label: 'Can Edit', type: 'boolean', required: true },
        { key: 'can_approve', label: 'Can Approve', type: 'boolean', required: true },
        { key: 'can_download', label: 'Can Download', type: 'boolean', required: true },
        { key: 'created_at', label: 'Created At', type: 'timestamp', required: true }
      ]
    },
    {
      key: 'settings',
      label: 'Settings',
      order: 90,
      fields: [
        { key: 'key', label: 'Key', type: 'string', required: true },
        { key: 'value', label: 'Value', type: 'string', required: true },
        { key: 'category', label: 'Category', type: 'string', required: true },
        { key: 'updated_at', label: 'Updated At', type: 'timestamp', required: true },
        { key: 'updated_by_user_id', label: 'Updated By User', type: 'reference', required: true, refTable: 'users' }
      ]
    }
  ]
} as const;
