/// <reference path="./typings/main/ambient/sqlite3/index.d.ts"/>
/// <reference path="./typings/main/ambient/node/node.d.ts"/>
import * as sqlite3 from "sqlite3";
import {Database} from "sqlite3";
import {Promise} from "es6-promise";
import * as fs from "fs";
import {Credentials} from "./credentials";
import {ICredentials} from "./interfaces";

let DB_PATH = "./db.db";

export class DB {
  static DB_PATH: string;

  constructor() {
    DB_PATH = DB_PATH;
  }

  static addUser(username: string, password: string) {
    console.log("Getting to db.ts");

    Credentials.hashNewCredentials(username, password)
      .then(data => {
        return this.promiseDBRun(
          "insert into users (username, salt, hashedpwd) values (?, ?, ?)",
          [data.username, data.salt, data.password]);
    })
      .catch(err => {
      console.error(err);
    });
  }

  private static promiseDBRun(sqlStatement: string, params: string[]): Promise<any> {
    let db = new Database(DB_PATH);
    return new Promise((resolve, reject) => {
      db.run(sqlStatement, params, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static setupDatabase() {
    try {
      fs.unlinkSync(DB_PATH);
    } catch (err) { }
    let db = new Database(DB_PATH);
    try {
      db.serialize(() => {
        db.run(`
          CREATE TABLE users (
          	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
          	username TEXT NOT NULL UNIQUE,
          	salt TEXT NOT NULL,
          	hashedpwd TEXT NOT NULL
          );
       `);
        db.run(`
          CREATE TABLE entries (
          	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
          	hungerscore INTEGER NOT NULL,
          	hungertext TEXT,
          	cravingscore INTEGER NOT NULL,
          	cravingtext TEXT,
          	satietyscore INTEGER NOT NULL,
          	satietytext TEXT,
          	energyscore INTEGER NOT NULL,
          	energytext TEXT,
          	wellbeingscore INTEGER NOT NULL,
          	wellbeingtext TEXT,
          	carbsscore INTEGER NOT NULL,
          	carbstext TEXT,
          	stressambool INTEGER NOT NULL,
          	stresspmbool INTEGER NOT NULL,
          	walksbool INTEGER NOT NULL,
          	movementbool INTEGER NOT NULL,
          	movementtext TEXT,
          	bedtimebool INTEGER NOT NULL,
          	bedtimetext TEXT,
          	userid INTEGER NOT NULL,
          	FOREIGN KEY(userid) REFERENCES user(id)
          );
       `);
      });
    }
    catch (err) { console.error(err); }
    finally {
      db.close();
    }
  }
}
