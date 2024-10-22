import { Knex } from 'knex';

declare module 'knex/types/tables' {
    export interface Tables {
        users: {
            id : string,
            name: string,
            session_id?: string
        },
        meal: {
            id: string,
            id_users: string
            name: string,
            description: string,
            created_at: string
            dietValid: boolean
        }
    }
}

