<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

/**
 * ISAT Ilagan Campus (JHS) personnel roster.
 *
 *   super-admin -> Administrative positions (Principal, Head Teachers)
 *   teacher     -> Teacher I-III (+ "No Position Indicated")
 *
 * Master Teachers are seeded separately by MasterTeacherSeeder (admin + teacher).
 *
 * Each row: [name, position, gender, status?, school?]
 *   status defaults to "Permanent", school to "ISAT-MAIN", level is "JHS".
 *
 * Accounts are matched by generated email; existing passwords are never
 * overwritten. run() removes seeded @deped.gov.ph accounts no longer on the
 * roster, but never touches anyone holding the admin role (MasterTeacherSeeder's
 * territory).
 */
class PersonnelSeeder extends Seeder
{
    private const LEVEL = 'JHS';

    /** name => email override */
    private array $emailOverrides = [
        'Mary Ann Lopez Catindig' => 'principal@deped.gov.ph',
    ];

    private array $administrative = [
        ['CATINDIG, MARY ANN LOPEZ', 'Principal IV', 'Female'],
        ['BUGARIN, ROMEO AGBUYA', 'Head Teacher III', 'Male'],
        ['CLARAVALL, STEPHALYN FENOL', 'Head Teacher III', 'Female'],
        ['DIEGO, JOHN MOLINA', 'Head Teacher IV', 'Male'],
        ['NICASIO, NORMAN TAROBAL', 'Head Teacher VI', 'Male'],
    ];

    private array $teachers = [
        ['ABADILLA, LAWRENCE CARINO', 'Teacher III', 'Male'],
        ['ADORIO, JUSTINO CABACCAN', 'Teacher III', 'Male'],
        ['AGGABAO, ABIGAIL YAP', 'Teacher I', 'Female'],
        ['AGUILAR, NESSIE CAGAYAN', 'Teacher III', 'Female'],
        ['ALLAM, BIENTHER KAY PULIDO', 'Teacher III', 'Female', 'Permanent', 'ISAT-ANNEX'],
        ['ALLARDO, MARY AL NAZARENE CABRERA', 'Teacher I', 'Female'],
        ['ALLAUIGAN, ANGELICA A.', 'Teacher I', 'Female'],
        ['AMOROSO, JESUS JR. ESCALAMBRE', 'Teacher III', 'Male'],
        ['ANDRES, AUBREY JAREN GAGNO', 'Teacher III', 'Female'],
        ['AROC, ZHALIM SEMANA', 'Teacher III', 'Male'],
        ['ASUERO, SUSAN JACOBEN', 'Teacher III', 'Female'],
        ['BATTAD, VANESSA CATUBIG', 'Teacher I', 'Female'],
        ['BAUA, MARK BRYAN BUGUINA', 'Teacher III', 'Male'],
        ['BAYUCAN, JESICA BOLIBOL', 'Teacher I', 'Female'],
        ['BOLIBOL, EFGEL GINEZ', 'Teacher I', 'Female'],
        ['CABANSAG, ANTONETTE ABANTO', 'Teacher I', 'Female'],
        ['CABELIZA, MARICHU SALIGANAN', 'Teacher III', 'Female'],
        ['CACHO, APPLE JOY CABANSAG', 'Teacher III', 'Female'],
        ['CAGAYAN, NOVELITA BASUBAS', 'Teacher III', 'Female'],
        ['CAGAYAN, ROCKY SORIANO', 'Teacher I', 'Male'],
        ['CALANTOC, WYETH', 'Teacher I', 'Male'],
        ['CAMUNGAO, CYRILLE ABAD', 'Teacher I', 'Female'],
        ['CARAGDAG, SONIA LIMON', 'Teacher III', 'Female', 'Permanent', 'ISAT-ANNEX'],
        ['CAUAN, LIRIO ANALUPA', 'Teacher III', 'Female'],
        ['CUBANGBANG, ANTONIETTA ROBLES', 'Teacher III', 'Female'],
        ['DE VERA, LEA JANE LOPEZ', 'Teacher I', 'Female'],
        ['DOMINGO, MARY JANE E.', 'Teacher III', 'Female'],
        ['DULIN, JAMAICA G.', 'Teacher I', 'Female'],
        ['DUMALAG, GEMMA VILLANUEVA', 'Teacher III', 'Female'],
        ['EUGENIO, TERESITA ALLANGAN', 'Teacher I', 'Female'],
        ['FERRER, NANETTE SALGADO', 'Teacher I', 'Female'],
        ['FISCHER, RICCI TUNGPALAN', 'Teacher III', 'Female'],
        ['GALVISO, SANNY ABAD', 'Teacher I', 'Female', 'Permanent', 'ISAT-ANNEX'],
        ['GANGAN, MARIA JONALYN DE SILVA', 'Teacher III', 'Female'],
        ['GARLITOS, APPLE JADE PELADA', 'Teacher I', 'Female'],
        ['GUILLERMO, MARICEL JARAMILLO', 'Teacher III', 'Female'],
        ['GUZMAN, SAMUEL TORRES', 'Teacher III', 'Male'],
        ['IGNACIO, GINOBIEN ARELLANO', 'Teacher I', 'Male'],
        ['JAMORA, ROBERT GUHITING', 'Teacher III', 'Male'],
        ['LACISTE, VALERIE ACOSTA', 'Teacher III', 'Female'],
        ['LAURETA, RODEL DELOS SANTOS', 'Teacher III', 'Male'],
        ['LAVERINTO, GINA JOY CARLOS', 'Teacher III', 'Female'],
        ['LUMABI, RIA EDEN AGGABAO', 'Teacher III', 'Female'],
        ['MACASADDUG, EDMAR ALEJO', 'Teacher III', 'Male'],
        ['MACASADDUG, JESSIE GANGAN', 'Teacher III', 'Female'],
        ['MACASADDUG, JULIUS ALEJO', 'Teacher III', 'Male'],
        ['MANGUIRA, MICHAEL LOVINO', 'Teacher I', 'Male'],
        ['MADULI, BABYLYN GUZMAN', 'Teacher III', 'Female'],
        ['MALABAD, BRYAN IAN ABARCA', 'Teacher III', 'Male'],
        ['MANLOD, ALBERTO JR. ABELLA', 'Teacher III', 'Male'],
        ['MARCELO, GIAN CARLO GALIZA', 'Teacher I', 'Male'],
        ['MARIANO, JOMAR ARGONZA', 'Teacher III', 'Male'],
        ['NARAG, SHARLYN ADAYA', 'Teacher III', 'Female', 'Permanent', 'ISAT-ANNEX'],
        ['NARCISO, ROSALIE SATURIO', 'Teacher III', 'Female'],
        ['NAVARRO, MARY JOY FROGOSO', 'Teacher III', 'Female'],
        ['ORTIZ, JEREMIAH SALVADOR', 'Teacher I', 'Male'],
        ['PAREDES, SHIELA QUE', 'Teacher III', 'Female'],
        ['PASCUA, REYNALIZA TALAMAYAN', 'Teacher III', 'Female'],
        ['PEREZ, MARIA VANESSA PASCUA', 'Teacher III', 'Female'],
        ['PREJILLANA, RENELYN ADORIO', 'Teacher III', 'Female'],
        ['PREZA, MAHALINDO ALEJO', 'Teacher III', 'Male'],
        ['QUERUBIN, ANGELICA PAGLINGAYEN', 'Teacher III', 'Female'],
        ['RAMOS, ADRIAN GONZALES', 'Teacher I', 'Male'],
        ['RUIZ, VINCENT PADAM', 'Teacher I', 'Male'],
        ['SABADO, REYNALDO BALAGOT', 'Teacher I', 'Male'],
        ['SALAZAR, MARCELO JR. MARTIN', 'Teacher III', 'Male'],
        ['SALVADOR, FE BALAGOT', 'Teacher III', 'Female'],
        ['TALOSIG, DAISY RAMPAS', 'Teacher III', 'Female'],
        ['TURALBA, IOLE MANGUIRA', 'Teacher III', 'Female'],
        ['UMAYAM, RODEL FERNANDO', 'Teacher III', 'Male'],
        ['ZALUN, CASILEEN JACINTO', 'Teacher I', 'Female'],
        ['QUIPO, REYMARIE ALCARAZ', 'Teacher I', 'Female', 'Not Specified'],
        ['LOPEZ, CRISTAL MAE', 'Not Indicated', 'Female'],
    ];

    public function run(): void
    {
        foreach (['super-admin', 'admin', 'teacher'] as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        $keepEmails = [];
        $usedEmails = [];
        $counts = ['super-admin' => 0, 'teacher' => 0];

        $groups = [
            'super-admin' => $this->administrative,
            'teacher' => $this->teachers,
        ];

        foreach ($groups as $role => $rows) {
            foreach ($rows as $row) {
                $name = $row[0];
                $position = $row[1];
                $gender = $row[2];
                $status = $row[3] ?? 'Permanent';
                $school = $row[4] ?? 'ISAT-MAIN';
                $level = $row[5] ?? self::LEVEL;

                $fullName = $this->humanName($name);
                $email = $this->emailOverrides[$fullName]
                    ?? $this->uniqueEmail(Str::slug($fullName, '.'), $usedEmails);
                $keepEmails[] = $email;

                [$range, $careerStage] = $this->tierFor($position);

                $user = User::firstOrNew(['email' => $email]);
                if (! $user->exists) {
                    $user->password = Hash::make('password');
                }
                $user->name = $fullName;
                $user->gender = $gender;
                $user->career_stage = $careerStage;
                $user->teacher_status = $status;
                $user->teacher_type = $status;
                $user->school_campus = $school;
                $user->level = $level;
                $user->is_active = true;
                $user->division = json_encode([
                    'position_title' => $position,
                    'position_range' => $range,
                    'career_stage' => $careerStage,
                    'level' => $level,
                    'department' => null,
                ]);
                $user->save();
                $user->syncRoles([$role]);

                $counts[$role]++;
            }
        }

        // Drop seeded @deped.gov.ph accounts that fell off the roster
        // (renamed people, removed staff). Never touch admin accounts - those
        // are Master Teachers owned by MasterTeacherSeeder. Non-seed accounts
        // (any non-deped.gov.ph email, including legacy @isat.edu.ph rows) are
        // untouched.
        $stale = User::where('email', 'like', '%@deped.gov.ph')
            ->whereNotIn('email', $keepEmails)
            ->whereDoesntHave('roles', fn ($q) => $q->where('name', 'admin'))
            ->get();

        foreach ($stale as $user) {
            $user->syncRoles([]);
            $user->delete();
        }

        $this->command->info(sprintf(
            'PersonnelSeeder: %d super-admins, %d teachers. Removed %d stale account(s).',
            $counts['super-admin'],
            $counts['teacher'],
            $stale->count(),
        ));
    }

    /** Guarantee a unique @deped.gov.ph address within this run. */
    private function uniqueEmail(string $slug, array &$used): string
    {
        $email = "{$slug}@deped.gov.ph";
        $n = 2;
        while (isset($used[$email])) {
            $email = "{$slug}{$n}@deped.gov.ph";
            $n++;
        }
        $used[$email] = true;

        return $email;
    }

    /** [position_range|null, career_stage] from an exact position title. */
    private function tierFor(string $position): array
    {
        if (str_starts_with($position, 'Master Teacher')) {
            return ['MT1 - MT2', 'Highly Proficient'];
        }
        if (str_starts_with($position, 'Head Teacher') || str_starts_with($position, 'Principal')) {
            return [null, 'Distinguished'];
        }

        // Teacher I-III and "Not Indicated"
        return ['T1 - T3', 'Beginning Towards Proficient'];
    }

    /** "SURNAME, FIRST MIDDLE" -> "First Middle Surname" (title case, hyphen aware). */
    private function humanName(string $raw): string
    {
        $raw = trim(preg_replace('/\s+/', ' ', $raw));

        if (str_contains($raw, ',')) {
            [$last, $first] = array_map('trim', explode(',', $raw, 2));
        } else {
            $parts = explode(' ', $raw);
            $last = array_pop($parts);
            $first = implode(' ', $parts);
        }

        $first = ucwords(strtolower($first), " -");
        $last = ucwords(strtolower($last), " -");

        return trim("{$first} {$last}");
    }
}
