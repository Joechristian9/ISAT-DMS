# IPCRF Submissions Implementation

## Overview
This implementation provides a comprehensive IPCRF (Individual Performance Commitment and Review Form) rating system for the ISAT DMS admin panel.

## Features Implemented

### 1. Main IPCRF Submissions Table
- ✅ Search by teacher name
- ✅ Filter by Status (Draft/Submitted/Approved)
- ✅ Filter by Year
- ✅ "+ Add Rating" button for each teacher
- ✅ Columns: Teacher Name, Position, Rating, Year, Status, Actions
- ✅ Expandable rows to view rating history

### 2. Detailed IPCRF Rating Table
- ✅ Teacher name and year header
- ✅ Core Competencies section with KRA breakdown
- ✅ Table columns: KRA, Objectives, Rating (1-5), Score, Remarks
- ✅ Automatic score calculation based on weights
- ✅ Color-coded status indicators

### 3. Database Structure

#### New Table: `ipcrf_ratings`
```php
- id
- teacher_id (foreign key to users)
- rating_period (e.g., "2024-2025")
- numerical_rating (1.00 to 5.00)
- status (draft/submitted/approved)
- kra_details (JSON - stores detailed KRA ratings)
- total_score (calculated weighted average)
- remarks (text)
- created_by (foreign key to users)
- approved_by (foreign key to users)
- approved_at (timestamp)
- timestamps
```

#### KRA Details JSON Structure
```json
[
  {
    "kra_id": 1,
    "kra_name": "Content Knowledge and Pedagogy",
    "objectives": [
      {
        "objective_id": 1,
        "objective_code": "1.1.2",
        "objective_description": "...",
        "rating": 4,
        "score": 5.71
      }
    ],
    "average_rating": 4.2,
    "score": 28.55
  }
]
```

## Files Created/Modified

### New Files
1. `database/migrations/2026_02_19_100000_create_ipcrf_ratings_table.php` - Database migration
2. `app/Models/IpcrfRating.php` - Eloquent model
3. `database/seeders/IpcrfRatingSeeder.php` - Sample data seeder
4. `IPCRF_IMPLEMENTATION.md` - This documentation

### Modified Files
1. `app/Http/Controllers/Admin/IpcrfManagementController.php`
   - Added `storeRating()` method
   - Added `updateRating()` method
   - Updated `submissions()` method with filters and pagination

2. `app/Models/User.php`
   - Added `ipcrfRatings()` relationship

3. `routes/admin.php`
   - Added rating store route
   - Added rating update route

4. `resources/js/Pages/Admin/IpcrfSubmissions.jsx`
   - Complete redesign matching Teacher Management UI
   - Added search and filter functionality
   - Added expandable rows for rating history
   - Added rating form modal with KRA breakdown
   - Added view details modal

## Usage

### Running Migrations
```bash
php artisan migrate
```

### Seeding Sample Data (Optional)
```bash
php artisan db:seed --class=IpcrfRatingSeeder
```

### Accessing the Page
Navigate to: `/admin/ipcrf/submissions`

## API Endpoints

### GET `/admin/ipcrf/submissions`
- Query Parameters:
  - `search` - Search by teacher name
  - `status` - Filter by status (draft/submitted/approved)
  - `year` - Filter by rating period
- Returns: Paginated list of teachers with their IPCRF ratings

### POST `/admin/ipcrf/rating`
- Body:
  ```json
  {
    "teacher_id": 1,
    "rating_period": "2024-2025",
    "kra_details": [...],
    "remarks": "Optional remarks"
  }
  ```
- Creates a new IPCRF rating

### PUT `/admin/ipcrf/rating/{rating}`
- Body:
  ```json
  {
    "kra_details": [...],
    "remarks": "Updated remarks",
    "status": "approved"
  }
  ```
- Updates an existing IPCRF rating

## Rating Calculation Logic

1. **Objective Score** = (Rating × Weight) / 5
2. **KRA Score** = Sum of all objective scores in that KRA
3. **KRA Average Rating** = Average of all objective ratings in that KRA
4. **Total Score** = Sum of all KRA scores
5. **Numerical Rating** = Average of all objective ratings (1-5 scale)

### Example Calculation:
- **Objective 1**: Rating 4, Weight 7.14% → Score = (4 × 7.14) / 5 = 5.71
- **Objective 2**: Rating 5, Weight 7.14% → Score = (5 × 7.14) / 5 = 7.14
- **Objective 3**: Rating 4, Weight 7.14% → Score = (4 × 7.14) / 5 = 5.71
- **KRA Total Score**: 5.71 + 7.14 + 5.71 = 18.56
- **KRA Average Rating**: (4 + 5 + 4) / 3 = 4.33
- **Numerical Rating** (overall): Average of all objective ratings across all KRAs

## UI Features

### Status Color Coding
- **Draft**: Gray badge
- **Submitted**: Yellow badge
- **Approved**: Green badge

### Rating Scale
- 5 - Outstanding
- 4 - Very Satisfactory
- 3 - Satisfactory
- 2 - Unsatisfactory
- 1 - Poor

### Responsive Design
- Mobile-friendly layout
- Collapsible sections for better mobile experience
- Consistent with existing ISAT DMS theme

## Future Enhancements (Not Implemented)

1. **Export Functionality**
   - PDF export of individual ratings
   - Excel export of all ratings
   - Bulk export options

2. **Advanced Features**
   - Email notifications on status changes
   - Rating approval workflow
   - Historical comparison charts
   - Performance analytics dashboard

3. **Permissions**
   - Role-based access control for rating creation
   - Separate permissions for draft/submit/approve

## Notes

- The system uses the existing KRA and Objectives structure
- Ratings are stored as JSON for flexibility
- All calculations are done automatically
- The UI matches the existing Teacher Management design
- Background watermark maintained for consistency
