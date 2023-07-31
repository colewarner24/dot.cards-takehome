import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

var db:Database;

export const initDatabase = async () => {
    sqlite3.verbose()
    var filename:string = './db/main_db.db'
    db = await open({
        filename: filename,
        mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        driver: sqlite3.Database,
    })
    console.log(`Database initialized at ${filename}`)
    //await _db.run('PRAGMA foreign_keys = true')
}

export const getDB = () => {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
}