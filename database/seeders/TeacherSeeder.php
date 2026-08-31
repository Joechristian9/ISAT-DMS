<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

/**
 * Plain teacher roster - name + position only.
 *
 * Every other profile field (gender, status, department, school, level,
 * career_stage, ...) is intentionally left null "for the mean time" and can be
 * filled in later from the admin UI or a follow-up seeder.
 *
 * Accounts are matched by generated @isat.edu.ph email; existing passwords are
 * never overwritten. This seeder only upserts - it never deletes - so it is safe
 * to run alongside PersonnelSeeder / MasterTeacherSeeder.
 *
 * Wired into DatabaseSeeder AFTER PersonnelSeeder, whose stale-account cleanup
 * would otherwise delete these rows. If you run PersonnelSeeder on its own,
 * re-run this one afterwards:
 *
 *     php artisan db:seed --class=TeacherSeeder
 */
class TeacherSeeder extends Seeder
{
    /** [name, position|null] */
    private array $teachers = [
        ['ALVARO, PRINCE ARIEL R.', 'Teacher II'],
        ['ALVARO, MARIA ELISA T.', 'Teacher III'],
        ['AQUINO, SUZETTE S.', 'Teacher III'],
        ['BAYUCAN, MICHELLE U.', 'Teacher III'],
        ['CABACCAN, JANE C.', 'Teacher III'],
        ['CABANG, SONNY MARK L.', 'Teacher III'],
        ['CABASAL, IVY C.', 'Teacher III'],
        ['CANGCO, RICKY MAR M.', 'Teacher II'],
        ['CARLOS, JESTONI B.', 'Teacher II'],
        ['CRISOSTOMO, MAYLENE A.', 'Teacher II'],
        ['DAYAG, FHELY L.', 'Teacher III'],
        ['DIOSO, JOAN P.', 'Teacher III'],
        ['DOMINGO, GERLIE G.', 'Teacher III'],
        ['EDRADA, IVY P.', 'Teacher II'],
        ['GALIZA, MARIVIC B.', 'Teacher I'],
        ['GANGAN, ROZAN O.', 'Teacher II'],
        ['LOZADA, EDGAR D.', 'Teacher II'],
        ['LUCAS, JOAN NARIE G.', 'Teacher II'],
        ['MARAMAG, CHRISTAL JOY I.', 'Teacher III'],
        ['MARAMAG, MARIVIC D.', 'Teacher II'],
        ['MEDINA, ROSALINDA M.', 'Teacher III'],
        ['ONG, RUBIANE D.', 'Teacher III'],
        ['ORTIZ, GLYDEL A.', 'Teacher I'],
        ['PALALAY, ROCKY ACE U.', 'Teacher II'],
        ['QUITOLA, ELIZABETH R.', 'Teacher III'],
        ['REYES, CHRISTINE B.', 'Teacher III'],
        ['RIVERA, ALEX T.', 'Teacher II'],
        ['ROMEO, PRINCESS CHERRENE R.', 'Teacher III'],
        ['SALVADOR, JEMAICA M.', 'Teacher I'],
        ['SARMIENTO, SONNY J.', 'Teacher II'],
        ['SILVA, SHERLYN D.', 'Teacher II'],
        ['SIMON, GARETTE T.', 'Teacher II'],
        ['SORIANO, GERALD G.', 'Teacher II'],
        ['SUYU, KARLA MAE M.', 'Teacher III'],
        ['TALANA, JOVILYN A.', 'Teacher III'],
        ['TALOSIG, JASEL MARIE M.', 'Teacher II'],
        ['TELAN, INES D.', 'Teacher III'],
        ['TURQUEZA, EMIL JOEY B.', 'Teacher II'],
        ['ULEP, JAY-AR A.', 'Teacher II'],
        ['ULEP, SHERWIN V.', 'Teacher I'],
        ['YOSHIDA, YOSHIMITSU', 'Teacher III'],
        ['ZIPAGAN, ROXANNE', 'Teacher III'],
        ['LACCAY, JOCELYN N.', null],
    ];

    /** Accounts to delete when this seeder runs (manually-created test users). */
    private array $removeEmails = [
        'prince@gmail.com',
    ];

    public function run(): void
    {
        Role::firstOrCreate(['name' => 'teacher']);

        $removed = 0;
        foreach ($this->removeEmails as $email) {
            $user = User::where('email', $email)->first();
            if ($user) {
                $user->syncRoles([]);
                $user->delete();
                $removed++;
            }
        }

        $usedEmails = [];
        $count = 0;

        foreach ($this->teachers as [$name, $position]) {
            $fullName = $this->humanName($name);
            $email = $this->uniqueEmail(Str::slug($fullName, '.'), $usedEmails);

            $user = User::firstOrNew(['email' => $email]);
            if (! $user->exists) {
                $user->password = Hash::make('password');
            }
            [$range, $careerStage] = $this->tierFor($position);

            $user->name = $fullName;
            $user->gender = null;
            $user->career_stage = $careerStage;
            $user->teacher_status = null;
            $user->teacher_type = null;
            $user->department = null;
            $user->school_campus = null;
            $user->level = null;
            $user->is_active = true;
            $user->division = json_encode([
                'position_title' => $position,
                'position_range' => $range,
                'career_stage' => $careerStage,
                'level' => null,
                'department' => null,
            ]);
            $user->save();
            $user->syncRoles(['teacher']);

            $count++;
        }

        $this->command->info("TeacherSeeder: {$count} teachers upserted, {$removed} account(s) removed.");
    }

    /**
     * [position_range|null, career_stage|null] from a Teacher I-III title.
     * Mirrors PersonnelSeeder::tierFor() so the roster lands in the same
     * RPMS rating tier. A null position leaves both null.
     */
    private function tierFor(?string $position): array
    {
        if ($position === null) {
            return [null, null];
        }

        // Teacher I-III -> "T1 - T3" / "Beginning Towards Proficient".
        return ['T1 - T3', 'Beginning Towards Proficient'];
    }

    /** Guarantee a unique @isat.edu.ph address within this run. */
    private function uniqueEmail(string $slug, array &$used): string
    {
        $email = "{$slug}@isat.edu.ph";
        $n = 2;
        while (isset($used[$email])) {
            $email = "{$slug}{$n}@isat.edu.ph";
            $n++;
        }
        $used[$email] = true;

        return $email;
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
