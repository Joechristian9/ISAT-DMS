<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

/**
 * Seeds the ISAT Ilagan Campus teaching roster in two IPCRF rating tiers:
 *
 *   Master Teacher I-II  -> position_range "MT1 - MT2"  (rated by the Principal only)
 *   Teacher I-III        -> position_range "T1 - T3"    (rated by a Master Teacher or the Principal)
 *
 * No Position rows are created; the tier lives in the users.division JSON,
 * matching how TeacherManagementController already stores it.
 */
class SchoolRosterSeeder extends Seeder
{
    /** [position_range, career_stage] keyed by tier label. */
    private array $tiers = [
        'master_teacher' => ['MT1 - MT2', 'Highly Proficient'],
        'teacher' => ['T1 - T3', 'Beginning Towards Proficient'],
    ];

    private array $masterTeachers = [
        'BALA, ESMERALDA DELA CRUZ',
        'CUBANGBANG, ANTONIETTA ROBLES',
        'EUGENIO, JOVITO GASPAR',
        'OCAMPO, ARNLYN CUETO',
        'PASCUA, ARMANDO LITTAUA',
        'PASCUA, REJOICE CAYABA',
        'GARCIA, EDNA C.',
        'MABUTOL, DANCORIGHSON B.',
        'TUMOLVA, EZCELMAY PAPA',
        'UMENGAN, NICHAR D.',
    ];

    private array $teachers = [
        'AGUSTIN, CHAVELITA MASANGCAY',
        'CALANTOC, WYETH DALAYAP',
        'DE VERA, LEA JANE LOPEZ',
        'EDRA, IVY P.',
        'EUGENIO, TERESITA ALIANGAN',
        'GALIZA, MARIVIC B.',
        'LOZADA, EDGAR D.',
        'LUCAS, JANRIE G.',
        'MANGUIRA, MICHAEL L.',
        'ORTIZ, GLYDEL A.',
        'RUIZ, ROSEMARIE BAQUIRAN',
        'SALVADOR, JENICA M.',
        'TURQUEZA, EMIL JOEY B.',
        'ULEP, SHERWIN V.',
        'ALVARO, PRINCE ARIEL R.',
        'AYUNO, SUZETTE S.',
        'CABANG, SONNY MARK L.',
        'CABASAL, IVY C.',
        'CANGCO, RICKY MAR M.',
        'CARLOS, JESTONI B.',
        'CRISOSTOMO, MAYLEN F. A.',
        'DOMINGO, GERLE G.',
        'GANGAN, ROZAN O.',
        'MARAMAG, MARIVIC D.',
        'PALALAY, ROCKY ACE U.',
        'RIVERA, ALEX T.',
        'SARMIENTO, SONNY J.',
        'SILVA, SHERLYN D.',
        'SIMON, GARETT T.',
        'SORIANO, GERALD G.',
        'TALOSIG, JERSILA MARIE M.',
        'TURALBA, IOLE MANGUIRA',
        'ULEP, JAY-AR A.',
        'ADORNA, MARY JOY NAVARRO',
        'AGGABAO, ABIGAIL YAP',
        'AGUILAR, NESSIE CAGAYAN',
        'ALLARDO, MARY AL NAZARENE CABRERA',
        'ALVARO, MARIA ELISA T.',
        'AMOROSO, JESUS JR. E.',
        'AROC-GANGAN, ZHALIM S.',
        'BAUA, MARK BRYAN BUGUINA',
        'BAYUCAN, MICHELLE U.',
        'BAYUCAN, JESICA BOLIBUL',
        'BULAN, MARY JANE DOMINGO',
        'CAUAN, LIRIO ANALUPA',
        'CABACCAN, JANE C.',
        'DAYAG, FHELY L.',
        'DIOSO, JOAN P.',
        'FERRER, NANETTE SALGADO',
        'FISCHER, RICCI TUNGALIAN',
        'GANGAN, MARIA JONALYN DE SILVA',
        'GARLITOS, APPLE JADE PELADA',
        'LAURATA, RODEL DELOS SANTOS',
        'LUMABI, RIA EDEN AGGABAO',
        'MACASADUG, EDMAR ALEJO',
        'MARAMAG, CHRISTAL JOY I.',
        'MEDINA, ROSALINDA M.',
        'NARCISO, ROSALIE SATURIO',
        'ONG, RUBIANE D.',
        'PASCUA, REYNALIZA TALAMAYAN',
        'PEREZ, VANESSA PASCUA',
        'QUITOLA, ELIZABETH R.',
        'REYES, CHRISTINE B.',
        'ROMEO, PRINCESS CHERRENE R.',
        'SABADO, REYNALDO BALAGOT',
        'SALVADOR, FE BALA',
        'SUYU, KARLA MAE M.',
        'TALANA, JOVILYN A.',
        'TALOSIG, DAISY RAMPAS',
        'TELANG, INES D.',
        'YOSHIDA, YOSHIMITSU',
        'ZIPAGAN, ROXANNE',
    ];

    public function run(): void
    {
        $teacherRole = Role::firstOrCreate(['name' => 'teacher']);

        $seen = [];
        $usedEmails = [];
        $created = 0;
        $updated = 0;

        foreach (['master_teacher' => $this->masterTeachers, 'teacher' => $this->teachers] as $tier => $names) {
            [$range, $stage] = $this->tiers[$tier];

            foreach ($names as $raw) {
                [$fullName, $key, $first, $last] = $this->normaliseName($raw);

                if (isset($seen[$key])) {
                    continue;
                }
                $seen[$key] = true;

                $email = $this->uniqueEmail($first, $last, $usedEmails);

                $user = User::updateOrCreate(
                    ['email' => $email],
                    [
                        'name' => $fullName,
                        'password' => Hash::make('password'),
                        'career_stage' => $stage,
                        'division' => json_encode([
                            'position_range' => $range,
                            'career_stage' => $stage,
                            'department' => null,
                        ]),
                        'is_active' => true,
                    ],
                );

                $user->wasRecentlyCreated ? $created++ : $updated++;

                if (! $user->hasRole('teacher')) {
                    $user->assignRole($teacherRole);
                }
            }
        }

        $this->command->info("SchoolRosterSeeder: {$created} created, {$updated} updated.");
    }

    /**
     * "SURNAME, FIRST MIDDLE" -> ["First Middle Surname", key, "First Middle", "Surname"]
     * "FIRST M. SURNAME"      -> ["First M. Surname",       key, "First M.",    "Surname"]
     *
     * @return array{0:string,1:string,2:string,3:string}
     */
    private function normaliseName(string $raw): array
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
        $full = trim("{$first} {$last}");

        $firstGiven = strtok($first, ' ') ?: $first;
        $key = strtolower(
            preg_replace('/[^a-z\-]/i', '', $firstGiven)
            . '|'
            . preg_replace('/[^a-z\-]/i', '', $last)
        );

        return [$full, $key, $first, $last];
    }

    private function uniqueEmail(string $first, string $last, array &$used): string
    {
        $base = Str::slug("{$first} {$last}", '.');
        $email = "{$base}@isat.edu.ph";
        $n = 2;

        while (isset($used[$email])) {
            $email = "{$base}{$n}@isat.edu.ph";
            $n++;
        }

        $used[$email] = true;

        return $email;
    }
}
