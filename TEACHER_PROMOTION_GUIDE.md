# Teacher Promotion System - Documentation

## Overview
The Teacher Promotion System allows administrators to manage teachers and track their career progression through different professional levels.

## Database Structure

### Tables Created

1. **positions** - Stores the hierarchy of teacher ranks
   - id
   - name (Beginner, Proficient, Highly Proficient, Distinguished)
   - parent_position_id (creates hierarchy)
   - order (1, 2, 3, 4)

2. **users** (modified) - Added teacher-specific fields
   - current_position_id (FK to positions)
   - division (e.g., "Science Department")
   - teacher_type (e.g., "Full-time", "Part-time")

3. **promotions** - Audit trail of all promotions
   - user_id (teacher being promoted)
   - from_position_id
   - to_position_id
   - promoted_by (admin who approved)
   - promoted_at
   - notes

## Position Hierarchy

```
Beginner (Order 1)
    ↓
Proficient (Order 2)
    ↓
Highly Proficient (Order 3)
    ↓
Distinguished (Order 4) - Maximum Level
```

## Features

### 1. Teacher Management (CRUD)
- **Create**: Add new teachers with initial position
- **Read**: View all teachers with search and filter
- **Update**: Edit teacher information
- **Delete**: Remove teacher records (with confirmation)

### 2. Promotion System
- **Flexible Promotion**: Admins can promote teachers to any position via dropdown
  - Select from: Beginner, Proficient, Highly Proficient, Distinguished
  - Can promote or demote to any rank
  - Cannot promote to the same position (validation)
- **Audit Trail**: Every promotion is recorded with timestamp and admin who approved

### 3. Search & Filter
- Search teachers by name
- Filter by position/rank
- Paginated results

### 4. Promotion History
- View complete promotion timeline for each teacher
- See who approved each promotion
- Track promotion dates and notes

## How to Use

### Access the System
1. Login as Admin or Super Admin
2. Navigate to "Teacher Management" from the sidebar

### Add a New Teacher
1. Click "Add Teacher" button
2. Fill in:
   - Name
   - Email
   - Password
   - Initial Position (Beginner recommended)
   - Division (optional)
   - Teacher Type (optional)
3. Click "Create Teacher"

### Promote a Teacher
1. Find the teacher in the list
2. Click the promotion icon (↗️)
3. Select the new position from dropdown (all 4 ranks available)
4. Add optional notes
5. Click "Confirm Promotion"
6. System automatically:
   - Updates teacher's position
   - Creates promotion record
   - Records who approved and when

### View Promotion History
1. Click the history icon (🕐) next to a teacher
2. See complete timeline of promotions
3. View details: dates, positions, approving admin

## Validation Rules

### Promotion Logic
```php
// Check if teacher can be promoted
if (!$teacher->current_position_id) {
    return error("Teacher has no position");
}

if ($currentPosition->id === $toPosition->id) {
    return error("Cannot promote to same position");
}

// Allows promotion to any position via dropdown
```

### Position Order Validation
- Positions are ordered 1-4
- System uses order to determine next position
- Parent-child relationships maintain hierarchy

## API Endpoints

```php
// Teacher Management
GET    /admin/teachers                    - List all teachers
POST   /admin/teachers                    - Create teacher
PUT    /admin/teachers/{teacher}          - Update teacher
DELETE /admin/teachers/{teacher}          - Delete teacher

// Promotion
POST   /admin/teachers/{teacher}/promote  - Promote teacher
GET    /admin/teachers/{teacher}/promotions - View history
```

## Models & Relationships

### User Model
```php
// Relationships
currentPosition()  // BelongsTo Position
promotions()       // HasMany Promotion
approvedPromotions() // HasMany Promotion (as promoter)
```

### Position Model
```php
// Relationships
parentPosition()   // BelongsTo Position
childPositions()   // HasMany Position
users()           // HasMany User

// Methods
nextPosition()     // Get next rank
isMaxPosition()    // Check if highest rank
```

### Promotion Model
```php
// Relationships
user()            // BelongsTo User (teacher)
fromPosition()    // BelongsTo Position
toPosition()      // BelongsTo Position
promotedBy()      // BelongsTo User (admin)
```

## Seeded Data

### Positions (Auto-created)
1. Beginner (Order 1)
2. Proficient (Order 2)
3. Highly Proficient (Order 3)
4. Distinguished (Order 4)

### Test Teachers
- Teacher User (teacher@gmail.com) - Beginner position
- Test Teacher (test@example.com) - Proficient position

## Security

- Only admins and super-admins can access teacher management
- All promotions are logged with admin ID
- Cannot delete promotion history
- Position changes are tracked permanently

## Future Enhancements (Optional)

1. **Approval Workflow**: Require super-admin approval for promotions
2. **Demotion**: Add ability to demote teachers
3. **Bulk Operations**: Promote multiple teachers at once
4. **Export**: Download promotion reports
5. **Notifications**: Email teachers when promoted
6. **Requirements**: Add criteria/requirements for each position
7. **Documents**: Attach supporting documents to promotions

## Troubleshooting

### Teacher has no position
- Edit teacher and assign a position
- Default should be "Beginner"

### Cannot promote
- Check if teacher is already "Distinguished"
- Verify position hierarchy is set up correctly

### Promotion history not showing
- Check promotions table has records
- Verify relationships are loaded correctly

## Code Structure

```
app/
├── Models/
│   ├── User.php (modified)
│   ├── Position.php (new)
│   └── Promotion.php (new)
├── Http/Controllers/Admin/
│   └── TeacherManagementController.php (new)

database/
├── migrations/
│   ├── 2026_02_19_000001_create_positions_table.php
│   ├── 2026_02_19_000002_add_teacher_fields_to_users_table.php
│   └── 2026_02_19_000003_create_promotions_table.php
└── seeders/
    └── PositionSeeder.php (new)

resources/js/Pages/Admin/
├── TeacherManagement.jsx (new)
└── PromotionHistory.jsx (new)

routes/
└── admin.php (modified)
```

## Testing

### Manual Testing Checklist
- [ ] Create a new teacher
- [ ] Edit teacher information
- [ ] Search for teachers by name
- [ ] Filter teachers by position
- [ ] Promote a Beginner to Proficient
- [ ] Try to promote a Distinguished teacher (should fail)
- [ ] View promotion history
- [ ] Delete a teacher
- [ ] Check promotion audit trail

---

**Created**: February 19, 2026
**Version**: 1.0
**Author**: Kiro AI Assistant
