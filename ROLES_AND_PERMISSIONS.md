# Roles and Permissions System

This application uses Spatie Laravel Permission package with an approval workflow system.

## Login Credentials

All users (teachers, admins, super-admin) use the same login page at `/login`.

### Teacher Login
- URL: `/login`
- Credentials:
  - `teacher@example.com` / `teacher123`
  - `test@example.com` / `password`
- Redirects to: `/teacher/dashboard`

### Admin Login
- URL: `/login`
- Credentials:
  - `admin1@gmail.com` / `admin123`
  - `admin2@gmail.com` / `admin123`
  - `admin3@gmail.com` / `admin123`
- Redirects to: `/admin/dashboard`

### Super Admin Login
- URL: `/login`
- Credentials:
  - `superadmin@gmail.com` / `superadmin123`
- Redirects to: `/admin/dashboard`

## Roles

### 1. Teacher
- Regular users who are teachers
- Have their own separate UI
- Can perform their own actions without approval
- Login: `teacher@example.com` / `teacher123` or `test@example.com` / `password`

### 2. Admin
- 3 admin users
- Share the same UI as Super Admin
- **All actions require Super Admin approval**
- Cannot execute create/update/delete operations directly
- Login: `admin1@gmail.com`, `admin2@gmail.com`, `admin3@gmail.com` / `admin123`

### 3. Super Admin
- 1 super admin user
- Same UI as Admin
- Can execute all actions directly without approval
- Can approve or reject pending actions from Admins
- Login: `superadmin@gmail.com` / `superadmin123`

## Database Structure

### Users Table
- All users (teachers, admins, super admin) are stored in the `users` table
- Roles are managed by Spatie Permission package

### Pending Actions Table
- Stores all actions initiated by Admins that need Super Admin approval
- Fields:
  - `user_id`: Admin who initiated the action
  - `action_type`: create, update, delete
  - `model_type`: The model class name
  - `model_id`: ID of the model (for update/delete)
  - `data`: JSON data for the action
  - `status`: pending, approved, rejected
  - `reviewed_by`: Super Admin who reviewed
  - `reviewed_at`: Timestamp of review
  - `rejection_reason`: Reason if rejected

## Usage

### For Models That Need Approval

Add the `RequiresApproval` trait to your model:

```php
use App\Traits\RequiresApproval;

class YourModel extends Model
{
    use RequiresApproval;
}
```

Then use these methods in your controllers:

```php
// Create with approval
YourModel::createWithApproval($data);

// Update with approval
$model->updateWithApproval($data);

// Delete with approval
$model->deleteWithApproval();
```

### Approval Service

The `ApprovalService` handles the approval workflow:

```php
use App\Services\ApprovalService;

$approvalService = new ApprovalService();

// Check if current user needs approval
if ($approvalService->needsApproval()) {
    // User is admin, create pending action
}

// Approve action (Super Admin only)
$approvalService->approve($pendingAction);

// Reject action (Super Admin only)
$approvalService->reject($pendingAction, 'Reason for rejection');
```

## Routes

### Admin Routes
- `GET /admin/login` - Admin login page
- `POST /admin/login` - Admin login
- `GET /admin/dashboard` - Admin dashboard (both admin and super-admin)
- `POST /admin/logout` - Logout
- `GET /admin/my-actions` - View my pending actions (for admins)

### Super Admin Only Routes
- `GET /admin/pending-actions` - View all pending actions
- `POST /admin/pending-actions/{id}/approve` - Approve action
- `POST /admin/pending-actions/{id}/reject` - Reject action

## Middleware

- `admin` - Allows both admin and super-admin roles
- `super-admin` - Only super-admin role
- `teacher` - Only teacher role

## User Helper Methods

```php
// Check roles
$user->isTeacher();
$user->isAdmin();
$user->isSuperAdmin();
$user->isAnyAdmin(); // true for both admin and super-admin
```

## Migration Commands

```bash
# Fresh migration with seed
php artisan migrate:fresh --seed

# This will create:
# - 1 Super Admin: superadmin@gmail.com / superadmin123
# - 3 Admins: admin1@gmail.com, admin2@gmail.com, admin3@gmail.com / admin123
# - 2 Teachers: teacher@example.com / teacher123, test@example.com / password
```
