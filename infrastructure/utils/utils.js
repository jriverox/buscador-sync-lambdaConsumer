"use strict";

module.exports = class Utils {
    static distinctInArray(array, key) {
        let result = [],
            map = new Map();

        for (const item of array) {
            if (!map.has(item[key])) {
                map.set(item[key], true);
                result.push(item);
            }
        }

        return result;
    }

    static getCountriesArray(array){
        let result = [];

        for (let j = 0; j < array.length; j++) {
            const item = array[j];
            const body = JSON.parse(item.body);

            if (!result.some((x) => x.toLocaleLowerCase() === body.country.toLocaleLowerCase())) {
                result.push(body.country);
            }
        }

        return result;
    }
}