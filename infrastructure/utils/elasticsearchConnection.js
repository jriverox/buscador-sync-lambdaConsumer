"use strict";

const Es = require("elasticsearch");
const config = require("../../config");
const Utils = require("./utils");

class ElasticsearchConnection {
    constructor() {
        if (!ElasticsearchConnection.instance) {
            this.connection = {};
            ElasticsearchConnection.instance = this;
        }
        return ElasticsearchConnection.instance;
    }

    getConnection(country) {
        let countries = this.getCluster(country).countries.join("-");
        return this.connection[countries];
    }

    getCluster(country) {
        return config.elasticSearch.clusters.find((item) => {
            return item.countries.some((x) => {
                return x.toUpperCase() === country.toUpperCase();
            });
        });
    }

    getConnectionPromiseByCountry(countries, host) {
        return new Promise((resolve, reject) => {
            try {
                if (this.connection[countries]) {
                    resolve(this.connection[countries]);
                } else {
                    this.connection[countries] = Es.Client({
                        host,
                        log: "",
                    });

                    resolve(this.connection[countries]);
                }
            } catch (error) {
                console.log(error);
                reject(error);
            }
        });
    }

    getConnectionAllPromise(countriesConnect) {
        let promise = [];
        let clusters = [];

        for (let i = 0; i < countriesConnect.length; i++) {
            const item = countriesConnect[i];

            if (config.enabledCountries.some((x) => x === item)) {
                clusters.push(this.getCluster(item));
            }
        }

        let distinct = Utils.distinctInArray(clusters, "endpoint");

        for (let i = 0; i < distinct.length; i++) {
            const item = distinct[i];

            let countries = item.countries.join("-");
            let host = item.endpoint;

            promise.push(this.getConnectionPromiseByCountry(countries, host));
        }

        return Promise.all(promise);
    }

    async createAllConnections(countries) {
        let result = false;
        await this.getConnectionAllPromise(countries).then(() => {
            console.log("all connection Elasticsearch successful..");
            result = true;
        }, () => {
            console.log("error creating connections to elasticsearch...");
        }).catch((err) => {
            console.log(err);
        });
        return result;
    }
}

let instance = new ElasticsearchConnection();
Object.freeze(instance);
module.exports = instance;