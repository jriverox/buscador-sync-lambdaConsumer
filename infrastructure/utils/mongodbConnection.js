"use strict";

const Mdb = require("mongodb");
const config = require("../../config");
const Utils = require("./utils");

class MongodbConnection {
    constructor() {
        if (!MongodbConnection.instance) {
            this.connection = {};
            MongodbConnection.instance = this;
        }
        return MongodbConnection.instance;
    }

    getConnection(country) {
        return this.connection[country];
    }

    getCluster(country) {
        for (let i = 0; i < config.mongodb.clusters.length; i++) {
            const item = config.mongodb.clusters[i];
            let keys = Object.keys(item.countries);
            if (keys.some((x) => x === country)) {
                return {
                    endpoint: item.endpoint,
                    country,
                    dataBase: item.countries[country]
                }
            }
        }
    }

    createConnectionPromiseByCountry(country, dataBase, host) {
        return new Promise((resolve, reject) => {
            console.log(country, dataBase, host);
            try {
                if (this.connection[country]) {
                    resolve(this.connection[country]);
                } else {
                    Mdb.connect(host, { useNewUrlParser: true, useUnifiedTopology: true })
                        .then((client) => {
                            this.connection[country] = client.db(dataBase);
                            resolve(this.connection[country]);
                        }, 
                        (res) => { reject(res); })
                        .catch((err) => { reject(err); });
                }
            } catch (error) {
                console.log(error);
                reject(error);
            }
        });
    }

    getConnectionAllPromise(countries) {
        let promises = [];
        let clusters = [];
        let enabledCountries = config.enabledCountries;

        for (let i = 0; i < countries.length; i++) {
            const item = countries[i];
            if (enabledCountries.some((x) => x === item)) {
                clusters.push(this.getCluster(item));
            }
        }

        let distinct = Utils.distinctInArray(clusters, "dataBase");

        for (let i = 0; i < distinct.length; i++) {
            const item = distinct[i];
            promises.push(this.createConnectionPromiseByCountry(item.country, item.dataBase, item.endpoint));
        }

        return Promise.all(promises);
    }

    async createAllConnections(countries){
        let result = false;
        await this.getConnectionAllPromise(countries).then(() => {
            console.log("all connection mongodb successful..");
            result = true;
        }, () => {
            console.log("error creating connections to mongodb...");
        }).catch((err) => {
            console.log(err);
        });
        return result;
    }
}

let instance = new MongodbConnection();
Object.freeze(instance);
module.exports = instance;