<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Database\Seeders\KraSeeder;
use Database\Seeders\ObjectiveSeeder;
use App\Models\Kra;
use App\Models\Objective;

class SeedKrasAndObjectives extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ipcrf:seed-kras-objectives {--fresh : Delete existing KRAs and Objectives before seeding}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed standard IPCRF KRAs and Objectives';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('fresh')) {
            $this->info('Deleting existing KRAs and Objectives...');
            Objective::query()->delete();
            Kra::query()->delete();
        }

        $this->info('Seeding KRAs...');
        $this->call(KraSeeder::class);

        $this->info('Seeding Objectives...');
        $this->call(ObjectiveSeeder::class);

        $this->info('✅ Standard IPCRF KRAs and Objectives seeded successfully!');
        
        $kraCount = Kra::count();
        $objectiveCount = Objective::count();
        
        $this->info("📊 Total KRAs: {$kraCount}");
        $this->info("📊 Total Objectives: {$objectiveCount}");
    }
}
