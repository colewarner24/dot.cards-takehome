import {describe, expect, test, beforeAll} from '@jest/globals';
import {initDatabase, getDB} from './src/db';
import {Database} from 'sqlite3';
import axios from 'axios';

var db:Database;

describe('test suite', () => {

    beforeAll(async () => {
        await initDatabase();

        //reset database
        var db = getDB();
        await db.run('PRAGMA writable_schema = 1;');
        await db.run('DELETE FROM sqlite_master;');
        await db.run('PRAGMA writable_schema = 0;');
        await db.run('VACUUM;');
        await db.run('PRAGMA integrity_check;');
    });

    test('test if db exists', async () => {
        const db = await getDB();
        expect(typeof db).toBe('object');
    });

    test('post collection not present', async () => {
        const db = await getDB();
        var data = {"name":"John", "age":30, "car":null};
        var res = await axios.post('http://localhost:8000/small', data);
        expect(res.status).toBe(200);
    });

    test('post collection that already exists', async () => {
        const db = await getDB();
        var data = {"name":"John", "age":30, "car":null};
        var res = await axios.post('http://localhost:8000/small', data);
        expect(res.status).toBe(200);
    });

    test('post entry 1', async () => {
        const db = await getDB();
        var data = {id: 1, name:"John", age:30, car:null};
        var res = await axios.post('http://localhost:8000/small/1', data);
        expect(res.status).toBe(201);
    });

    test('post entry 2 auto inc', async () => {
        const db = await getDB();
        var data = {name:"Jane", age:52, car:"suburu"};
        var res = await axios.post('http://localhost:8000/small/1', data);
        expect(res.status).toBe(201);
    });

    test('post entry more columns', async () => {
        const db = await getDB();
        var data = {name:"wallace", age:23, dog:true};
        var res = await axios.post('http://localhost:8000/small/1', data);
        expect(res.status).toBe(201);
    });

    test('get entry 1', async () => {
        const db = await getDB();
        var data = {id:1, name:"John", age:30, car:"", dog: null};
        var res = await axios.get('http://localhost:8000/small/1');
        expect(res.data[0].name).toBe(data.name);
    });

    test('delete entry 1 auto inc', async () => {
        const db = await getDB();
        var data = {name:"John", age:30, car:""};
        await axios.delete('http://localhost:8000/small/1');
        try{
            //get empty entry
            var res = await axios.get('http://localhost:8000/small/1'); 
        } catch (err) {
            expect(err).toBeDefined();
        }
    });


});