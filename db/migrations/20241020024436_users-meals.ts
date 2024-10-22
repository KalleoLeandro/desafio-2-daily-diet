import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {     
     await knex.schema.createTable('users', (table) => {
        table.string('id').primary();
        table.string('name').notNullable();
        table.string('session_id'); 
    });
    
    await knex.schema.createTable('meals', (table) => {
        table.string('id').primary();
        table.string('id_user').notNullable(); 
        table.string('name').notNullable();
        table.string('description').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(),
        table.boolean('dietValid').notNullable(); 

        table.foreign('id_user').references('id').inTable('users').onDelete('CASCADE');
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('meals');
    await knex.schema.dropTableIfExists('users');
}