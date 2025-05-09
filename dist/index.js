#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { getJets, addJet, removeJet, initStorage } from './storage.js';
const program = new Command();
program
    .name('jetkeep')
    .description('A CLI tool for managing and keeping track of your jets')
    .version('1.0.0');
program
    .command('list')
    .description('List all your jets')
    .action(async () => {
    try {
        const jets = await getJets();
        console.log(chalk.blue('Your Jets:'));
        if (jets.length === 0) {
            console.log(chalk.green('✈ No jets found. Add some jets to get started!'));
            return;
        }
        jets.forEach(jet => {
            console.log(chalk.green(`✈ ${jet.name}`));
            if (jet.type)
                console.log(chalk.gray(`  Type: ${jet.type}`));
            if (jet.location)
                console.log(chalk.gray(`  Location: ${jet.location}`));
            console.log(chalk.gray(`  Added: ${new Date(jet.createdAt).toLocaleString()}`));
            console.log(); // Empty line for readability
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(chalk.red('Error listing jets:'), error.message);
        }
        else {
            console.error(chalk.red('Error listing jets:'), error);
        }
    }
});
program
    .command('add')
    .description('Add a new jet')
    .argument('<name>', 'Name of the jet')
    .option('-t, --type <type>', 'Type of jet')
    .option('-l, --location <location>', 'Where the jet is stored')
    .action(async (name, options) => {
    try {
        const jet = await addJet({
            name,
            type: options.type,
            location: options.location
        });
        console.log(chalk.blue(`Adding new jet: ${name}`));
        if (options.type) {
            console.log(chalk.gray(`Type: ${options.type}`));
        }
        if (options.location) {
            console.log(chalk.gray(`Location: ${options.location}`));
        }
        console.log(chalk.green('✅ Jet added successfully!'));
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(chalk.red('Error adding jet:'), error.message);
        }
        else {
            console.error(chalk.red('Error adding jet:'), error);
        }
    }
});
program
    .command('remove')
    .description('Remove a jet')
    .argument('<id>', 'ID of the jet to remove')
    .action(async (id) => {
    try {
        await removeJet(id);
        console.log(chalk.green(`✅ Jet with ID ${id} removed successfully!`));
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(chalk.red('Error removing jet:'), error.message);
        }
        else {
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
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(chalk.red('Error initializing storage:'), error.message);
        }
        else {
            console.error(chalk.red('Error initializing storage:'), error);
        }
    }
});
program.parse();
//# sourceMappingURL=index.js.map