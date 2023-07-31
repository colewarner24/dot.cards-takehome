
import { Database } from 'sqlite';
import { initDatabase, getDB } from './db';
import express, {Request,Response,Application} from 'express';

const app:Application = express();

app.use(express.json()); 

(async () => {
    await initDatabase();
})();

const PORT = process.env.PORT || 8000;

app.post("/:collection", async (req:Request, res:Response):Promise<void> => {
    var db:Database = getDB()
    if (req.params.collection.length < 0) {
        res.status(404).send("no collection name given");
        return
    }
    var data = await db.run(`CREATE TABLE IF NOT EXISTS ${req.params.collection} (id INTEGER PRIMARY KEY);`);
    res.status(200).send();
});

app.get("/:collection/:id", async (req:Request, res:Response):Promise<void> => {
    var db:Database = getDB()
    var data = await db.all(`SELECT * FROM ${req.params.collection} WHERE id = ${req.params.id};`);
    if (data.length == 0 || data == undefined){
        res.status(404).send("no entry found");
        return
    }
    res.status(200).send(data)
  });

app.post("/:collection/:id", async (req:Request, res:Response):Promise<void> => {
    var db:Database = getDB();

    //get all columns
    var data = await db.all(`PRAGMA table_info(${req.params.collection})`);
    var entries = req.body
    var new_entries = JSON.parse(JSON.stringify(entries));
    var newColumns = Object.keys(entries);
    for (const col in data) {
        if (!(data[col].name.toString() in newColumns)) {
            //column is in table
            delete new_entries[data[col].name]
        }
    }

    //add new columns
    for (const col in new_entries) {
        var type:String;
        if (typeof entries[col] == "string") {
            type = "VARCHAR(255)"
        } else if (typeof entries[col] == "number") {
            type = "INTEGER"
        } else if (typeof entries[col] == "boolean") {
            type = "BOOLEAN"
        } else {
            type = "NULL"
        }
        await db.all(`ALTER TABLE ${req.params.collection} ADD COLUMN ${col} ${type};`);
    }

    //add entries to table
    var cols:string = Object.keys(entries).join(", ").toString()
    var vals:string = Object.values(entries).join("', '").toString()
    await db.all(`INSERT INTO ${req.params.collection} (${cols}) VALUES('${vals}');`);
    res.status(201).send();
});

app.delete("/:collection/:id", (req:Request, res:Response):void => {
    var db:Database = getDB();
    db.run(`DELETE FROM ${req.params.collection} WHERE id = ${req.params.id};`);
    res.status(204).send();
});


app.listen(PORT, ():void => {
    console.log(`Server Running here 👉 https://localhost:${PORT}`);
});