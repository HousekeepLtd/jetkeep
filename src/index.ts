#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { getJets, getJet, addJet, updateJet, removeJet, initStorage } from './storage.js';

interface AddOptions {
  type?: string;
  location?: string;
  status?: 'active' | 'maintenance' | 'grounded';
  notes?: string;
}

interface UpdateOptions {
  name?: string;
  type?: string;
  location?: string;
  status?: 'active' | 'maintenance' | 'grounded';
  notes?: string;
}

const program = new Command();

program
  .name('jetkeep')
  .description('A CLI tool for managing and keeping track of your jets')
  .version('1.0.0');

// Helper function to display a jet
const displayJet = (jet: any, detailed = false) => {
  const statusColors: Record<string, string> = {
    active: 'green',
    maintenance: 'yellow',
    grounded: 'red'
  };

  const statusColor = jet.status && statusColors[jet.status] ?
    (statusColors[jet.status]) :
    'blue';

  console.log(chalk.green(`✈ ${jet.name} ${jet.id ? `(ID: ${jet.id})` : ''}`));

  if (jet.type) console.log(chalk.gray(`  Type: ${jet.type}`));
  if (jet.location) console.log(chalk.gray(`  Location: ${jet.location}`));
  if (jet.status) {
    if (statusColor === 'green') console.log(chalk.green(`  Status: ${jet.status}`));
    else if (statusColor === 'yellow') console.log(chalk.yellow(`  Status: ${jet.status}`));
    else if (statusColor === 'red') console.log(chalk.red(`  Status: ${jet.status}`));
    else console.log(chalk.blue(`  Status: ${jet.status}`));
  }
  if (detailed && jet.notes) console.log(chalk.gray(`  Notes: ${jet.notes}`));
  console.log(chalk.gray(`  Added: ${new Date(jet.createdAt).toLocaleString()}`));
};

program
  .command('list')
  .description('List all your jets')
  .option('-d, --detailed', 'Show detailed information including notes')
  .action(async (options: { detailed?: boolean }) => {
    try {
      const jets = await getJets();
      console.log(chalk.blue('Your Jets:'));

      if (jets.length === 0) {
        console.log(chalk.green('✈ No jets found. Add some jets to get started!'));
        return;
      }

      jets.forEach(jet => {
        displayJet(jet, options.detailed);
        console.log(); // Empty line for readability
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('Error listing jets:'), error.message);
      } else {
        console.error(chalk.red('Error listing jets:'), error);
      }
    }
  });

program
  .command('show')
  .description('Show details for a specific jet')
  .argument('<id>', 'ID of the jet to show')
  .action(async (id: string) => {
    try {
      const jet = await getJet(id);
      console.log(chalk.blue('Jet Details:'));
      displayJet(jet, true);
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('Error showing jet:'), error.message);
      } else {
        console.error(chalk.red('Error showing jet:'), error);
      }
    }
  });

program
  .command('add')
  .description('Add a new jet')
  .argument('<name>', 'Name of the jet')
  .option('-t, --type <type>', 'Type of jet')
  .option('-l, --location <location>', 'Where the jet is stored')
  .option('-s, --status <status>', 'Status of the jet (active, maintenance, grounded)', 'active')
  .option('-n, --notes <notes>', 'Additional notes about the jet')
  .action(async (name: string, options: AddOptions) => {
    try {
      // Validate status
      if (options.status && !['active', 'maintenance', 'grounded'].includes(options.status)) {
        console.error(chalk.red('Error: Status must be one of: active, maintenance, grounded'));
        return;
      }

      const jet = await addJet({
        name,
        type: options.type,
        location: options.location,
        status: options.status as 'active' | 'maintenance' | 'grounded',
        notes: options.notes
      });

      console.log(chalk.blue(`Adding new jet: ${name}`));
      displayJet(jet, true);
      console.log(chalk.green('✅ Jet added successfully!'));
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('Error adding jet:'), error.message);
      } else {
        console.error(chalk.red('Error adding jet:'), error);
      }
    }
  });

program
  .command('update')
  .description('Update a jet')
  .argument('<id>', 'ID of the jet to update')
  .option('-n, --name <name>', 'New name for the jet')
  .option('-t, --type <type>', 'New type of jet')
  .option('-l, --location <location>', 'New location of the jet')
  .option('-s, --status <status>', 'New status (active, maintenance, grounded)')
  .option('--notes <notes>', 'New notes for the jet')
  .action(async (id: string, options: UpdateOptions) => {
    try {
      // Validate status if provided
      if (options.status && !['active', 'maintenance', 'grounded'].includes(options.status)) {
        console.error(chalk.red('Error: Status must be one of: active, maintenance, grounded'));
        return;
      }

      // Ensure at least one update field is provided
      if (!options.name && !options.type && !options.location && !options.status && options.notes === undefined) {
        console.error(chalk.red('Error: Please provide at least one field to update'));
        return;
      }

      const updates: UpdateOptions = {};
      if (options.name) updates.name = options.name;
      if (options.type) updates.type = options.type;
      if (options.location) updates.location = options.location;
      if (options.status) updates.status = options.status as 'active' | 'maintenance' | 'grounded';
      if (options.notes !== undefined) updates.notes = options.notes;

      const updatedJet = await updateJet(id, updates);

      console.log(chalk.blue(`Updating jet with ID: ${id}`));
      displayJet(updatedJet, true);
      console.log(chalk.green('✅ Jet updated successfully!'));
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('Error updating jet:'), error.message);
      } else {
        console.error(chalk.red('Error updating jet:'), error);
      }
    }
  });

program
  .command('remove')
  .description('Remove a jet')
  .argument('<id>', 'ID of the jet to remove')
  .action(async (id: string) => {
    try {
      // Get the jet first to display what will be removed
      const jet = await getJet(id);
      console.log(chalk.yellow(`Removing jet:`));
      displayJet(jet, false);

      await removeJet(id);
      console.log(chalk.green(`✅ Jet removed successfully!`));
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('Error removing jet:'), error.message);
      } else {
        console.error(chalk.red('Error removing jet:'), error);
      }
    }
  });

program
  .command('init')
  .description('Initialize the storage')
  .action(async () => {
    try {
      await initStorage();
      console.log(chalk.green('✅ Storage initialized successfully!'));
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('Error initializing storage:'), error.message);
      } else {
        console.error(chalk.red('Error initializing storage:'), error);
      }
    }
  });

program.parse();